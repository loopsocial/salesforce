'use strict';
var Template = require('dw/util/Template');
var HashMap = require('dw/util/HashMap');
module.exports.render = function (context){
    var model = new HashMap();
    var viewmodel = {};
    viewmodel.selectedChannel = context.content.gridlayout.selectedChannel;
    viewmodel.selectedPlayList = context.content.gridlayout.selectedPlayList;
    viewmodel.videoattime = context.content.gridlayout.videoattime;
    viewmodel.minimizedVideoPlayerLocation = context.content.gridlayout.minimizedVideoPlayerLocation;
    model.viewmodel = viewmodel;
    return new Template('experience/components/firework/gridlayout').render(model).text;
};
