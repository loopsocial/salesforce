'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
const ISML = require('dw/template/ISML');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function getChannelPlayListFun(ChannelId)
{
	/* API Includes */
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var restService = require('~/cartridge/scripts/init/FireWorkInit');
	var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
        if(FireworkCOObj != null)
        {
            var oauthtokenData=JSON.parse(FireworkCOObj.custom.fireworkTokenData);
            var businessOauthData=JSON.parse(FireworkCOObj.custom.fireworkBusinessOauthData);
            var businessId=businessOauthData.businessId;
            var getAccessToken=oauthtokenData.access_token;
		}
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service:Service =restService.getChannelPlaylistService; 
	var allPlaylists = [];
    var nextPageUrl = '/api/bus/'+businessId+'/channels/'+ChannelId+'/playlists';
	var originalURL = service.URL;

	do {
        service.URL = originalURL + nextPageUrl;
        var result = service.call({
            'Method': "GET",
            'token': getAccessToken
        });

        if (result.isOk()) {
			var response = JSON.parse(result.getObject().toString());
            if (response.playlists && Array.isArray(response.playlists)) {
                allPlaylists = allPlaylists.concat(response.playlists);
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
    } while (nextPageUrl);
  
	var combinedPlaylists = {
	playlists: allPlaylists
	};
	
    return JSON.stringify(combinedPlaylists); 
}
module.exports = {
    getChannelPlayListFun: getChannelPlayListFun
};