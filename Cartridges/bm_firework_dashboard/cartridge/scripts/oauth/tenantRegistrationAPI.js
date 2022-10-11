'use strict';
var System = require('dw/system/System');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');
const ISML = require('dw/template/ISML');
/**
 * Get the user details and assign them points.
 */
function tenantRegistrationfun(token,shortCode,tenantId)
{
	/* API Includes */
	var Site = require('dw/system/Site');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var tenantRegisterJSONObj = {};
	    tenantRegisterJSONObj.instance=tenantId;
		tenantRegisterJSONObj.description='Firework APIs for SLAS';
		tenantRegisterJSONObj.contact='Firework';
		tenantRegisterJSONObj.merchantName="Firework";
		tenantRegisterJSONObj.emailAddress="ruturaj@fireworkhq.com";
		var payLoadDetails=new Bytes(JSON.stringify(tenantRegisterJSONObj));
		var service:Service =restService.tenantRegistrationService;
		service.URL=service.URL.replace('{short_code}',shortCode);
		service.URL += '/shopper/auth-admin/v1/tenants/'+tenantId;
		var result:Result = service.call({
			'Method':"PUT",
			'token':token,
			'requestJSON':payLoadDetails
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
    tenantRegistrationfun: tenantRegistrationfun
};