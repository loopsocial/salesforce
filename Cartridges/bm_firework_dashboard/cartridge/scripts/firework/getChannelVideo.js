'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
importPackage(dw.system);
importPackage(dw.util);
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
/**
 * Get the user details and assign them points.
 */
function getChannelVideoFun(ChannelId,playlistID)
{
	/* API Includes */
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var restService = require('~/cartridge/scripts/init/FireWorkInit');
	var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
        if(FireworkCOObj != null)
        {
            var oauthtokenData=JSON.parse(FireworkCOObj.custom.tokenData);
            var businessOauthData=JSON.parse(FireworkCOObj.custom.businessOauthData);
            var businessId=businessOauthData.businessId;
            var getAccessToken=oauthtokenData.access_token;
		}
		var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
		var service:Service =restService.getChannelVideoService;
		if(playlistID)
		{
		service.URL += '/api/bus/'+businessId+'/channels/'+ChannelId+'/playlists/'+playlistID+'/videos';
		}
		else
		{
		service.URL += '/api/bus/'+businessId+'/videos?channel_id='+ChannelId;
		}
    	var result:Result = service.call({
		  'Method':"GET",
          'token':getAccessToken
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
    getChannelVideoFun: getChannelVideoFun
};