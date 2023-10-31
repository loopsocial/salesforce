'use strict';
var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');

module.exports.render = function (context) {
    var model = new HashMap();
    var viewmodel = {};
        viewmodel.selectedChannel = context.content.storyBlock.selectedChannel;
        viewmodel.selectedPlayList = context.content.storyBlock.selectedPlayList;
        viewmodel.selectedVideo = context.content.storyBlock.selectedVideo;
        viewmodel.minimizedVideoPlayerLocation = context.content.storyBlock.minimizedVideoPlayerLocation;
        model.viewmodel = viewmodel;
    return new Template('experience/components/firework/storyBlock').render(model).text;
};
