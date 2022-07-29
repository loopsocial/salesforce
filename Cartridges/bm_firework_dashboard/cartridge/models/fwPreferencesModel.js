var Site = require('dw/system/Site');

/**
 * @description Contructor function for the model
 * @constructor Preferences
 */
function Preferences() {
}

/**
     * Get current site
     * @param {dw.system.SitePreferences} preferencesArgs SFCC preferences object
     * @returns {Object} site preferences
     */
Preferences.prototype.getPreferences = function (preferencesArgs) {
    var preference = preferencesArgs;
    if (empty(preference)) {
        preference = Site.current.preferences;
    }
    var preferenceObject = {
        siteCurrency: preference.custom.siteCurrency,
        siteTitle: preference.custom.siteTitle,
        provider: preference.custom.provider,
        graphQLEndpoint: preference.custom.graphQLEndpoint,
        getUniqueBMUID: preference.custom.getUniqueBMUID,
        clientName: preference.custom.clientName,
        contactsEmail: preference.custom.contactsEmail,
        fireworkApiEndPoint: preference.custom.fireworkApiEndPoint,
        fireworkIframeURL: preference.custom.fireworkIframeURL,
        accessKey: preference.custom.accessKey
    };
    return preferenceObject;
};

module.exports = Preferences;
