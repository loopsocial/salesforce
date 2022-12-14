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
function codeChallengeFun()
{
	/* API Includes */
	var Site = require('dw/system/Site');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service:Service =restService.getCodeChallengeService;
	service.URL += '/api/codeChallenge.php';
    var result:Result = service.call({
		  'Method':"GET",
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
    codeChallengeFun: codeChallengeFun
};