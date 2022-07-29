'use strict';
var System = require('dw/system/System');
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function refreshTokenfun(getAccessTokenObj)
{
	 var accessTokenJSONObj = {};
	 accessTokenJSONObj.grant_type='refresh_token';
	 accessTokenJSONObj.refresh_token=getAccessTokenObj.refresh_token;
	 var fwclientsecret=getAccessTokenObj.clientSecret;
	 var fwclientid=getAccessTokenObj.clientId;
	 var shortCode=getAccessTokenObj.shortCode;
	 var fworganizationid=getAccessTokenObj.fworganizationid;
	/* API Includes */
	var Site = require('dw/system/Site');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var key =fwclientid + ":" + fwclientsecret;
	let token =Encoding.toBase64(Bytes(key));
	var service:Service =restService.getAccessTokenService;
	service.URL=service.URL.replace('{short_code}',shortCode);
	service.URL += '/shopper/auth/v1/organizations/'+fworganizationid+'/oauth2/token';
    var result:Result = service.call({
		  'Method':"POST",
		  'token':token,
		  'requestJSON':accessTokenJSONObj
		});
	if (result.isOk()) {
		var htmlSuccess = JSON.stringify(result.getObject().toString());
		return htmlSuccess;
	} else {
		var resultMessage = JSON.parse(result.errorMessage);
	//	return resultMessage.errorMessage;
		return resultMessage;
	}
}
module.exports = {
    refreshTokenfun: refreshTokenfun
};