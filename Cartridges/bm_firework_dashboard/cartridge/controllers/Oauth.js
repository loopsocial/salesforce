'use strict';
const ISML = require('dw/template/ISML');
const Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var guard = require('~/cartridge/scripts/guard');
var CustomObjectModel = require('*/cartridge/models/fwCustomObjectModel.js');
var PreferencesModel = require('*/cartridge/models/fwPreferencesModel.js');
/**
 * This controller implements the business manager extension action for Oauth Token Process.
 *
 * @module controllers/show
 */
 function show()
 {
    /* Local API Includes */
    try {
            var redirectCallbackUrl =request.getHttpProtocol()+"://"+request.getHttpHost()+dw.web.URLUtils.url('Oauth-callback');
              var oauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
              if(oauthCOObj != null)
              {
                    var getTokenJSONObj = {};
                    getTokenJSONObj.clientSecret=oauthCOObj.custom.fireworkClientSecret;
                    getTokenJSONObj.clientId=oauthCOObj.custom.fireworkClientId;
                    getTokenJSONObj.shortCode=oauthCOObj.custom.fireworkShortCode;
                    getTokenJSONObj.fworganizationid=oauthCOObj.custom.fireworkOrgId;
                    getTokenJSONObj.tenant_id=oauthCOObj.custom.fireworkTenantId;
                    var successURL = dw.web.URLUtils.url('Oauth-success');
                    ISML.renderTemplate('oauth/oauthForm',{successURL: successURL,OauthData:getTokenJSONObj,redirectCallbackUrl:redirectCallbackUrl});
                    return; 
                }
                else
                {
                    var getTokenJSONObj = {};
                    getTokenJSONObj.clientSecret='';
                    getTokenJSONObj.clientId='';
                    getTokenJSONObj.shortCode='';
                    getTokenJSONObj.fworganizationid='';
                    getTokenJSONObj.tenant_id='';
                    var successURL = dw.web.URLUtils.url('Oauth-success');
                    ISML.renderTemplate('oauth/oauthForm',{successURL: successURL,OauthData:getTokenJSONObj,redirectCallbackUrl:redirectCallbackUrl});
                    return;
                }
              
        }catch (e){
            var errorMsg= {
                status: 'failed',
                message:"error has occurred "+e
            };
            ISML.renderTemplate('oauth/errorMsg',{errorMsg:errorMsg});
            return;
        }
    return;
}
/**
 * This controller implements the business manager extension action for Oauth Token Process.
 *
 * @module controllers/success
 */
 function success()
 {
    /* Local API Includes */
    try {
                var oauthConfig={};
               var shortCode =request.httpParameterMap.shortcode;
               var fworganizationid =request.httpParameterMap.fworganizationid;
               var fwclientid =request.httpParameterMap.fwclientid;
               var fwclientsecret =request.httpParameterMap.fwclientsecret;
               var tenantId =request.httpParameterMap.tenantId; 
               var oauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
               var callbackUrl=request.getHttpProtocol()+"://"+request.getHttpHost()+dw.web.URLUtils.url('Oauth-callback');
                oauthConfig.shortCode=shortCode;
                oauthConfig.fworganizationid=fworganizationid;
                oauthConfig.fwclientid=fwclientid;
                oauthConfig.fwclientsecret=fwclientsecret;
                oauthConfig.tenant_id=tenantId
                    //------------get CLI access token---------------//
                    var getTokenObj =require('~/cartridge/scripts/oauth/tokenAPI');
                    var getTokenResponse = getTokenObj.getToken(oauthConfig);
                    var getTokenResponseJsonObj = JSON.parse(getTokenResponse);
                    if(!empty(getTokenResponseJsonObj.access_token))
                    {
                        var tenantRegistrationObj =require('~/cartridge/scripts/oauth/tenantRegistrationAPI');
                        var tenantRegistrationResponse = tenantRegistrationObj.tenantRegistrationfun(getTokenResponseJsonObj.access_token,shortCode,tenantId);
                        var tenantRegistrationResponseJsonObj = JSON.parse(tenantRegistrationResponse);
                        if(tenantRegistrationResponseJsonObj.tenantId)
                        {
                            var privateClientidRegistrationObj =require('~/cartridge/scripts/oauth/privateClientidRegistrationAPI');
                            var privateClientidRegistrationResponse = privateClientidRegistrationObj.privateClientidRegistrationfun(getTokenResponseJsonObj.access_token,tenantId,fwclientid,fwclientsecret,callbackUrl,shortCode);
                            var privateClientidRegistrationResponseObj= JSON.parse(privateClientidRegistrationResponse);
                            if(privateClientidRegistrationResponseObj.clientId)
                            {
                                    Transaction.begin();
                                    if(oauthCOObj == null)
                                    {
                                        oauthCOObj = CustomObjectMgr.createCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
                                    }
                                    oauthCOObj.custom.fireworkClientId =fwclientid;
                                    oauthCOObj.custom.fireworkClientSecret =fwclientsecret;
                                    oauthCOObj.custom.fireworkOrgId =fworganizationid;
                                    oauthCOObj.custom.fireworkShortCode =shortCode;
                                    oauthCOObj.custom.fireworkTenantId =tenantId;
                                    oauthCOObj.custom.fireworkCliToken =getTokenResponseJsonObj.access_token;
                                    Transaction.commit();
                                var authorizeGuestObj =require('~/cartridge/scripts/oauth/authorizeGuestAPI');
                                var redirectURL = authorizeGuestObj.authorizeGuestFun(fworganizationid,callbackUrl,fwclientid,shortCode);
                                response.redirect(redirectURL);
                                return; 
                            }
                        }
                    }
                    return; 
        }
        catch (e){
            var errorMsg= {
                status: 'failed',
                message:"error has occurred "+e
            };
        }
        return; 
}
/**
 * This controller implements the business manager extension action for Oauth Token Process.
 *
 * @module controllers/show
 */
 function callback()
 {
    /* Local API Includes */
    try {
             var usid = request.httpParameterMap.usid.value;
             var code = request.httpParameterMap.code.value;
             var redirectURL=request.getHttpProtocol()+"://"+request.getHttpHost()+dw.web.URLUtils.url('Oauth-callback');
            var oauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
            if(oauthCOObj != null)
            {
                var getTokenJSONObj = {};
                    getTokenJSONObj.code=code;
                    getTokenJSONObj.usid=usid;
                    getTokenJSONObj.clientSecret=oauthCOObj.custom.fireworkClientSecret;
                    getTokenJSONObj.clientId=oauthCOObj.custom.fireworkClientId;
                    getTokenJSONObj.shortCode=oauthCOObj.custom.fireworkShortCode;
                    getTokenJSONObj.fworganizationid=oauthCOObj.custom.fireworkOrgId;
                    getTokenJSONObj.code_verifier=oauthCOObj.custom.fireworkCodeVerifier;
                    getTokenJSONObj.redirectUrl=redirectURL;
                    //----------get access token API call ------------------------//
                    var accessTokenObj =require('~/cartridge/scripts/oauth/getAccessTokenAPI');
                    var accessTokenResponse = accessTokenObj.accessTokenFun(getTokenJSONObj);
                    var accessTokenResponseObj=JSON.parse(accessTokenResponse);
                    var accessToken =accessTokenResponseObj.access_token;
                    var refreshToken =accessTokenResponseObj.refresh_token;
                    if(accessTokenResponseObj)
                    {
                        Transaction.begin();
                        oauthCOObj.custom.fireworkUsId =usid;
                        oauthCOObj.custom.fireworkCode =code;
                        oauthCOObj.custom.fireworkAccessTokenObject=accessTokenResponseObj;
                        Transaction.commit();
                        var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
                        if(FireworkCOObj != null)
                        {
                        //-----------------send all data to after complete access token------------
                        var updateGraphQLForTokenDataObj =require('~/cartridge/scripts/oauth/updateGraphQLForTokenDataAPI');
                        var updateGraphQLForTokenDataResponse = updateGraphQLForTokenDataObj.updateGraphQLForTokenData();
                        ISML.renderTemplate('oauth/success',{updateGraphQLForTokenDataResponse: updateGraphQLForTokenDataResponse});
                        return;
                        }
                        else
                        {
                            ISML.renderTemplate('oauth/configDashboard');
                            return;   
                        }
                    }
                    
            }
        }catch (e){
            var errorMsg= {
                status: 'failed',
                message:"error has occurred "+e
            };
            ISML.renderTemplate('oauth/errorMsg',{errorMsg:errorMsg});
            return;
        }
    return;
}
exports.success = guard.ensure(['post'], success);
exports.show = guard.ensure(['get'], show);
exports.callback = guard.ensure(['get'], callback);
