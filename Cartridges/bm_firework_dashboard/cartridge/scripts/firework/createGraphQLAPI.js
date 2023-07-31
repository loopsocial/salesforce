'use strict';
var Mac = require('dw/crypto/Mac');
var Encoding = require('dw/crypto/Encoding');
const ISML = require('dw/template/ISML');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var CustomObjectModel = require('*/cartridge/models/fwCustomObjectModel.js');
var PreferencesModel = require('*/cartridge/models/fwPreferencesModel.js');
importPackage(dw.system);
importPackage(dw.util);
/**
 * Get the user details and assign them points.
 */
function createGraphFun(graphQLData) {
	/* API Includes */
	var refreshToken = ''; var accessToken = ''; var code_verifier = '';
	var code_challenge = ''; var usid = ''; var code = ''; var org_id = '';
	var short_code = ''; var tenant_id = ''; var site_id = ''; var clientPwd = '';
	var client_id = '';
	var oauthCOObj = CustomObjectMgr.getCustomObject('FireworkOauthCO', dw.system.Site.current.ID);
	if (oauthCOObj != null) {
		var accessTokenObj = JSON.parse(oauthCOObj.custom.fireworkAccessTokenObject);
		accessToken = accessTokenObj.access_token;
		refreshToken = accessTokenObj.refresh_token;
		code_verifier = oauthCOObj.custom.fireworkCodeVerifier;
		code_challenge = oauthCOObj.custom.fireworkCodeChallenge;
		usid = oauthCOObj.custom.fireworkUsId;
		code = oauthCOObj.custom.fireworkCode;
		org_id = oauthCOObj.custom.fireworkOrgId;
		short_code = oauthCOObj.custom.fireworkShortCode;
		tenant_id = oauthCOObj.custom.fireworkTenantId;
		site_id = dw.system.Site.current.ID;
		clientPwd = oauthCOObj.custom.fireworkClientSecret;
		client_id = oauthCOObj.custom.fireworkClientId;
	}
	var fwAccessToken = graphQLData.accessToken;
	var businessId = graphQLData.businessId;
	var currency = graphQLData.currency;
	var siteTitle = graphQLData.siteTitle;
	var provider = graphQLData.provider;
	var siteUrl = graphQLData.siteUrl;
	var uid = graphQLData.uid;
	var site_id = dw.system.Site.current.ID;
	var org_id = oauthCOObj.custom.fireworkOrgId;
	var short_code = oauthCOObj.custom.fireworkShortCode;
	var client_id = oauthCOObj.custom.fireworkClientId;
	var endPointUrl = graphQLData.endPointUrl;
	var baseUrl = request.getHttpProtocol() + "://" + request.getHttpHost();
	var shopBaseUrl = '/s/' + dw.system.Site.current.ID + '/dw/data/v23_1';
	var metadata = '{\\\\\\"site_id\\\\\\": \\\\\\"' + site_id + '\\\\\\",\\\\\\"short_code\\\\\\": \\\\\\"' + short_code + '\\\\\\",\\\\\\"client_id\\\\\\": \\\\\\"' + client_id + '\\\\\\",\\\\\\"org_id\\\\\\": \\\\\\"' + org_id + '\\\\\\",\\\\\\"base_url\\\\\\": \\\\\\"' + baseUrl + '\\\\\\",\\\\\\"shop_base_url\\\\\\": \\\\\\"' + shopBaseUrl + '\\\\\\"}';
	var query = '{"query":"mutation {\\n\\t\\t\\t\\t\\tcreateBusinessStore(createBusinessStoreInput: {businessId: \\"' + businessId + '\\", currency: \\"' + currency + '\\", name: \\"' + siteTitle + '\\", provider: \\"salesforce\\", uid: \\"' + uid + '\\", url: \\"' + siteUrl + '\\", accessToken: \\"' + accessToken + '\\", refreshToken: \\"' + refreshToken + '\\", metadata: \\"' + metadata + '\\"\\n    }) {\\n\\t\\t\\t\\t\\t... on BusinessStore {\\n\\t\\t\\t\\t\\t\\t\\tid\\n\\t\\t\\t\\t\\t\\t\\tname\\n\\t\\t\\t\\t\\t\\t\\tprovider\\n\\t\\t\\t\\t\\t\\t\\tcurrency\\n\\t\\t\\t\\t\\t\\t\\turl\\n\\t\\t\\t\\t\\t\\t\\taccessToken\\n\\t\\t\\t\\t\\t\\t\\trefreshToken\\n        }\\n\\t\\t\\t\\t\\t\\t... on AnyError {\\n\\t\\t\\t\\t\\t\\t\\tmessage\\n        }\\n    }\\n}","variables":{}}';
	var Site = require('dw/system/Site');
	var URLUtils = require('dw/web/URLUtils');
	var restService = require('~/cartridge/scripts/init/FireWorkInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var service: Service = restService.graphQLCredService;
	service.URL += '/graphiql';
	var payLoadDetails = new Bytes(query);
	var result: Result = service.call({
		'Method': "POST",
		'token': fwAccessToken,
		'requestJSON': payLoadDetails
	});
	if (result.isOk()) {
		var htmlSuccess = result.getObject().toString();
		return htmlSuccess;
	} else {
		var resultMessage = JSON.parse(result.errorMessage);
		ISML.renderTemplate('dashboard/errorMsg', { errorMsg: resultMessage });
		return;
	}
}
module.exports = {
	createGraphFun: createGraphFun
};