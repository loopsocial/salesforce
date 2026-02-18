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
        var oauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
        var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
		 if(oauthCOObj != null && FireworkCOObj!=null)
		 {
			 		try {
						 //------------update refresh token for update graphQL data-------------//
						 var oauthRegisterData=JSON.parse(FireworkCOObj.custom.fireworkOauthData);
						 var fwTokenData = FireworkCOObj.custom.fireworkTokenData;
						 var oauthtokenData = (typeof fwTokenData === 'string') ? JSON.parse(fwTokenData) : fwTokenData;
						 var callBackJSONObj = {};
						 //-----------get refresh token and create new accesstoken-------------//
						 callBackJSONObj.client_id=oauthRegisterData.client_id;
						 callBackJSONObj.client_secret=oauthRegisterData.client_secret;
						 callBackJSONObj.redirect_Url=oauthRegisterData.redirect_uris[0];
						 callBackJSONObj.refresh_token=oauthtokenData.refresh_token;

						 try {
							    if(!empty(oauthtokenData.refresh_token))
								 {
									var callBackObj =require('~/cartridge/scripts/firework/oauthTokenAPI');
									var getcallBackResponse = callBackObj.oauthToken(callBackJSONObj);
									var getRefreshTokenResponse=JSON.parse(getcallBackResponse);
									
									// Check if Firework token refresh failed
									if (getRefreshTokenResponse.error || !getRefreshTokenResponse.access_token) {
										return new Status(Status.ERROR, 'ERROR', 'Firework token refresh failed: ' + JSON.stringify(getRefreshTokenResponse));
									}
									
									Transaction.begin();
									FireworkCOObj.custom.fireworkTokenData=getcallBackResponse;
									Transaction.commit();
								 }
								//---------------------------end--------------------------------------//
								var getTokenJSONObj = {};
								var tokenData = oauthCOObj.custom.fireworkAccessTokenObject;
								
								// Debug logging - remove after fixing
								Logger.info('Token data type: ' + typeof tokenData);
								Logger.info('Token data raw: ' + String(tokenData).substring(0, 200));
								
								var authTokenObjectData = (typeof tokenData === 'string') ? JSON.parse(tokenData) : tokenData;
								
								// Check if we need to parse again (double-stringified data)
								if (typeof authTokenObjectData === 'string') {
									Logger.info('Token was double-stringified, parsing again');
									authTokenObjectData = JSON.parse(authTokenObjectData);
								}
								
								var refreshToken=authTokenObjectData.refresh_token;
								
								// Debug logging
								Logger.info('Refresh token exists: ' + (refreshToken ? 'yes' : 'no'));
								
								if (!refreshToken) {
									return new Status(Status.ERROR, 'ERROR', 'No refresh_token found in stored data. Stored data keys: ' + Object.keys(authTokenObjectData || {}).join(', '));
								}
								
								getTokenJSONObj.clientSecret=oauthCOObj.custom.fireworkClientSecret;
								getTokenJSONObj.clientId=oauthCOObj.custom.fireworkClientId;
								getTokenJSONObj.shortCode=oauthCOObj.custom.fireworkShortCode;
								getTokenJSONObj.fworganizationid=oauthCOObj.custom.fireworkOrgId;
								getTokenJSONObj.refresh_token=refreshToken;
							//----------------------refresh token call function--------//
							var getrefreshTokenJobObj =require('~/cartridge/scripts/oauth/getRefreshTokenAPI');
							var getrefreshTokenJobResponse = getrefreshTokenJobObj.refreshTokenfun(getTokenJSONObj);
							//return new Status(Status.ERROR, 'ERROR', JSON.stringify(getrefreshTokenJobResponse));
							var getrefreshTokenJobJsonObj = JSON.parse(getrefreshTokenJobResponse);
							
							// Check if SCAPI token refresh failed
							if (getrefreshTokenJobJsonObj.error || !getrefreshTokenJobJsonObj.access_token) {
								return new Status(Status.ERROR, 'ERROR', 'SCAPI token refresh failed: ' + JSON.stringify(getrefreshTokenJobJsonObj));
							}
							
								Transaction.begin();
									oauthCOObj.custom.fireworkAccessTokenObject=getrefreshTokenJobResponse;
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