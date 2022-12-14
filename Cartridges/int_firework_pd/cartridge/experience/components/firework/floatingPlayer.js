'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

module.exports.render = function (context) {
    var model = new HashMap();
    var viewmodel = {};
        viewmodel.selectedChannel = context.content.floatingPlayer.selectedChannel;
        viewmodel.selectedPlayList = context.content.floatingPlayer.selectedPlayList;
        viewmodel.selectedVideo = context.content.floatingPlayer.selectedVideo;
        model.viewmodel = viewmodel;
    return new Template('experience/components/firework/floatingPlayer').render(model).text;
};
