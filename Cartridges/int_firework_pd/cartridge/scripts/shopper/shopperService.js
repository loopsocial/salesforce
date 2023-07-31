'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
const ISML = require('dw/template/ISML');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function shopperService(shortCode,orgId,getAccessToken,OrderPayload)
{

	/* API Includes */
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service:Service =restService.shopperOrderService;
	service.URL=service.URL.replace('{fireworkShortCode}',shortCode);
	service.URL += '/checkout/shopper-orders/v1/organizations/'+orgId+'/orders?siteId='+dw.system.Site.current.ID;
	var OrderPayload=new Bytes(JSON.stringify(OrderPayload));
    var result:Result = service.call({
		  'Method':"POST",
          'token':getAccessToken,
		  'requestJSON':OrderPayload
		});
	if (result.isOk()) {
		var htmlSuccess = result.getObject().toString();
		return htmlSuccess;
	} else {
		return result.getErrorMessage();
	}
}

module.exports = {
    shopperService: shopperService
};