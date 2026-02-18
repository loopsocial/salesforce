'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
const ISML = require('dw/template/ISML');
importPackage(dw.system);
importPackage(dw.util);
var PreferencesModel = require('*/cartridge/models/fwPreferencesModel.js');
/**
 * Get the user details and assign them points.
 */
function oauthRegister(){
	/* API Includes */
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var preferencesModel = new PreferencesModel();
    var getFwConfigSetting=preferencesModel.getPreferences();
	var store_domain =request.getHttpProtocol()+'://'+request.getHttpHost();
	var oauthRegisterJSONObj = {};
	// Build redirect URI and clean up BM app context
	var redirectUri = store_domain + URLUtils.url('Firework-callback').toString();
	redirectUri = redirectUri.replace(/%3b/gi, ';').replace(/%3d/gi, '=');
	redirectUri = redirectUri.replace(/;app=__bm_merchant(;site=[^\/]+)?/g, '');
		oauthRegisterJSONObj.client_name=dw.system.Site.current.ID+" Oauth App";
		oauthRegisterJSONObj.redirect_uris=[redirectUri];
		oauthRegisterJSONObj.contacts=[getFwConfigSetting.contactsEmail];
		oauthRegisterJSONObj.scope="openid";
	var restService = require('~/cartridge/scripts/init/FireWorkInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service:Service =restService.oauthRegisterService;
	service.URL += '/oauth/register';
	var payLoadDetails=new Bytes(JSON.stringify(oauthRegisterJSONObj));
	var result:Result = service.call({
		  'Method':"POST",
		  'requestJSON':payLoadDetails
		});
	if (result.isOk()) {
		var htmlSuccess = result.getObject().toString();
		return htmlSuccess;
	} else {
		var resultMessage = JSON.parse(result.errorMessage);
		ISML.renderTemplate('dashboard/errorMsg',{errorMsg:resultMessage});
		return;
	}
}

module.exports = {
		oauthRegister: oauthRegister
};