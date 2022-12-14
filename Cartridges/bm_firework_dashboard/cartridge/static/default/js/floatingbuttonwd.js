document.addEventListener("click", function () {
    var selectedChannel = document.querySelector("#selectedChannel").value;
    var getChannelSplitArr=selectedChannel.split("~~~");
    var getChannelId=getChannelSplitArr[0];
    var getChannelUsername=getChannelSplitArr[1];
    var selectedPlayList = document.querySelector("#selectedPlayList").value;
    var selectedVideo = document.querySelector("#selectedVideo").value;
    var vertical_offset = document.querySelector("#vertical_offset").value;
    var horizontal_offset = document.querySelector("#horizontal_offset").value;
    var minimizedVideoPlayerLocation;
    var openinwindow ;
     minimizedVideoPlayerLocation =document.querySelector('input[name=minimized_video_player_location]:checked').value;
     openinwindow =document.querySelector('input[name=openinwindow]:checked').value;
    var message={};
    message.selectedChannel=getChannelUsername;
    message.selectedChannelData=selectedChannel;
    message.selectedPlayList=selectedPlayList;
    message.selectedVideo=selectedVideo;
    message.openinwindow=openinwindow;
    message.vertical_offset=vertical_offset;
    message.horizontal_offset=horizontal_offset;
    message.minimizedVideoPlayerLocation=minimizedVideoPlayerLocation;
    if(selectedChannel && openinwindow && vertical_offset && horizontal_offset && minimizedVideoPlayerLocation)
    {
     if(selectedPlayList=='specificVideo' && selectedVideo)
     {
       message.action='done';
     }
     else if(selectedPlayList!='specificVideo' && selectedPlayList)
     {
       message.action='done';
     }
     else
     {
      message.action='invalid';
     }
    window.parent.postMessage(message, "*");
    }
    else
    {
     message.action='invalid';  
     window.parent.postMessage(message, "*");
    }
  // Send `message` to the parent using the postMessage method on the window.parent reference.
  
});
$(document).ready(function()
{
 if(document.querySelector("#selectedChannel").value)
 {
    var selectedChannel = document.querySelector("#selectedChannel").value;
    var getChannelSplitArr=selectedChannel.split("~~~");
    var getChannelId=getChannelSplitArr[0];
    SelectedVideoAndChannelFun(getChannelId);
 }
 $('#selectedPlayListdata').append(`<label>PlayList </label><select name="selectedPlayList" onchange="getselectedVideoListFun(this.value)" id="selectedPlayList"><option value="">---Select Playlist---</option></select>`);
 $('#selectedVideodata').append(`<label>Video </label><select name="selectedVideo" id="selectedVideo"><option value="">---Select Video---</option></select>`);
 $('#selectedChannel').on('change', function (e) {
    var selectedChannel = document.querySelector("#selectedChannel").value;
    var getChannelSplitArr=selectedChannel.split("~~~");
    var getChannelId=getChannelSplitArr[0];
    if(selectedChannel)
    {
          $.ajax({
                         url: $('#ajaxgetplayList').data('action')+'?channelID='+getChannelId,
                         method: 'GET',
                         success: function (data) {
                            {
                                  const {playlists} = data;
                                  var getlistOption;
                                  if(playlists.length > 0)
                                  {
                                        for(var i = 0; i < playlists.length; i++)
                                        {
                                           getlistOption+='<option value='+playlists[i].id+'>'+playlists[i].display_name+'</option>';
                                        }
                                        var appendSelectedHTML=`
                                           <div class="firework-widget-settings-column" id="selectedPlayListdata">
                                           <label>PlayList</label> <select class="selectedPlayList" name="selectedPlayList" onchange="getselectedVideoListFun(this.value)" id="selectedPlayList">
                                              <option value="">---Select PlayList---</option>
                                              <option value="specificVideo">A Specific Video</option>
                                              `+getlistOption+`
                                           </select>
                                           </div>
                                        `;
                                        $('#selectedPlayListdata').replaceWith(appendSelectedHTML);
                                  }
                            }
                         },
                         error: function (err) {
                         console.log('Somthing went wrong'+err);    
                         }
                });
                $.ajax({
                         url:$('#ajaxgetvideolist').data('action')+'?channelID='+getChannelId,
                         method: 'GET',
                         success: function (data) {
                            {
                                  var getlistOption;
                                  const {videos} = data;
                                  if(videos.length > 0)
                                  {
                                     for(var i = 0; i < videos.length; i++)
                                     {
                                     getlistOption+='<option value='+videos[i].encoded_id+'>'+videos[i].caption+'</option>';
                                     }
                                     var appendSelectedHTML=`
                                        <div class="firework-widget-settings-column" id="selectedVideodata">
                                        <label>Video</label> <select class="selectedVideo" name="selectedVideo" id="selectedVideo">
                                           <option value="">---Select Video---</option>
                                           `+getlistOption+`
                                        </select>
                                        </div>
                                     `;
                                     $('#selectedVideodata').replaceWith(appendSelectedHTML);
                                  }
                               }
                         },
                         error: function (err) {
                         console.log('Somthing went wrong'+err);    
                         }
                });
       }
    });
});
function getselectedVideoListFun(selectedPlayListValue)
{
    var selectedPlayList =selectedPlayListValue;
     var selectedChannel = document.querySelector("#selectedChannel").value;
    var getChannelSplitArr=selectedChannel.split("~~~");
    var getChannelId=getChannelSplitArr[0];
    if(selectedPlayList)
    {
                $.ajax({
                         url:$('#ajaxgetvideolist').data('action')+'?channelID='+getChannelId+"&playlistID="+selectedPlayList,
                         method: 'GET',
                         success: function (data) {
                            {
                                  var getlistOption;
                                  const {videos} = data;
                                  if(videos.length > 0)
                                  {
                                     for(var i = 0; i < videos.length; i++)
                                     {
                                     getlistOption+='<option value='+videos[i].encoded_id+'>'+videos[i].caption+'</option>';
                                     }
                                     var appendSelectedHTML=`
                                        <div class="firework-widget-settings-column" id="selectedVideodata">
                                        <label>Video</label> <select class="selectedVideo" name="selectedVideo" id="selectedVideo">
                                           <option value="">---Select Video---</option>
                                           `+getlistOption+`
                                        </select>
                                        </div>
                                     `;
                                     $('#selectedVideodata').replaceWith(appendSelectedHTML);
                                  }
                               }
                         },
                         error: function (err) {
                         console.log('Somthing went wrong'+JSON.stringify(err));    
                         }
                });
       }
}

