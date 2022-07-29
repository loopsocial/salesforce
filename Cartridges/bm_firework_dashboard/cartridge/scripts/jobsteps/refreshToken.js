'use strict';
var Status = require('dw/system/Status');
const ISML = require('dw/template/ISML');
const Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var guard = require('~/cartridge/scripts/guard');
var CustomObjectModel = require('bm_firework_dashboard/cartridge/models/fwCustomObjectModel.js');
var PreferencesModel = require('bm_firework_dashboard/cartridge/models/fwPreferencesModel.js');

/**
 * The main function.
 *
 * @returns {dw.system.Status} The exit status for the job step
 */
var run = function run() {
		var preferencesModel = new PreferencesModel();
		var getFwConfigSetting=preferencesModel.getPreferences();
        var oauthCOObj = CustomObjectMgr.getCustomObject('OauthCO',dw.system.Site.current.ID);
        var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
		 if(oauthCOObj != null && FireworkCOObj!=null)
		 {
			 		try {
						 //------------update refresh token for update graphQL data-------------//
						 var oauthRegisterData=JSON.parse(FireworkCOObj.custom.oauthData);
						 var oauthtokenData=JSON.parse(FireworkCOObj.custom.tokenData);
						 var callBackJSONObj = {};
						 //-----------get refresh token and create new accesstoken-------------//
						 callBackJSONObj.client_id=oauthRegisterData.client_id;
						 callBackJSONObj.client_secret=oauthRegisterData.client_secret;
						 callBackJSONObj.redirect_Url=oauthRegisterData.redirect_uris[0];
						 callBackJSONObj.refresh_token=oauthtokenData.refresh_token;
						
						 var callBackObj =require('~/cartridge/scripts/firework/oauthTokenAPI');
						 try {
								 var getcallBackResponse = callBackObj.oauthToken(callBackJSONObj);
								 var getRefreshTokenResponse=JSON.parse(getcallBackResponse);
								 Transaction.begin();
								 FireworkCOObj.custom.tokenData=getcallBackResponse;
								 Transaction.commit(); 
								//---------------------------end--------------------------------------//
								var getTokenJSONObj = {};
								var authTokenObjectData=JSON.parse(oauthCOObj.custom.accessTokenObject);
								var refreshToken=authTokenObjectData.refresh_token;
								getTokenJSONObj.clientSecret=oauthCOObj.custom.client_secret;
								getTokenJSONObj.clientId=oauthCOObj.custom.client_id;
								getTokenJSONObj.shortCode=oauthCOObj.custom.short_code;
								getTokenJSONObj.fworganizationid=oauthCOObj.custom.org_id;
								getTokenJSONObj.refresh_token=refreshToken;
							//----------------------refresh token call function--------//
							var getrefreshTokenJobObj =require('~/cartridge/scripts/oauth/getRefreshTokenAPI');
							var getrefreshTokenJobResponse = getrefreshTokenJobObj.refreshTokenfun(getTokenJSONObj);
							//return new Status(Status.ERROR, 'ERROR', JSON.stringify(getrefreshTokenJobResponse));
							var getrefreshTokenJobJsonObj = JSON.parse(getrefreshTokenJobResponse);
								Transaction.begin();
									oauthCOObj.custom.accessTokenObject=getrefreshTokenJobJsonObj;
								Transaction.commit();
								//-----------------oauth data------------------------//
								var updateGraphQLForTokenDataObj =require('~/cartridge/scripts/oauth/updateGraphQLForTokenDataAPI');
								var updateGraphQLForTokenDataResponse = updateGraphQLForTokenDataObj.updateGraphQLForTokenData();
								
								if(updateGraphQLForTokenDataResponse.data)
									{
										return new Status(Status.OK, 'OK', 'App Configured successfully.'+JSON.stringify(updateGraphQLForTokenDataResponse));
									}
									else
									{
										return new Status(Status.ERROR, 'ERROR', JSON.stringify(updateGraphQLForTokenDataResponse));
									}
							}
							catch (error)
							{
								return new Status(Status.ERROR, 'ERROR', error);
							}
						}
						catch (error)
						{
							return new Status(Status.ERROR, 'ERROR', error);
						}
		 }
         else
         {
            return new Status(Status.ERROR, 'ERROR', 'Firework Oauth not Configure');
         }
};

exports.Run = run;
