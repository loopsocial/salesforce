'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function oauthToken(getCallBackJSONObj)
{

	/* API Includes */
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var restService = require('~/cartridge/scripts/init/FireWorkInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service:Service =restService.oauthRegisterService;
	if(empty(getCallBackJSONObj.refresh_token))
	{
	service.URL += '/oauth/token?grant_type=authorization_code&redirect_uri='+getCallBackJSONObj.redirect_Url+'&client_id='+getCallBackJSONObj.client_id+'&client_secret='+getCallBackJSONObj.client_secret+'&code='+getCallBackJSONObj.code;
	}
	else
	{
	service.URL +='/oauth/token?grant_type=refresh_token&client_id='+getCallBackJSONObj.client_id+'&redirect_uri='+getCallBackJSONObj.redirect_Url+'&refresh_token='+getCallBackJSONObj.refresh_token;	
	}
    var result:Result = service.call({
		  'Method':"POST"
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
    oauthToken: oauthToken
};