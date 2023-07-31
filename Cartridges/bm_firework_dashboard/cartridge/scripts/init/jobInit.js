importPackage(dw.object);
importPackage(dw.util);
importPackage(dw.system);
importPackage(dw.io);

'use strict';
/**
 * Initialize HTTP services for a cartridge
 */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var postProductInventoryFeedService = LocalServiceRegistry.createService("firework.http.dashboard.service", {
	createRequest: function(svc:HTTPService, args){
		svc.addHeader('Content-Type', 'application/json');
		svc.addHeader('x-fw-content-signature',args.token);
		svc.addHeader('x-fw-timestamp',args.timeStamp);
		svc.addHeader('x-fw-webhook-event','update');
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
	postProductInventoryFeedService: postProductInventoryFeedService,
};