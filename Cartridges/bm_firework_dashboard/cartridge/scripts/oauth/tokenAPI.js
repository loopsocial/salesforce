'use strict';
var System = require('dw/system/System');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');
const ISML = require('dw/template/ISML');
/**
 * Get the user details and assign them points.
 */
function getToken(oauthConfig)
{

	/* API Includes */
	var Site = require('dw/system/Site');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service:Service =restService.getOauthTokenService;
	var key = oauthConfig.fwclientid + ":" + oauthConfig.fwclientsecret;
	let token =Encoding.toBase64(Bytes(key));
	service.URL += '/dwsso/oauth2/access_token';
    var result:Result = service.call({
		  'Method':"POST",
		  'token':token
		});
	if (result.isOk()) {
		var htmlSuccess = result.getObject().toString();
		return htmlSuccess;
	} else {
		var resultMessage = JSON.parse(result.errorMessage);
		ISML.renderTemplate('oauth/errorMsg',{errorMsg:resultMessage});
        return;
	}
}
module.exports = {
    getToken: getToken
};