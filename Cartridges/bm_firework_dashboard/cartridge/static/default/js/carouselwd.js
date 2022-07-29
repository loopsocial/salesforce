document.addEventListener("click", function () {
    var selectedChannel = document.querySelector("#selectedChannel").value;
    var getChannelSplitArr=selectedChannel.split("~~~");
    var getChannelId=getChannelSplitArr[0];
    var getChannelUsername=getChannelSplitArr[1];
    var selectedPlayList = document.querySelector("#selectedPlayList").value;
    var minimizedVideoPlayerLocation;
    if(document.querySelector('input[name=minimized_video_player_location]:checked').value && document.querySelector('input[name=minimized_video_player_location]:checked').value!=null )
    {
     minimizedVideoPlayerLocation =document.querySelector('input[name=minimized_video_player_location]:checked').value;
    }
    
    var message={};
    message.selectedChannel=getChannelUsername;
    message.selectedChannelData=selectedChannel;
    message.selectedPlayList=selectedPlayList;
    message.minimizedVideoPlayerLocation=minimizedVideoPlayerLocation;
    if(selectedChannel && selectedPlayList && minimizedVideoPlayerLocation)
    {
    message.action='done';
    window.parent.postMessage(message, "*");
    }
    else
    {
     message.action='invalid';  
     window.parent.postMessage(message, "*");
    }
  // Send `message` to the parent using the postMessage method on the window.parent reference.
  
});
document.addEventListener('DOMContentLoaded', function ()
{   
 if(document.querySelector("#selectedChannel").value)
 {
    var selectedChannel = document.querySelector("#selectedChannel").value;
    var getChannelSplitArr=selectedChannel.split("~~~");
    var getChannelId=getChannelSplitArr[0];
    SelectedVideoAndChannelFun(getChannelId);
 }
 $('#selectedPlayListdata').append(`<label>PlayList </label><select name="selectedPlayList" id="selectedPlayList"><option value="">---Select Playlist---</option></select>`);
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
                                 if(undefined !== playlists.length && playlists.length)
                                    {
                                        for(var i = 0; i < playlists.length; i++)
                                        {
                                           getlistOption+='<option value='+playlists[i].id+'>'+playlists[i].display_name+'</option>';
                                        }
                                        var appendSelectedHTML=`
                                           <div class="firework-widget-settings-column" id="selectedPlayListdata">
                                           <label>PlayList</label> <select class="selectedPlayList" name="selectedPlayList" id="selectedPlayList">
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
       }
    });
});

function SelectedVideoAndChannelFun(getChannelId)
{
   var selectedPlayListId=$('#selectedPlayListId').data('id');
 $.ajax({
                         url: $('#ajaxgetplayList').data('action')+'?channelID='+getChannelId,
                         method: 'GET',
                         success: function (data) {
                            {
                                  const {playlists} = data;
                                  var getlistOption;
                                  if(undefined !== playlists.length && playlists.length)
                                    {
                                        for(var i = 0; i < playlists.length; i++)
                                        {
                                           if(selectedPlayListId==playlists[i].id)
                                           {
                                           getlistOption+='<option value='+playlists[i].id+' selected >'+playlists[i].display_name+'</option>';
                                           }
                                           else
                                           {
                                           getlistOption+='<option value='+playlists[i].id+'>'+playlists[i].display_name+'</option>'; 
                                           }
                                        }
                                        var appendSelectedHTML=`
                                           <div class="firework-widget-settings-column" id="selectedPlayListdata">
                                           <label>PlayList</label> <select class="selectedPlayList" name="selectedPlayList" id="selectedPlayList">
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
}