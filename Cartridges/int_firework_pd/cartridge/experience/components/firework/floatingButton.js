'use strict';

var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

module.exports.render = function (context) {
    var model = new HashMap();
    var viewmodel = {};
        viewmodel.selectedChannel = context.content.floatingButton.selectedChannel;
        viewmodel.selectedPlayList = context.content.floatingButton.selectedPlayList;
        viewmodel.selectedVideo = context.content.floatingButton.selectedVideo;
        viewmodel.minimizedVideoPlayerLocation = context.content.floatingButton.minimizedVideoPlayerLocation;
        viewmodel.openinwindow = context.content.floatingButton.openinwindow;
        viewmodel.vertical_offset = context.content.floatingButton.vertical_offset;
        viewmodel.horizontal_offset = context.content.floatingButton.horizontal_offset;
        model.viewmodel = viewmodel;
    return new Template('experience/components/firework/floatingButton').render(model).text;
};
