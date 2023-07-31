'use strict';
/**
 * Initialize HTTP services for a cartridge
 */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var fireworkRefundService = LocalServiceRegistry.createService("firework.http.dashboard.service", {
	createRequest: function(svc:HTTPService, args){
		svc.setRequestMethod(args.Method);
		svc.addHeader('Content-Type', 'application/json');
		svc.addHeader('Authorization','Bearer '+args.token);
		if(args) {
		    let request = '';
		    if (args.requestJSON) {
		      request =args.requestJSON;
		      return request;
		    }
		} else {
			return null;
		}
	},
	parseResponse: function(svc:HTTPService, client:HTTPClient) {
		return client.text;
	},
	filterLogMessage: function(msg) {
        return msg;
    }
});
module.exports = {
		fireworkRefundService: fireworkRefundService
};