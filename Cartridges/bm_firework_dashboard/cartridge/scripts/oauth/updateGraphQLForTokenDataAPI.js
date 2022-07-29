'use strict';
const ISML = require('dw/template/ISML');
const Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var guard = require('~/cartridge/scripts/guard');
var CustomObjectModel = require('bm_firework_dashboard/cartridge/models/fwCustomObjectModel.js');
var PreferencesModel = require('bm_firework_dashboard/cartridge/models/fwPreferencesModel.js');
/**
 * Get the user details and assign them points.
 */
 function updateGraphQLForTokenData()
 {
	   var preferencesModel = new PreferencesModel();
        var getFwConfigSetting=preferencesModel.getPreferences();
		 var oauthCOObj = CustomObjectMgr.getCustomObject('OauthCO',dw.system.Site.current.ID);
		 var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
		 if(oauthCOObj != null)
		 {
					   //-----------------oauth data------------------------//
						 var authTokenObjectData=JSON.parse(oauthCOObj.custom.accessTokenObject);
						 var refreshToken=authTokenObjectData.refresh_token;
						 var accessToken=authTokenObjectData.access_token;
						 var code_verifier=oauthCOObj.custom.code_verifier;
						 var code_challenge=oauthCOObj.custom.code_challenge;
						 var usid=oauthCOObj.custom.usid;
						 var code=oauthCOObj.custom.code;
						 var org_id=oauthCOObj.custom.org_id;
						 var short_code=oauthCOObj.custom.short_code;
						 var tenant_id=oauthCOObj.custom.tenant_id;
						 var site_id=dw.system.Site.current.ID;
						 var clientPwd=oauthCOObj.custom.client_secret;
						 var client_id=oauthCOObj.custom.client_id;
						 //-----------------firwork object data------------------------//
						 var businessOauthData=JSON.parse(FireworkCOObj.custom.businessOauthData);
						 var businessId=businessOauthData.businessId;
						 var businessStoreId=FireworkCOObj.custom.businessStoreId;
						 var oauthtokenData=JSON.parse(FireworkCOObj.custom.tokenData);
						 var getDashobardToken=oauthtokenData.access_token;
						 //--------------------end---------------------------------//
						var  getUniqueBMUID=getFwConfigSetting.getUniqueBMUID;
						 var getGraphQLJSONObj = {};
						 getGraphQLJSONObj.currency=getFwConfigSetting.siteCurrency;
						 getGraphQLJSONObj.siteTitle=getFwConfigSetting.siteTitle;
						 getGraphQLJSONObj.provider=getFwConfigSetting.provider;
						 getGraphQLJSONObj.siteUrl=getFwConfigSetting.getUniqueBMUID;
						 getGraphQLJSONObj.uid=getUniqueBMUID;
						 getGraphQLJSONObj.endPointUrl=getFwConfigSetting.graphQLEndpoint;
						 getGraphQLJSONObj.storeId=businessStoreId;
						 getGraphQLJSONObj.businessId=businessId;
						 getGraphQLJSONObj.refreshToken=refreshToken;
						 getGraphQLJSONObj.accessToken=accessToken;
						 getGraphQLJSONObj.org_id=org_id;
						 getGraphQLJSONObj.site_id=site_id;
						 getGraphQLJSONObj.code_verifier=code_verifier;
						 getGraphQLJSONObj.code_challenge=code_challenge;
						 getGraphQLJSONObj.client_id=client_id;
						 getGraphQLJSONObj.client_secret=clientPwd;
						 getGraphQLJSONObj.short_code=short_code;
						 getGraphQLJSONObj.tenant_id=tenant_id;
						 getGraphQLJSONObj.code=code;
						 getGraphQLJSONObj.usid=usid;
						 var getBusinessStoreObj =require('~/cartridge/scripts/oauth/updateGraphQLAPI');
						 var getBusinessStorResponse = getBusinessStoreObj.updateGraphFun(getDashobardToken,getGraphQLJSONObj);
						 var getBusinessStoreJsonObj = JSON.parse(getBusinessStorResponse);
						return getBusinessStoreJsonObj;
		 }
 }
module.exports = {
    updateGraphQLForTokenData: updateGraphQLForTokenData
};