'use strict';
var System = require('dw/system/System');
var Encoding = require("dw/crypto/Encoding");
var MessageDigest = require("dw/crypto/MessageDigest");
var Transaction = require('dw/system/Transaction');
var Bytes = require("dw/util/Bytes");
var CustomObjectModel = require('*/cartridge/models/fwCustomObjectModel.js');
var PreferencesModel = require('*/cartridge/models/fwPreferencesModel.js');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
importPackage(dw.system);
importPackage(dw.crypto);
importPackage(dw.util);
/**
 * Get the user authorize guest details.
 */
function authorizeGuestFun(org_id,redirectURL,client_id,shortCode)
{
	/* API Includes */
	var Site = require('dw/system/Site');
	var restService = require('~/cartridge/scripts/init/oauthInit');
	var htmlError = '<div id="saErroroauthRegister">Something went wrong.</div>';
	var codeChallenge=generateCodeChallenge();
	var service:Service =restService.getauthorizeGuestService;
	service.URL=service.URL.replace('{fireworkShortCode}',shortCode);
	service.URL += '/shopper/auth/v1/organizations/'+org_id+'/oauth2/authorize?redirect_uri='+redirectURL+'&hint=guest&response_type=code&channel_id='+dw.system.Site.current.ID+'&code_challenge='+codeChallenge+'&client_id='+client_id+'&state=client-state';
	return service.URL;
}
function generateCodeChallenge() {
		var verifier =generateCodeVerifier();
		var challenge = generateCodeChallengeScript(verifier);
		var OauthCO = CustomObjectMgr.getCustomObject('FireworkOauthCO',dw.system.Site.current.ID);
        if(OauthCO != null)
        {
			Transaction.begin();
			OauthCO.custom.fireworkCodeVerifier=verifier;
			OauthCO.custom.fireworkCodeChallenge=challenge;
			Transaction.commit();
		}
		return challenge;
}
function generateCodeVerifier() {
	var length =32;
	var _random : SecureRandom = new SecureRandom();
	var _randomBytes : Bytes = _random.generateSeed(length);
	var _randomString : String = Encoding.toBase64(_randomBytes);
	return	_randomString.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');;
}
function generateCodeChallengeScript(code_verifier) {
	var md : MessageDigest = new MessageDigest(MessageDigest.DIGEST_SHA_256);
    var codeChallengeBytes : Bytes = new Bytes(code_verifier,'UTF-8');
    var codeChallenge  = md.digestBytes(codeChallengeBytes);
	return Encoding.toBase64(codeChallenge).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
module.exports = {
    authorizeGuestFun: authorizeGuestFun,
	generateCodeChallenge:generateCodeChallenge,
	generateCodeVerifier:generateCodeVerifier,
	generateCodeChallengeScript:generateCodeChallengeScript
};