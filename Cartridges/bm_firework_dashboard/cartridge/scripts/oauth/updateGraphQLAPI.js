'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
const ISML = require('dw/template/ISML');
var PreferencesModel = require('bm_firework_dashboard/cartridge/models/fwPreferencesModel.js');
var Locale = require('dw/util/Locale');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function updateGraphFun(getAccessToken,graphQLData)
{
		var preferencesModel = new PreferencesModel();
		var getFwConfigSetting=preferencesModel.getPreferences();
		var fwImageviewtype=getFwConfigSetting.fwImageviewtype;
		if(empty(fwImageviewtype) || fwImageviewtype == null || fwImageviewtype == 'null')
		{
			fwImageviewtype='';
		} 
		else
		{
			fwImageviewtype=fwImageviewtype.replace(/"/g, '\\"');
			
		}
		var requestLocale = getFwConfigSetting.fwLocaleId;
		if(empty(requestLocale) || requestLocale == null || requestLocale == 'null')
		{
			requestLocale='default';
		}
		var refreshToken='';var accessToken='';var code_verifier='';
		var code_challenge='';var usid='';var code='';var org_id='';
		var short_code='';var tenant_id='';var site_id='';var clientPwd='';
		var client_id='';
			code_verifier=graphQLData.code_verifier;
			code_challenge=graphQLData.code_challenge;
			usid=graphQLData.usid;
			code=graphQLData.code;
			org_id=graphQLData.org_id;
			short_code=graphQLData.short_code;
			tenant_id=graphQLData.tenant_id;
			site_id=dw.system.Site.current.ID;
			clientPwd=graphQLData.client_secret;
			client_id=graphQLData.client_id;
		    var refreshToken=graphQLData.refreshToken;
		    var accessToken=graphQLData.accessToken;
			var businessId=graphQLData.businessId;
			var currency=graphQLData.currency;
			var siteTitle=graphQLData.siteTitle;
			var provider=graphQLData.provider;
			var siteUrl=graphQLData.siteUrl;
			var uid=graphQLData.uid;
			var endPointUrl=graphQLData.endPointUrl;
			var storeId=graphQLData.storeId;
	/* API Includes */
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var query = '{"query":"mutation {updateBusinessStore(storeId: \\"'+ storeId +'\\", updateBusinessStoreInput: {businessId: \\"'+ businessId +'\\", accessToken: \\"'+ accessToken +'\\", imageViewTypes:[' + fwImageviewtype + '] , siteLocaleId: \\"' + requestLocale + '\\", metadata: \\"{\\\\\\"short_code\\\\\\": \\\\\\"'+ short_code +'\\\\\\", \\\\\\"client_id\\\\\\": \\\\\\"'+ client_id +'\\\\\\", \\\\\\"site_id\\\\\\": \\\\\\"'+ site_id +'\\\\\\", \\\\\\"org_id\\\\\\": \\\\\\"'+ org_id +'\\\\\\", \\\\\\"clientPwd\\\\\\": \\\\\\"'+ clientPwd +'\\\\\\", \\\\\\"tenant_id\\\\\\": \\\\\\"'+ tenant_id +'\\\\\\", \\\\\\"code_verifier\\\\\\": \\\\\\"'+ code_verifier +'\\\\\\", \\\\\\"code_challenge\\\\\\": \\\\\\"'+ code_challenge +'\\\\\\", \\\\\\"usid\\\\\\": \\\\\\"'+ usid +'\\\\\\", \\\\\\"code\\\\\\": \\\\\\"'+ code +'\\\\\\"}\\", name: \\"'+ siteTitle +'\\"\\n    }) {... on BusinessStore {\\n\\t\\t\\t\\t\\t\\t\\t\\tid\\n\\t\\t\\t\\t\\t\\t\\t\\tname\\n\\t\\t\\t\\t\\t\\t\\t\\tprovider\\n\\t\\t\\t\\t\\t\\t\\t\\tcurrency\\n\\t\\t\\t\\t\\t\\t\\t\\turl\\n\\t\\t\\t\\t\\t\\t\\t\\taccessToken\\n\\t\\t\\t\\t\\t\\t\\t\\tuid\\n\\t\\t\\t\\t\\t\\t\\t\\trefreshToken\\n        }... on AnyError {\\n\\t\\t\\t\\t\\t\\t\\t\\tmessage\\n        }\\n    }\\n}","variables":{}}';
	var service:Service =restService.graphQLCredService;
	service.URL += '/graphiql';
	var payLoadDetails=new Bytes(query);
    var result:Result = service.call({
		  'Method':"POST",
          'token':getAccessToken,
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
    updateGraphFun: updateGraphFun
};