function SelectedVideoAndChannelFun(getChannelId)
{
   var selectedPlayListId=$('#selectedPlayListId').data('id');
   var selectedVideoId=$('#selectedVideoId').data('id');
 $.ajax({
                         url:$('#ajaxgetplayList').data('action')+'?channelID='+getChannelId,
                         method: 'GET',
                         success: function (data) {
                            {
                                  const {playlists} = data;
                                  var getlistOption;
                                  if(playlists.length > 0)
                                  {
                                        for(var i = 0; i < playlists.length; i++)
                                        {
                                           if(selectedPlayListId==playlists[i].id)
                                           {
                                           getlistOption+='<option value="specificVideo">A Specific Video</option>';   
                                           getlistOption+='<option value='+playlists[i].id+' selected >'+playlists[i].display_name+'</option>';
                                           }
                                           else if(selectedPlayListId=='specificVideo')
                                           {
                                           getlistOption+='<option value="specificVideo" selected >A Specific Video</option>';
                                           getlistOption+='<option value='+playlists[i].id+'>'+playlists[i].display_name+'</option>'; 
                                           }
                                           else
                                           {
                                           getlistOption+='<option value="specificVideo">A Specific Video</option>';    
                                           getlistOption+='<option value='+playlists[i].id+'>'+playlists[i].display_name+'</option>'; 
                                           }
                                           
                                        }
                                        var appendSelectedHTML=`
                                           <div class="firework-widget-settings-column" id="selectedPlayListdata">
                                           <label>PlayList</label> <select class="selectedPlayList" name="selectedPlayList" onchange="getselectedVideoListFun(this.value)" id="selectedPlayList">
                                              <option value="">---Select PlayList---</option>
                                              `+getlistOption+`
                                           </select>
                                           </div>
                                        `;
                                        $('#selectedPlayListdata').replaceWith(appendSelectedHTML);
                                  }
                            }
                         },
                         error: function (err) {
                         console.log('Somthing went wrong'+err);    
                         }
                });
                  $.ajax({
                         url:$('#ajaxgetvideolist').data('action')+'?channelID='+getChannelId+"&playlistId="+selectedPlayListId,
                         method: 'GET',
                         success: function (data) {
                            {
                                  var getlistOption;
                                  const {videos} = data;
                                  if(videos.length > 0)
                                  {
                                     for(var i = 0; i < videos.length; i++)
                                     {
                                      if(selectedVideoId==videos[i].encoded_id)
                                           {
                                           getlistOption+='<option value='+videos[i].encoded_id+' selected >'+videos[i].caption+'</option>';
                                           }
                                           else
                                           {
                                           getlistOption+='<option value='+videos[i].encoded_id+'>'+videos[i].caption+'</option>';
                                           }
                                     }
                                     var appendSelectedHTML=`
                                        <div class="firework-widget-settings-column" id="selectedVideodata">
                                        <label>Video</label> <select class="selectedVideo" name="selectedVideo" id="selectedVideo">
                                           <option value="">---Select Video---</option>
                                           `+getlistOption+`
                                        </select>
                                        </div>
                                     `;
                                     $('#selectedVideodata').replaceWith(appendSelectedHTML);
                                  }
                               }
                         },
                         error: function (err) {
                         console.log('Somthing went wrong'+err);    
                         }
                });
}