'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
const ISML = require('dw/template/ISML');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var CustomObjectModel = require('*/cartridge/models/fwCustomObjectModel.js');
var PreferencesModel = require('*/cartridge/models/fwPreferencesModel.js');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Update Graph QL data
 */
function sendRefundRequest(refundRequest)
{
		var Site = require('dw/system/Site');
		var URLUtils = require('dw/web/URLUtils');
		var restService = require('~/cartridge/scripts/fireworkorder/fireworkOrderService');
		var service:Service =restService.fireworkRefundService;
		service.URL += '/refundRequest';
		var payLoadDetails=new Bytes(query);
		var result:Result = service.call({
			'Method':"POST",
			'token':fwAccessToken,
			'requestJSON':payLoadDetails
		});
		return result;
}

module.exports = {
    sendRefundRequest: sendRefundRequest
};