'use strict';
var System = require('dw/system/System');
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
const ISML = require('dw/template/ISML');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function accessTokenFun(getAccessTokenObj)
{
 	 var code=getAccessTokenObj.code;
	var code_verifier=getAccessTokenObj.code_verifier;
	 var usid=getAccessTokenObj.usid;
	 var fwclientsecret=getAccessTokenObj.clientSecret;
	 var fwclientid=getAccessTokenObj.clientId;
	 var shortCode=getAccessTokenObj.shortCode;
	 var redirectUrl=getAccessTokenObj.redirectUrl;
	 var fworganizationid=getAccessTokenObj.fworganizationid;
	 var accessTokenJSONObj = {};
	 accessTokenJSONObj.grant_type='authorization_code_pkce';
	 accessTokenJSONObj.code=code;
	 accessTokenJSONObj.redirect_uri=redirectUrl;
	 accessTokenJSONObj.usid=usid;
	 accessTokenJSONObj.code_verifier=code_verifier;
	 accessTokenJSONObj.channel_id=dw.system.Site.current.ID;
	 accessTokenJSONObj.client_id=fwclientid;
	/* API Includes */
	var Site = require('dw/system/Site');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var key =fwclientid + ":" + fwclientsecret;
	let token =Encoding.toBase64(Bytes(key));
	var service:Service =restService.getAccessTokenService;
	service.URL=service.URL.replace('{fireworkShortCode}',shortCode);
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
		ISML.renderTemplate('oauth/errorMsg',{errorMsg:resultMessage});
        return;
	}
}
module.exports = {
    accessTokenFun: accessTokenFun
};