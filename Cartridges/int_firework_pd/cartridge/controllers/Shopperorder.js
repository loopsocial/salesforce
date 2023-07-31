/* global request, empty, response, dw, session */
/**
 * This controller provides integrations with the Shopperorder API.
 *
 * @module  controllers/Shopperorder
 */

'use strict';

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Logger = require('dw/system/Logger');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var OrderMgr = require('dw/order/OrderMgr');
var Transaction = require('dw/system/Transaction');
/**
 * Gets Shipping Label from the tracetrack API
 *
 * @return {Object} Object representing the shipping label
 */
server.post('Complete', server.middleware.https, function (req, res, next) {
    var Site = require('dw/system/Site');
    var Locale = require('dw/util/Locale');
    var OrderMgr = require('dw/order/OrderMgr');
    var OrderModel = require('*/cartridge/models/order');
    var data;
    var authorizationToken = request.httpHeaders['authorization'];
    try {
        data = JSON.parse(request.httpParameterMap.getRequestBodyAsString());
    } catch (e) {
        res.json({
            error: 'Wrong request'
        });
        return next();
    }
        if (empty(data) || empty(data.basketId)) {
            res.json({
                error: 'Please enter valid basket Id'
            });
            return next();
        }
        if (empty(data) || empty(data.orderStatus)) {
            res.json({
                error: 'Please enter valid order status'
            });
            return next();
        }
         var oauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
            if(oauthCOObj != null)
            {
                    var shortCode=oauthCOObj.custom.fireworkShortCode;
                    var orgId=oauthCOObj.custom.fireworkOrgId;
            }
            else
            {
                res.json({
                    error: 'Please configured FireworkOauthCO'
                });
                return next(); 
            }
     //-----------------oauth data------------------------//
     var OrderPayload={};
     OrderPayload.basketId=data.basketId;
     var shopperServiceObj =require('~/cartridge/scripts/shopper/shopperService');
     var getshopperServiceResponse = shopperServiceObj.shopperService(shortCode,orgId,authorizationToken,OrderPayload);
     var getshopperServiceJsonObj = JSON.parse(getshopperServiceResponse);
     if(!empty(getshopperServiceJsonObj.orderNo))
     {  
        var Order = OrderMgr.getOrder(getshopperServiceJsonObj.orderNo);
        try{
            Transaction.wrap(function () {
                Order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
            });
            
        }catch(e){
            res.json({
                error: "Exception occured while updating the order status after Refund Transaction"+e
            });
        }
        res.json(getshopperServiceJsonObj);
     }
     else
     {
        res.json({
            error: getshopperServiceJsonObj
        });
     }
    return next();
 //---------------------end--------------------------------------------//
});
server.post('Refund', server.middleware.https, function (req, res, next) {
    var Site = require('dw/system/Site');
    var Locale = require('dw/util/Locale');
    var OrderMgr = require('dw/order/OrderMgr');
    var OrderModel = require('*/cartridge/models/order');
    var data;
    var authorizationToken = request.httpHeaders['authorization'];
    try {
        data = JSON.parse(request.httpParameterMap.getRequestBodyAsString());
    } catch (e) {
        res.json({
            error: 'Wrong request'
        });
        return next();
    }
        if (empty(data) || empty(data.basketId)) {
            res.json({
                error: 'Please enter valid basket Id'
            });
            return next();
        }
        if (empty(data) || empty(data.orderStatus)) {
            res.json({
                error: 'Please enter valid order status'
            });
            return next();
        }
         var oauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
            if(oauthCOObj != null)
            {
                    var shortCode=oauthCOObj.custom.fireworkShortCode;
                    var orgId=oauthCOObj.custom.fireworkOrgId;
            }
            else
            {
                res.json({
                    error: 'Please configured FireworkOauthCO'
                });
                return next(); 
            }
     //-----------------oauth data------------------------//
     var OrderPayload={};
     OrderPayload.basketId=data.basketId;
     var shopperServiceObj =require('~/cartridge/scripts/shopper/shopperService');
     var getshopperServiceResponse = shopperServiceObj.shopperService(shortCode,orgId,authorizationToken,OrderPayload);
     var getshopperServiceJsonObj = JSON.parse(getshopperServiceResponse);
     if(!empty(getshopperServiceJsonObj.orderNo))
     {  
        var Order = OrderMgr.getOrder(getshopperServiceJsonObj.orderNo);
        try{
            Transaction.wrap(function () {
                Order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
            });
            
        }catch(e){
            res.json({
                error: "Exception occured while updating the order status after Refund Transaction"+e
            });
        }
        res.json(getshopperServiceJsonObj);
     }
     else
     {
        res.json({
            error: getshopperServiceJsonObj
        });
     }
    return next();
 //---------------------end--------------------------------------------//
});
module.exports = server.exports();
