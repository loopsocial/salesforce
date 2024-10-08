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
            var oauthRegisterData=JSON.parse(FireworkCOObj.custom.fireworkOauthData);
            var oauthtokenData=JSON.parse(FireworkCOObj.custom.fireworkTokenData);
            var businessOauthData=JSON.parse(FireworkCOObj.custom.fireworkBusinessOauthData);
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
	var allChannels = [];
    var nextPageUrl = '/api/bus/'+businessId+'/channels/';
	var originalURL = service.URL;

	do {

		service.URL = originalURL + nextPageUrl;
		var result:Result = service.call({
			'Method':"GET",
			'token':getAccessToken
		  });

		  if (result.isOk()) {
			var response = JSON.parse(result.getObject().toString());
            if (response.channels && Array.isArray(response.channels)) {
                allChannels = allChannels.concat(response.channels);
            }

            // Check if there is a next page
            if (response.paging && response.paging.next) {
                nextPageUrl = response.paging.next;
            } else {
                nextPageUrl = null;
            }
        } else { 
			var resultMessage = JSON.parse(result.errorMessage);
			ISML.renderTemplate('dashboard/errorMsg',{errorMsg:resultMessage});
			return; 
        }

	}while(nextPageUrl);
 
	var combinedChannels = {
		channels: allChannels
		};
		
	return JSON.stringify(combinedChannels); 
}

module.exports = {
    getChannelListFun: getChannelListFun
};