'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
const ISML = require('dw/template/ISML');
importPackage(dw.system);
importPackage(dw.util);
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
/**
 * Get the user details and assign them points.
 */
function getChannelListFun()
{
	/* API Includes */
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var restService = require('~/cartridge/scripts/init/FireWorkInit');
	var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
        if(FireworkCOObj != null)
        {
            var oauthRegisterData=JSON.parse(FireworkCOObj.custom.oauthData);
            var oauthtokenData=JSON.parse(FireworkCOObj.custom.tokenData);
            var businessOauthData=JSON.parse(FireworkCOObj.custom.businessOauthData);
            var businessId=businessOauthData.businessId;
            var callBackJSONObj = {};
            //-----------get refresh token and create new accesstoken-------------//
            callBackJSONObj.client_id=oauthRegisterData.client_id;
            callBackJSONObj.client_secret=oauthRegisterData.client_secret;
            callBackJSONObj.redirect_Url=oauthRegisterData.redirect_uris[0];
            callBackJSONObj.refresh_token=oauthtokenData.refresh_token;
            var callBackObj =require('~/cartridge/scripts/firework/oauthTokenAPI');
			var getcallBackResponse = callBackObj.oauthToken(callBackJSONObj);
            var getRefreshTokenResponse=JSON.parse(getcallBackResponse);
			var getAccessToken=getRefreshTokenResponse.access_token;
		}
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service:Service =restService.getChannelListService;
	service.URL += '/api/bus/'+businessId+'/channels/';
    var result:Result = service.call({
		  'Method':"GET",
          'token':getAccessToken
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
    getChannelListFun: getChannelListFun
};