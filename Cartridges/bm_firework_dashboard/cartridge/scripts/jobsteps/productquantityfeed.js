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
    // Current date
    var currentDate = new Date();
    // 2 hours parameter to milliseconds (1000ms * 60sec * 60min * 2hours)
    var twoHours = 1000 * 60 * 60 * 2;
    var newDate = new Date(currentDate - twoHours);
    // return the difference as a new date obj
    return newDate;
}

function exportProductQuantity(options) {
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Status = require('dw/system/Status');
    var inventoryRecord;
    var products;
    var product = null;

    try {
        var excludeProductDataObj = [];
        var compareDate = dateArithmetic();
        var Logger = require('dw/system/Logger').getLogger('firework', 'productquantityfeed');

        Logger.info('Starting product collection, looking for products modified in the last 2 hours since: ' + compareDate);

        // Process products with memory-conscious approach
        var MAX_MODIFIED_PRODUCTS = 15000; // Stop after finding 15000 modified products
        var totalProcessed = 0;
        var i = 0;

        products = ProductMgr.queryAllSiteProducts();

        while (products.hasNext() && i < MAX_MODIFIED_PRODUCTS) {
            product = products.next();
            totalProcessed++;

            // Log progress every 5000 products
            if (totalProcessed % 5000 === 0) {
                Logger.info('Progress: processed ' + totalProcessed + ' products, found ' + i + ' modified products');
            }

            if (product.master || !product.isOnline()) {
                continue;
            }

            inventoryRecord = product.getAvailabilityModel().getInventoryRecord();
            if (empty(inventoryRecord)) {
                continue;
            }

            var priceModel = product.priceModel;
            var priceInfos = priceModel.priceInfos;
            var pricebooklastModifiedFlag = false;

            if (priceInfos) {
                var priceInfosItr = priceInfos.iterator();
                while (priceInfosItr.hasNext()) {
                    var priceInfo = priceInfosItr.next();
                    var getLastModified = priceInfo.priceBook.getLastModified();
                    if (getLastModified > compareDate) {
                        pricebooklastModifiedFlag = true;
                        break; // Exit early once we find a modified price
                    }
                }
            }

            var lastModifiedinventoryRecord = inventoryRecord.getAllocationResetDate();
            if (lastModifiedinventoryRecord > compareDate || product.lastModified > compareDate || pricebooklastModifiedFlag == true) {
                excludeProductDataObj.push({
                    product_id: product.getID()
                });
                i++;
            }
        }

        products.close();
        Logger.info('Product collection complete. Total processed: ' + totalProcessed + ', Modified products found: ' + excludeProductDataObj.length);

        if (excludeProductDataObj.length > 0) {
            //------------------get business firework and Oauth Object----------//
            var Logger = require('dw/system/Logger').getLogger('firework', 'productquantityfeed');

            // Try to find Firework configuration objects dynamically
            var currentSiteId = dw.system.Site.current.ID;
            var targetSiteId = currentSiteId;
            var FireworkCOObj = null;

            Logger.info('Current Site ID: ' + currentSiteId);

            // First try current site
            FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO', currentSiteId);

            // If not found, try to find in any available site
            if (FireworkCOObj == null) {
                Logger.info('FireworkCO not found in current site, searching other sites...');

                // Get all sites and try each one
                var SiteMgr = require('dw/system/SiteMgr');
                var allSites = SiteMgr.getAllSites();

                for (var siteIndex = 0; siteIndex < allSites.length; siteIndex++) {
                    var siteId = allSites[siteIndex].getID();
                    if (siteId !== currentSiteId) { // Skip current site as we already tried it
                        Logger.info('Trying site: ' + siteId);
                        FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO', siteId);
                        if (FireworkCOObj != null) {
                            targetSiteId = siteId;
                            Logger.info('Found FireworkCO in site: ' + siteId);
                            break;
                        }
                    }
                }
            }

            Logger.info('Using Site ID: ' + targetSiteId + ', FireworkCOObj found: ' + (FireworkCOObj != null));

            if (FireworkCOObj != null) {
                //-------------------get FireworkOauthCo--------------------------//
                var FireworkOauthCO = CustomObjectMgr.getCustomObject('FireworkOauthCO', targetSiteId);
                Logger.info('FireworkOauthCO found: ' + (FireworkOauthCO != null));
                //----------------------------------------------------------------//
                var client_id = FireworkOauthCO.custom.fireworkClientId;
                var fireworkBusinessStoreId = FireworkCOObj.custom.fireworkBusinessStoreId;

                // Process in batches of 1000
                var BATCH_SIZE = 1000;
                var totalBatches = Math.ceil(excludeProductDataObj.length / BATCH_SIZE);
                var successfulBatches = 0;
                var failedBatches = 0;

                Logger.info('Processing ' + excludeProductDataObj.length + ' products in ' + totalBatches + ' batches of ' + BATCH_SIZE);

                for (var batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                    var startIndex = batchIndex * BATCH_SIZE;
                    var endIndex = Math.min(startIndex + BATCH_SIZE, excludeProductDataObj.length);
                    var batch = excludeProductDataObj.slice(startIndex, endIndex);

                    var productPayloadObj = JSON.stringify(batch);
                    var mac = new Mac(Mac.HMAC_SHA_256);
                    var sigBytes = mac.digest(productPayloadObj, client_id);
                    var JwthmacPayload = Encoding.toBase64(sigBytes);

                    var now = new Date(Date.now()).toUTCString();
                    // Convert the UTC string to a Unix timestamp in seconds
                    var getTimeStamp = Math.floor(new Date(now).getTime()) + 3600;
                    var restService = require('~/cartridge/scripts/init/jobInit');
                    var service = restService.postProductInventoryFeedService;

                    // Set the complete URL for each batch (avoid appending)
                    var baseUrl = service.getURL();
                    if (baseUrl.indexOf('/webhooks/salesforce/') === -1) {
                        service.setURL(baseUrl + '/webhooks/salesforce/' + fireworkBusinessStoreId);
                    }

                    Logger.info('Sending batch ' + (batchIndex + 1) + '/' + totalBatches + ' (' + batch.length + ' products) to: ' + service.getURL());

                    var result = service.call({
                        'Method': "POST",
                        'token': JwthmacPayload,
                        'requestJSON': productPayloadObj,
                        'timeStamp': getTimeStamp
                    });

                    if (result.isOk()) {
                        successfulBatches++;
                        var htmlSuccess = result.getObject().toString();
                        Logger.info('Batch ' + (batchIndex + 1) + ' successful: ' + htmlSuccess);
                    } else {
                        failedBatches++;
                        var resultMessage = result.errorMessage;
                        Logger.error('Batch ' + (batchIndex + 1) + ' failed: ' + resultMessage);
                    }

                    // Wait 2 seconds between batches to avoid rate limiting
                    if (batchIndex < totalBatches - 1) {
                        var startTime = new Date().getTime();
                        while (new Date().getTime() - startTime < 2000) {
                            // Simple delay
                        }
                    }
                }

                // Return status based on results
                if (failedBatches === 0) {
                    return new Status(Status.OK, null, 'Successfully processed all ' + totalBatches + ' batches (' + excludeProductDataObj.length + ' products)');
                } else if (successfulBatches > 0) {
                    return new Status(Status.ERROR, null, 'Partial success: ' + successfulBatches + ' batches succeeded, ' + failedBatches + ' failed');
                } else {
                    return new Status(Status.ERROR, null, 'All ' + totalBatches + ' batches failed');
                }
            }
            else {
                return new Status(Status.ERROR, null, 'Firework Object and Oauth data object empty');
            }
        }
        else {
            return new Status(Status.OK, null, 'No products found for update in the last 2 hours');
        }
        //--------------------------end----------------------------------//
    }
    catch (e) {
        return new Status(Status.ERROR, null, 'An error happened while trying to export product Quantity for Firework: ' + e.message);
    }
}

exports.exportProductQuantity = exportProductQuantity;