'use strict';
var System = require('dw/system/System');
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function privateClientidRegistrationfun(token,tenantId,fwClientId,fwSecret,redirectUri,shortCode)
{
	/* API Includes */
	var Site = require('dw/system/Site');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var tenantRegisterJSONObj = {};
	    tenantRegisterJSONObj.clientId=fwClientId.toString();
		tenantRegisterJSONObj.name='Firework';
		tenantRegisterJSONObj.isPrivateClient=false;
		tenantRegisterJSONObj.ecomTenant=tenantId.toString();
		tenantRegisterJSONObj.secret=fwSecret.toString();
		tenantRegisterJSONObj.ecomSite=dw.system.Site.current.ID;
		tenantRegisterJSONObj.channels=[dw.system.Site.current.ID];
		tenantRegisterJSONObj.redirectUri=[redirectUri];
	var payLoadDetails=new Bytes(JSON.stringify(tenantRegisterJSONObj));
	var service:Service =restService.privateClientidRegistrationService;
	service.URL=service.URL.replace('{short_code}',shortCode);
	service.URL += '/shopper/auth-admin/v1/tenants/'+tenantId+'/clients/'+fwClientId;
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
	//	return resultMessage.errorMessage;
		return resultMessage;
	}
}

module.exports = {
    privateClientidRegistrationfun: privateClientidRegistrationfun
};