/* global empty:false */
'use strict';
importPackage(dw.system);
importPackage(dw.catalog);
importPackage(dw.io);
importPackage(dw.util);
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');


function dateArithmetic() {
    // Todays date
    var currentDate = new Date();
    // Days parameter to milliseconds
    var days = 1000 * 60 * 60 * 24 * 1;
    var newDate = new Date(currentDate - days);
    // return the difference as a new date obj
    return newDate;
}
function exportProductQuantity(options) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Status = require('dw/system/Status');
    var PreferencesModel = require('bm_firework_dashboard/cartridge/models/fwPreferencesModel.js');
    var preferencesModel = new PreferencesModel();
    var getFwConfigSetting = preferencesModel.getPreferences();
    var inventoryRecord: dw.catalog.ProductInventoryRecord;
    var productCount = 0;
    var products;
    var product = null;
    var productStockLevel;
    var expDateFormat: String = "MM/dd/yyyy HH:mm:ss";
    var stockQuantity: Decimal;
    var site = Site.getCurrent();
    var productID = null;
    var calendar: Calendar = new Calendar();
    calendar.setTimeZone(site.getTimezone());
    var currentDate = calendar.getTime();

    try {
        var excludeProductDataObj = [];
        var i: Integer = 0;
        products = ProductMgr.queryAllSiteProducts();
        while (products.hasNext()) {
            product = products.next();
            if (product.master || !product.isOnline()) {
                continue;
            }
            inventoryRecord = product.getAvailabilityModel().getInventoryRecord();
            //If inventory record not assigned, skip the product.
            if (empty(inventoryRecord)) {
                continue;
            }
            var lastModifiedinventoryRecord = inventoryRecord.getAllocationResetDate();
            var compareDate = dateArithmetic();
            if (lastModifiedinventoryRecord > compareDate || product.lastModified > compareDate) {
                if (!empty(inventoryRecord.getStockLevel())) {
                    stockQuantity = inventoryRecord.getStockLevel().getDecimalValue();
                } else {
                    stockQuantity = 0.0;
                }
                if (!product.master && !product.productSet) {
                    if (product.getAvailabilityModel().isInStock(1)) {
                        productStockLevel = product.getAvailabilityModel().getInventoryRecord().getATS().value;
                    }
                }
                excludeProductDataObj.push({
                    product_id: product.getID()
                });
                i++;
            }
        }



        //------------------get business firework and Oauth Object----------//
        var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO', dw.system.Site.current.ID);
        if (FireworkCOObj != null) {
            //-------------------get FireworkOauthCo--------------------------//
            var FireworkOauthCO = CustomObjectMgr.getCustomObject('FireworkOauthCO', dw.system.Site.current.ID);
            //----------------------------------------------------------------//
            var client_id = FireworkOauthCO.custom.fireworkClientId;
            var fireworkBusinessStoreId = FireworkCOObj.custom.fireworkBusinessStoreId;
            var productPayloadObj = JSON.stringify(excludeProductDataObj);
            var mac: Mac = new Mac(Mac.HMAC_SHA_256);
            var sigBytes: Bytes = mac.digest(productPayloadObj, client_id);
            var JwthmacPayload: String = Encoding.toBase64(sigBytes);

            const now = new Date(Date.now()).toUTCString();
            // Convert the UTC string to a Unix timestamp in seconds
            const getTimeStamp = Math.floor(new Date(now).getTime()) + 3600;
            var restService = require('~/cartridge/scripts/init/jobInit');
            var service: Service = restService.postProductInventoryFeedService;
            service.URL += '/webhooks/salesforce/' + fireworkBusinessStoreId;
            var result: Result = service.call({
                'Method': "POST",
                'token': JwthmacPayload,
                'requestJSON': productPayloadObj,
                'timeStamp': getTimeStamp
            });
            if (result.isOk()) {
                var htmlSuccess = result.getObject().toString();
                return new Status(Status.OK, null, 'An error happened while trying to export product Quantity for Firework: ' + htmlSuccess);
            } else {
                var resultMessage = JSON.parse(result.errorMessage);
                return new Status(Status.ERROR, null, 'An error happened while trying to export product Quantity for Firework' + resultMessage);
            }
        }
        else {
            return new Status(Status.ERROR, null, 'Firework Object and Oauth data object empty');

        }
        //--------------------------end----------------------------------//
    }
    catch (e) {
        return new Status(Status.ERROR, null, 'An error happened while trying to export product Quantity for Firework: ' + e.message);
    }

    return new Status(Status.OK, null, productCount + ' products Quantity ready to send to Flow.' + currentDate);
}
exports.exportProductQuantity = exportProductQuantity;
