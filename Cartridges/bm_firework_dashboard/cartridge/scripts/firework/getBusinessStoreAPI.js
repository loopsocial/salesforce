'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function businessStoreFun(getAccessToken,businessId)
{

	/* API Includes */
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var restService = require('~/cartridge/scripts/init/FireWorkInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service:Service =restService.oauthBusinessStoreService;
	service.URL += '/api/bus/'+businessId+'/business_stores?page_size=50';
    var result:Result = service.call({
		  'Method':"GET",
          'token':getAccessToken
		});
	if (result.isOk()) {
		var htmlSuccess = result.getObject().toString();
		return htmlSuccess;
	} else {
		var resultMessage = JSON.parse(result.errorMessage);
	//	return resultMessage.errorMessage;
		return resultMessage;
	}
}

module.exports = {
    businessStoreFun: businessStoreFun
};