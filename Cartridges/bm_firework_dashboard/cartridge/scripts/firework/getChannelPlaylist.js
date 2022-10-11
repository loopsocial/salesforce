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
            var oauthtokenData=JSON.parse(FireworkCOObj.custom.tokenData);
            var businessOauthData=JSON.parse(FireworkCOObj.custom.businessOauthData);
            var businessId=businessOauthData.businessId;
            var getAccessToken=oauthtokenData.access_token;
		}
		var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
		var service:Service =restService.getChannelPlaylistService;
		service.URL += '/api/bus/'+businessId+'/channels/'+ChannelId+'/playlists';
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
    getChannelPlayListFun: getChannelPlayListFun
};