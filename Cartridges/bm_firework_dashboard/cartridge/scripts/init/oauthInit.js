'use strict';
/**
 * Initialize HTTP services for a cartridge
 */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var getOauthTokenService = LocalServiceRegistry.createService("fwOauthTokenService", {
	createRequest: function(svc:HTTPService, args){
		if(args) {
			svc.setRequestMethod(args.Method);
			svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
			svc.addHeader('Authorization', 'Basic '+args.token);
			
		    let postBodyArgs  = [];
	        let postBody = "";
		     // Combine the hardcoded and custom preference values
			 let postData = {
				'grant_type':'client_credentials'
			  };
			  // Make sure we handle any encoding that needs to happen
			  for (var postItem in postData) {
				  postBodyArgs.push(dw.util.StringUtils.format("{0}={1}", encodeURIComponent(postItem), encodeURIComponent(postData[postItem])));
			  }
			  request = postBodyArgs.join("&");
			  return request
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
var tenantRegistrationService = LocalServiceRegistry.createService("fwsalesforce.service.shop", {
	createRequest: function(svc:HTTPService, args){
		svc.setRequestMethod(args.Method);
		svc.addHeader('Content-Type', 'application/json');
		svc.addHeader('Authorization','Bearer' +args.token);
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
var getauthorizeGuestService = LocalServiceRegistry.createService("fwsalesforce.service.shop", {
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
var privateClientidRegistrationService = LocalServiceRegistry.createService("fwsalesforce.service.shop", {
	createRequest: function(svc:HTTPService, args){
		svc.setRequestMethod(args.Method);
		svc.addHeader('Content-Type', 'application/json');
		svc.addHeader('Authorization','Bearer' +args.token);
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
var getAccessTokenService = LocalServiceRegistry.createService("fwsalesforce.service.shop", {
	createRequest: function(svc:HTTPService, args){
		if(args) {
			svc.setRequestMethod(args.Method);
			svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
			svc.addHeader('Authorization', 'Basic '+args.token);
			
		    var postBodyArgs  = [];
	        var postBody = "";
		     // Combine the hardcoded and custom preference values
			 if(args.requestJSON)
			 {
			 var postData =args.requestJSON;
			 }
			  // Make sure we handle any encoding that needs to happen
			  for (var postItem in postData) {
				  postBodyArgs.push(dw.util.StringUtils.format("{0}={1}", encodeURIComponent(postItem), encodeURIComponent(postData[postItem])));
			  }
			  request = postBodyArgs.join("&");
			  return request
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
var getCodeChallengeService = LocalServiceRegistry.createService("graphQLCredService", {
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
module.exports = {
	getOauthTokenService: getOauthTokenService,
	tenantRegistrationService:tenantRegistrationService,
	getauthorizeGuestService:getauthorizeGuestService,
	privateClientidRegistrationService:privateClientidRegistrationService,
	getAccessTokenService:getAccessTokenService,
	getCodeChallengeService:getCodeChallengeService,
	graphQLCredService:graphQLCredService
};