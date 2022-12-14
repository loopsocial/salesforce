'use strict';
const ISML = require('dw/template/ISML');
const Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var CustomObjectModel = require('*/cartridge/models/fwCustomObjectModel.js');
var PreferencesModel = require('*/cartridge/models/fwPreferencesModel.js');

/**
 * This controller implements the business manager extension action for firework dashboard.
 *
 * @module controllers/dashboard
 */
exports.dashboard = function () {
    /* Local API Includes */
    try {
        var preferencesModel = new PreferencesModel();
        var getFwConfigSetting=preferencesModel.getPreferences();
        if(getFwConfigSetting.fireworkApiEndPoint && getFwConfigSetting.getUniqueBMUID)
        {
                var oauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
                if(oauthCOObj == null)
                {
                    var redirectCallbackUrl =request.getHttpProtocol()+"://"+request.getHttpHost()+dw.web.URLUtils.url('Oauth-callback'); 
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
                var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
                if(FireworkCOObj == null)
                {
                    var oauthRegisterObj =require('~/cartridge/scripts/firework/oauthRegisterAPI');
                    var oauthRegisterResponse = oauthRegisterObj.oauthRegister();
                    var oauthRegisterJsonObj = JSON.parse(oauthRegisterResponse);
                    var clientId=oauthRegisterJsonObj.client_id;
                    var redirectUri=oauthRegisterJsonObj.redirect_uris[0];
                    Transaction.begin();
                    FireworkCOObj = CustomObjectMgr.createCustomObject('FireworkCO',dw.system.Site.current.ID);
                    FireworkCOObj.custom.fireworkOauthData =oauthRegisterResponse;
                    Transaction.commit();
                    var getRedirectURL=getFwConfigSetting.fireworkApiEndPoint+'/oauth/authorize?client=business&response_type=code&redirect_uri='+redirectUri+'&client_id='+clientId+'&state=STATE&business_onboard=true';
                    response.redirect(getRedirectURL);
                }
                else
                {
                    var oauthRegisterData=JSON.parse(FireworkCOObj.custom.fireworkOauthData);
                    var oauthtokenData=JSON.parse(FireworkCOObj.custom.fireworkTokenData);
                    var businessOauthData=JSON.parse(FireworkCOObj.custom.fireworkBusinessOauthData);
                    var businessId=businessOauthData.businessId;
                    var storeId=FireworkCOObj.custom.fireworkBusinessStoreId;
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
                            FireworkCOObj.custom.fireworkTokenData=getcallBackResponse;
                            Transaction.commit();
                            var getGraphQLJSONObj = {};
                            //----------------update graphQL-------------//
                            getGraphQLJSONObj.businessId=businessId;
                            getGraphQLJSONObj.currency=getFwConfigSetting.siteCurrency;
                            getGraphQLJSONObj.siteTitle=getFwConfigSetting.siteTitle;
                            getGraphQLJSONObj.provider=getFwConfigSetting.provider;
                            getGraphQLJSONObj.siteUrl=getFwConfigSetting.getUniqueBMUID;
                            getGraphQLJSONObj.uid=getFwConfigSetting.getUniqueBMUID;
                            getGraphQLJSONObj.storeId=storeId;
                            getGraphQLJSONObj.accessToken=getRefreshTokenResponse.access_token;
                            getGraphQLJSONObj.refreshToken=getRefreshTokenResponse.refresh_token;
                            //----------------------refresh token call function--------//
                            var getTokenJSONObj = {};
                            var authTokenObjectData=JSON.parse(oauthCOObj.custom.fireworkAccessTokenObject);
                            var refreshToken=authTokenObjectData.refresh_token;
                            getTokenJSONObj.clientSecret=oauthCOObj.custom.fireworkClientSecret;
                            getTokenJSONObj.clientId=oauthCOObj.custom.fireworkClientId;
                            getTokenJSONObj.shortCode=oauthCOObj.custom.fireworkShortCode;
                            getTokenJSONObj.fworganizationid=oauthCOObj.custom.fireworkOrgId;
                            getTokenJSONObj.refresh_token=refreshToken;
                            var getrefreshTokenJobObj =require('~/cartridge/scripts/oauth/getRefreshTokenAPI');
                            var getrefreshTokenJobResponse = getrefreshTokenJobObj.refreshTokenfun(getTokenJSONObj);
                            var getrefreshTokenJobJsonObj = JSON.parse(getrefreshTokenJobResponse);
                            Transaction.begin();
                                oauthCOObj.custom.fireworkAccessTokenObject=getrefreshTokenJobJsonObj;
                            Transaction.commit();
                            //-----------------oauth data------------------------//
                            var getBusinessStoreObj =require('~/cartridge/scripts/firework/updateGraphQLAPI');
                            var getBusinessStorResponse = getBusinessStoreObj.updateGraphFun(getGraphQLJSONObj);
                            var getBusinessStoreJsonObj = JSON.parse(getBusinessStorResponse);   
                        //---------------------end--------------------------------------------//
                        ISML.renderTemplate('dashboard/dashboard',{token:getRefreshTokenResponse.access_token,storeId:FireworkCOObj.custom.fireworkBusinessStoreId,businessId:businessId});
                        return;
                        }
                        catch (e)
                        {
                            Transaction.begin();
                            FireworkCOObj.custom.fireworkTokenData='';
                            Transaction.commit();
                            response.redirect(getFwConfigSetting.fireworkApiEndPoint+'/oauth/authorize?client=business&response_type=code&redirect_uri='+oauthRegisterData.redirect_uris[0]+'&client_id='+oauthRegisterData.client_id+'&state=STATE&business_onboard=true');
                        }
                    }
        }
        else
        {
            var errorMsg= {
                status: 'failed',
                message:"Please configure firework setting."
            };
        ISML.renderTemplate('dashboard/errorMsg',{errorMsg:errorMsg});
        return;
        }
    //
    }catch (e) {
        var errorMsg= {
            status: 'failed',
            message:"error has occurred "+e
        };
    ISML.renderTemplate('dashboard/errorMsg',{errorMsg:errorMsg});
    return;
}
    return;
};
/**
 * This controller implements the business manager extension action for getplaylist.
 *
 * @module controllers/getplaylist
 */
 exports.getplaylist = function () {
    /* Local API Includes */
    try {
        var preferencesModel = new PreferencesModel();
        var getFwConfigSetting=preferencesModel.getPreferences();
        var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
        if(FireworkCOObj != null)
        {
            var oauthRegisterData=JSON.parse(FireworkCOObj.custom.fireworkOauthData);
            var oauthtokenData=JSON.parse(FireworkCOObj.custom.fireworkTokenData);
            var businessOauthData=JSON.parse(FireworkCOObj.custom.fireworkBusinessOauthData);
            var businessId=businessOauthData.businessId;
            var storeId=FireworkCOObj.custom.fireworkBusinessStoreId;
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
                    FireworkCOObj.custom.fireworkTokenData=getcallBackResponse;
                    Transaction.commit(); 
                //---------------------end--------------------------------------------//
                ISML.renderTemplate('dashboard/dashboard',{token:getRefreshTokenResponse.access_token,storeId:FireworkCOObj.custom.fireworkBusinessStoreId,businessId:businessId});
                return;
                }
                catch (e)
                {
                    Transaction.begin();
                    FireworkCOObj.custom.fireworkTokenData='';
                    Transaction.commit();
                    response.redirect(getFwConfigSetting.fireworkApiEndPoint+'/oauth/authorize?client=business&response_type=code&redirect_uri='+oauthRegisterData.redirect_uris[0]+'&client_id='+oauthRegisterData.client_id+'&state=STATE&business_onboard=true');
                }
            }
    //
    }catch (e) {
        var errorMsg= {
            status: 'failed',
            message:"error has occurred "+e
        };
        ISML.renderTemplate('dashboard/errorMsg',{errorMsg:errorMsg});
        return;
}
    return;
};
/**
 * This controller implements the business manager extension action for dashboard.
 *
 * @module controllers/callback
 */
