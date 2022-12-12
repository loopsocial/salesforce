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
        getUniqueBMUID: preference.custom.getUniqueBMUID,
        contactsEmail: preference.custom.contactsEmail,
        provider: 'SALESFORCE',
        graphQLEndpoint: 'https://fireworktv.com/graphiql',
        fireworkApiEndPoint: 'https://fireworktv.com',
        fireworkIframeURL: 'https://business.firework.com'
    };
    return preferenceObject;
};

module.exports = Preferences;
