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
		tenantRegisterJSONObj.scopes=["sfcc.shopper-categories", "sfcc.shopper-customers.register", "sfcc.shopper-customers.login", "sfcc.shopper-myaccount", "sfcc.shopper-myaccount.rw", "sfcc.shopper-myaccount.addresses.rw", "sfcc.shopper-myaccount.addresses", "sfcc.shopper-myaccount.baskets", "sfcc.shopper-myaccount.orders", "sfcc.shopper-myaccount.paymentinstruments.rw", "sfcc.shopper-myaccount.paymentinstruments", "sfcc.shopper-myaccount.productlists", "sfcc.shopper-myaccount.productlists.rw", "sfcc.shopper-productlists", "sfcc.shopper-promotions", "sfcc.shopper-gift-certificates", "sfcc.shopper-product-search",
		"sfcc.shopper-baskets-orders.rw", "sfcc.shopper-baskets-orders", "sfcc.shopper-products"];
	var payLoadDetails=new Bytes(JSON.stringify(tenantRegisterJSONObj));
	var service:Service =restService.privateClientidRegistrationService;
	service.URL=service.URL.replace('{fireworkShortCode}',shortCode);
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
		ISML.renderTemplate('oauth/errorMsg',{errorMsg:resultMessage});
        return;
	}
}

module.exports = {
    privateClientidRegistrationfun: privateClientidRegistrationfun
};