exports.callback = function () {
        /* Local API Includes */
        var ISML = require('dw/template/ISML');
        var preferencesModel = new PreferencesModel();
        var getFwConfigSetting=preferencesModel.getPreferences();
        var businessId = request.httpParameterMap.business_id.value;
        var	code = request.httpParameterMap.code.value;
        var	state = request.httpParameterMap.state.value;
        var callBackJSONObj = {};
        callBackJSONObj.businessId=businessId;
        callBackJSONObj.code=code;
        callBackJSONObj.state=state;
        //get the accesstoken API CALL-----------//
        var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
        var  getUniqueBMUID=getFwConfigSetting.getUniqueBMUID;
        if(FireworkCOObj!=null)
        {
                Transaction.begin();
                FireworkCOObj.custom.fireworkBusinessOauthData=JSON.stringify(callBackJSONObj);
                Transaction.commit(); 
                var oauthRegisterData=JSON.parse(FireworkCOObj.custom.fireworkOauthData);
                callBackJSONObj.client_id=oauthRegisterData.client_id;
                callBackJSONObj.client_secret=oauthRegisterData.client_secret;
                callBackJSONObj.redirect_Url=oauthRegisterData.redirect_uris[0];
                var callBackObj =require('~/cartridge/scripts/firework/oauthTokenAPI');
                var getcallBackResquest = callBackObj.oauthToken(callBackJSONObj);
                var getcallBackResponse =getcallBackResquest;
                Transaction.begin();
                FireworkCOObj.custom.fireworkTokenData=getcallBackResponse;
                Transaction.commit();
                var oauthTokenData=JSON.parse(FireworkCOObj.custom.fireworkTokenData);
                //------------Validate business exist or not--------------//
                var getBusinessStoreObj =require('~/cartridge/scripts/firework/getBusinessStoreAPI');
                var getBusinessStorResponse = getBusinessStoreObj.businessStoreFun(oauthTokenData.access_token,businessId);
                var getBusinessStoreJsonObj = JSON.parse(getBusinessStorResponse);
                if(!empty(getBusinessStoreJsonObj.business_stores))
                {
                    var businessStoreId;
                    var hasCheckBusinessStoreFlag = false;
                    var getBusinessStoreDetails=getBusinessStoreJsonObj.business_stores;
                    // loop for check uid and business  id
                    for (var i = 0; i < getBusinessStoreDetails.length; i++) {
                        var validateBMUID =getBusinessStoreDetails[i].uid;
                        if (getUniqueBMUID === validateBMUID)
                        {
                            hasCheckBusinessStoreFlag = true;
                            businessStoreId =getBusinessStoreDetails[i].id;
                        }
                    }
                    if(hasCheckBusinessStoreFlag)
                    {
                        var getGraphQLJSONObj = {};
                        var refreshToken=oauthTokenData.refresh_token;
			            var accessToken=oauthTokenData.access_token;
                        getGraphQLJSONObj.businessId=businessId;
                        getGraphQLJSONObj.currency=getFwConfigSetting.siteCurrency;
                        getGraphQLJSONObj.siteTitle=getFwConfigSetting.siteTitle;
                        getGraphQLJSONObj.provider=getFwConfigSetting.provider;
                        getGraphQLJSONObj.siteUrl=getFwConfigSetting.getUniqueBMUID;
                        getGraphQLJSONObj.uid=getUniqueBMUID;
                        getGraphQLJSONObj.endPointUrl=getFwConfigSetting.graphQLEndpoint;
                        getGraphQLJSONObj.storeId=businessStoreId;
                        getGraphQLJSONObj.accessToken=accessToken;
                        getGraphQLJSONObj.refreshToken=refreshToken;
                        var getBusinessStoreObj =require('~/cartridge/scripts/firework/updateGraphQLAPI');
                        var getBusinessStorResponse = getBusinessStoreObj.updateGraphFun(getGraphQLJSONObj);
                        var getBusinessStoreJsonObj = JSON.parse(getBusinessStorResponse);
                        Transaction.begin();
                        FireworkCOObj.custom.fireworkBusinessStoreId=businessStoreId;
                        Transaction.commit();
                        response.redirect(URLUtils.https('Firework-dashboard'));
                        return;
                    }
                    else
                    {
                        var getGraphQLJSONObj = {};
                        var refreshToken=oauthTokenData.refresh_token;
			            var accessToken=oauthTokenData.access_token;
                        getGraphQLJSONObj.businessId=businessId;
                        getGraphQLJSONObj.currency=getFwConfigSetting.siteCurrency;
                        getGraphQLJSONObj.siteTitle=getFwConfigSetting.siteTitle;
                        getGraphQLJSONObj.provider=getFwConfigSetting.provider;
                        getGraphQLJSONObj.siteUrl=getFwConfigSetting.getUniqueBMUID;
                        getGraphQLJSONObj.uid=getUniqueBMUID;
                        getGraphQLJSONObj.endPointUrl=getFwConfigSetting.graphQLEndpoint;
                        getGraphQLJSONObj.accessToken=accessToken;
                        getGraphQLJSONObj.refreshToken=refreshToken;
                        var getBusinessStoreObj =require('~/cartridge/scripts/firework/createGraphQLAPI');
                        var getBusinessStorResponse = getBusinessStoreObj.createGraphFun(getGraphQLJSONObj);
                        var getBusinessStoreJsonObj = JSON.parse(getBusinessStorResponse);
                        Transaction.begin();
                        FireworkCOObj.custom.fireworkBusinessStoreId=getBusinessStoreJsonObj.data.createBusinessStore.id;
                        Transaction.commit();
                        response.redirect(URLUtils.https('Firework-dashboard'));
                        return;
                    }
                }
                else
                {
                    var getGraphQLJSONObj = {};
                    var refreshToken=oauthTokenData.refresh_token;
			        var accessToken=oauthTokenData.access_token;
                    getGraphQLJSONObj.businessId=businessId;
                    getGraphQLJSONObj.currency=getFwConfigSetting.siteCurrency;
                    getGraphQLJSONObj.siteTitle=getFwConfigSetting.siteTitle;
                    getGraphQLJSONObj.provider=getFwConfigSetting.provider;
                    getGraphQLJSONObj.siteUrl=getFwConfigSetting.getUniqueBMUID;
                    getGraphQLJSONObj.uid=getUniqueBMUID;
                    getGraphQLJSONObj.endPointUrl=getFwConfigSetting.graphQLEndpoint;
                    getGraphQLJSONObj.storeId=FireworkCOObj.custom.fireworkBusinessStoreId;
                    getGraphQLJSONObj.accessToken=accessToken;
                    getGraphQLJSONObj.refreshToken=refreshToken;
                    var getBusinessStoreObj =require('~/cartridge/scripts/firework/createGraphQLAPI');
                    var getBusinessStorResponse = getBusinessStoreObj.createGraphFun(getGraphQLJSONObj);
                    var getBusinessStoreJsonObj = JSON.parse(getBusinessStorResponse);
                    Transaction.begin();
                    FireworkCOObj.custom.fireworkBusinessStoreId=getBusinessStoreJsonObj.data.createBusinessStore.id;
                    Transaction.commit();
                    response.redirect(URLUtils.https('Firework-dashboard'));
                    return;
                    }
        }
    //-----------end-------------------------//
};
/**
 * This controller implements the business manager extension action for reset dashboard.
 *
 * @module controllers/reset
 */
 exports.reset = function () {
    /* Local API Includes */
    try {
        var OauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
		var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
        if(FireworkCOObj != null || OauthCOObj!=null)
        {
            var frRest =!empty(request.httpParameterMap.frRest.value) ? request.httpParameterMap.frRest.value: ""; 
            if(frRest=='true')
            {
                Transaction.begin();
                if(FireworkCOObj != null)
                {
                dw.object.CustomObjectMgr.remove(FireworkCOObj);
                }
                if(OauthCOObj != null)
                {
                dw.object.CustomObjectMgr.remove(OauthCOObj);
                }
                Transaction.commit();
                ISML.renderTemplate('dashboard/resetsuccess',{resetflag:true});
                return;
            }
            else
            {
                ISML.renderTemplate('dashboard/reset');
                return;
            }
        }
        else
        {
            ISML.renderTemplate('dashboard/resetsuccess',{resetflag:false});
            return; 
        }
        
        }catch (e)
        {
            var errorMsg= {
                status: 'failed',
                message:"error has occurred "+e
            };
            ISML.renderTemplate('dashboard/errorMsg',{errorMsg:errorMsg});
            return;
        }
    return;
};
/**
 * This controller implements the business manager extension action for getplaylist.
 *
 * @module controllers/getplaylist
 */
 exports.getplaylist = function () {
    /* Local API Includes */
    try {
        var channelID = request.httpParameterMap.channelID.value;
        if(channelID)
        {
                var preferencesModel = new PreferencesModel();
                var getFwConfigSetting=preferencesModel.getPreferences();
                var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
                if(FireworkCOObj != null)
                {
                    var oauthRegisterData=JSON.parse(FireworkCOObj.custom.fireworkOauthData);
                    var oauthtokenData=JSON.parse(FireworkCOObj.custom.fireworkTokenData);
                    var businessOauthData=JSON.parse(FireworkCOObj.custom.fireworkBusinessOauthData);
                    var businessId=businessOauthData.businessId;
                    var storeId=FireworkCOObj.custom.fireworkBusinessStoreId;
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
                              FireworkCOObj.custom.fireworkTokenData=getcallBackResponse;
                             Transaction.commit(); 
                            var getChannelPlayListFunObj = require('bm_firework_dashboard/cartridge/scripts/firework/getChannelPlaylist');
                            var getChannelPlayListResponse = getChannelPlayListFunObj.getChannelPlayListFun(channelID);
                        //---------------------end--------------------------------------------// 
                            response.setContentType('application/json');
                            response.writer.write(getChannelPlayListResponse);
                        }
                        catch (e)
                        {
                            var params = {
                                status: 'failed',
                                message:"error has occurred "+e
                            };
                            response.setContentType('application/json');
                            response.writer.write(JSON.stringify(params));
                        }
                    }
                    else
                    {
                        var params = {
                            status: 'failed',
                            message:"custom object is empty"
                        };
                        response.setContentType('application/json');
                        response.writer.write(JSON.stringify(params));
                    }
        }
        else
        {
            var params = {
                status: 'failed',
                message:"Channel Id should not be empty"
            };
            response.setContentType('application/json');
            response.writer.write(JSON.stringify(params));
        }
    //
    }catch (e) {
        var params = {
            status: 'failed',
            message:"error has occurred "+e
        };
        response.setContentType('application/json');
        response.writer.write(JSON.stringify(params));
    }
    return;
};
/**
 * This controller implements the business manager extension action for getvideolist.
 *
 * @module controllers/getvideolist
 */
 exports.getvideolist = function (channelID,playlistId) {
    /* Local API Includes */
    try {
        var channelID = request.httpParameterMap.channelID.value;
        var playlistID = request.httpParameterMap.playlistID.value;
        if(!empty(channelID) || !empty(playlistID))
        {
                var preferencesModel = new PreferencesModel();
                var getFwConfigSetting=preferencesModel.getPreferences();
                var FireworkCOObj = CustomObjectMgr.getCustomObject('FireworkCO',dw.system.Site.current.ID);
                if(FireworkCOObj != null)
                {
                    try {
                            var getvideolistFunObj = require('bm_firework_dashboard/cartridge/scripts/firework/getChannelVideo');
                            var getvideolistResponse = getvideolistFunObj.getChannelVideoFun(channelID,playlistID);
                            //---------------------end--------------------------------------------// 
                            response.setContentType('application/json');
                            response.writer.write(getvideolistResponse);
                        }
                        catch (e)
                        {
                            var params = {
                                status: 'failed',
                                message:"error has occurred "+e
                            };
                            response.setContentType('application/json');
                            response.writer.write(JSON.stringify(params));
                        }
                    }
                    else
                    {
                        var params = {
                            status: 'failed',
                            message:"custom object is empty"
                        };
                        response.setContentType('application/json');
                        response.writer.write(JSON.stringify(params));
                    }
        }
        else
        {
            var params = {
                status: 'failed',
                message:"Channel Id OR playlist id should not be empty"
            };
            response.setContentType('application/json');
            response.writer.write(JSON.stringify(params));
        }
    //
    }catch (e) {
        var params = {
            status: 'failed',
            message:"error has occurred "+e
        };
        response.setContentType('application/json');
        response.writer.write(JSON.stringify(params));
    }
    return;
};
/**
 * This controller implements the business manager extension action for reset dashboard.
 *
 * @module controllers/reset
 */
 exports.fireworkwidget = function () {
    /* Local API Includes */
    try {
            var widgetType = request.httpParameterMap.widgetType.value;
            if(widgetType)
            {
            var SelectedValue = JSON.parse(request.httpParameterMap.value.value);
            var getChannelListObj = require('bm_firework_dashboard/cartridge/scripts/firework/getChannelList');
            var getChannelListResponse = getChannelListObj.getChannelListFun();
            var getChannelListResponse=JSON.parse(getChannelListResponse);
                if(widgetType==1)
                {
                ISML.renderTemplate('widget/carosuelwidget',{getChannelListJsonObj:getChannelListResponse,widgetType:widgetType,getSelectedValue:SelectedValue});
                }
                else if(widgetType==2)
                {
                    ISML.renderTemplate('widget/floatingButton',{getChannelListJsonObj:getChannelListResponse,widgetType:widgetType,getSelectedValue:SelectedValue});
                }
                else if(widgetType==3)
                {
                    ISML.renderTemplate('widget/floatingPlayer',{getChannelListJsonObj:getChannelListResponse,widgetType:widgetType,getSelectedValue:SelectedValue});
        
                }
                else if(widgetType==4)
                {
                    ISML.renderTemplate('widget/gridlayout',{getChannelListJsonObj:getChannelListResponse,widgetType:widgetType,getSelectedValue:SelectedValue});
        
                }
                else if(widgetType==5)
                {
                    ISML.renderTemplate('widget/storyBlock',{getChannelListJsonObj:getChannelListResponse,widgetType:widgetType,getSelectedValue:SelectedValue}); 
                }
                return; 
            }
            else
            {
                var params = {
                    status: 'failed',
                    message:"Widget Type should not be empty"
                };
                response.setContentType('application/json');
                response.writer.write(JSON.stringify(params)); 
            }
        }
        catch (e)
        {
            var errorMsg= {
                status: 'failed',
                message:"error has occurred "+e
            };
            ISML.renderTemplate('dashboard/errorMsg',{errorMsg:errorMsg});
            return;
        }
    return;
};
/* Web exposed methods */
exports.callback.public = true;
exports.dashboard.public = true;
exports.reset.public = true;
exports.getplaylist.public = true;
exports.getvideolist.public = true;
exports.fireworkwidget.public = true;
