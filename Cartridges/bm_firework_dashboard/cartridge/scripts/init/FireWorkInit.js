'use strict';
/**
 * Initialize HTTP services for a cartridge
 */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var oauthRegisterService = LocalServiceRegistry.createService("firework.http.dashboard.service", {
	createRequest: function(svc:HTTPService, args){
		svc.setRequestMethod(args.Method);
		svc.addHeader('Content-Type', 'application/json');
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
var oauthBusinessStoreService = LocalServiceRegistry.createService("fireworksb.http.dashboard.service", {
	createRequest: function(svc:HTTPService, args){
		svc.setRequestMethod(args.Method);
		svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
		svc.addHeader('Authorization', 'Bearer '+args.token);
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
var graphQLCredService = LocalServiceRegistry.createService("firework.http.dashboard.service", {
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
var getChannelListService = LocalServiceRegistry.createService("fireworksb.http.dashboard.service", {
	createRequest: function(svc:HTTPService, args){
		svc.setRequestMethod(args.Method);
		svc.addHeader('Content-Type', 'application/json');
		svc.addHeader('Authorization', 'Bearer '+args.token);
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
var getChannelVideoService = LocalServiceRegistry.createService("fireworksb.http.dashboard.service", {
	createRequest: function(svc:HTTPService, args){
		svc.setRequestMethod(args.Method);
		svc.addHeader('Content-Type', 'application/json');
		svc.addHeader('Authorization', 'Bearer '+args.token);
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
var getChannelPlaylistService = LocalServiceRegistry.createService("fireworksb.http.dashboard.service", {
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
		oauthRegisterService: oauthRegisterService,
		oauthBusinessStoreService:oauthBusinessStoreService,
		graphQLCredService:graphQLCredService,
		getChannelListService:getChannelListService,
		getChannelVideoService:getChannelVideoService,
		getChannelPlaylistService:getChannelPlaylistService
};