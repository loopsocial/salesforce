'use strict';
var HashMap = require('dw/util/HashMap');
var URLUtils = require('dw/web/URLUtils');
var CSRF = require('dw/web/CSRFProtection');
module.exports.init = function (editor) {
    var csrf = new HashMap();
    csrf.put(CSRF.getTokenName(), CSRF.generateToken());
    var redirectCallbackUrl =request.getHttpProtocol()+"://"+request.getHttpHost()+dw.web.URLUtils.url('firework-fireworkwidget');
    editor.configuration.put('csfr', csrf);
    editor.configuration.put('widgetType', 1);
    editor.configuration.put('iframesize', 300);
    editor.configuration.put('iFrameEnv', redirectCallbackUrl);
};
