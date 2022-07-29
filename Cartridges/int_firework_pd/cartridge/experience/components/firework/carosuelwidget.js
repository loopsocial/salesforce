'use strict';
var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

module.exports.render = function (context) {
    var model = new HashMap();
    var viewmodel = {};
        viewmodel.selectedChannel = context.content.carosuelwidget.selectedChannel;
        viewmodel.selectedPlayList = context.content.carosuelwidget.selectedPlayList;
        viewmodel.minimizedVideoPlayerLocation = context.content.carosuelwidget.minimizedVideoPlayerLocation;
        model.viewmodel = viewmodel;
    return new Template('experience/components/firework/carosuelwidget').render(model).text;
};
