var repeat = false;
var delayTimer = null;
var curVideo;
var playlist = new Array();
var p = "";
var curPlaylist = -1;
var shuffle = false;
var playlistDiv;
var playlistTable;
var playlistHash = new Array();

function updateUrl() {
  window.history.pushState(curVideo, curVideo, "?v="+curVideo);
  //window.history.pushState(curVideo, curVideo, "?v="+curVideo+"&i="+curPlaylist+"&p="+p);
}

function addToPlaylist(id) {
  if(!(id in playlistHash)) {
    playlist.push(id);
    playlistHash[id] = playlist.length-1;
    var table = document.getElementById('playlistTable');
    var entry = "<div id='p-"+id+"'>";
    entry+="<td width='30'>";
    entry+="<img onclick=\'play(\""+id+"\");\' src='play.png' width='30' height='30'>";
    entry+="</td><td>";
    entry+=document.getElementById(id).innerHTML;
    entry+="</td><td width='30'>";
    entry+="<img src='close.gif' width='30' height='30' onclick='removeFromPlaylist(\""+id+"\");'>";
    entry+="</td>";
    entry+="</div>";
    row = table.insertRow(playlist.length-1);
    row.innerHTML = entry;
  }
}

function removeFromPlaylist(id) {
  var i = playlistHash[id];
  delete playlistHash[id];
  for(key in playlistHash) {
    if(playlistHash[key] > i)
      playlistHash[key]-=1;
  }
  table = document.getElementById('playlistTable');
  table.deleteRow(i);
  playlist.splice(i, 1);
}

function play(id) {
  ytplayer.loadVideoById(playlist[playlistHash[id]]);
  curPlaylist = playlistHash[id];
  //document.getElementById('repeatButton').style.visibility = 'hidden';
}

function playVideo(id) {
  ytplayer.loadVideoById(id);
  //document.getElementById('repeatButton').style.visibility = 'visible';
  curPlaylist = -1;
  shuffle = false;
}

function toggleShuffle() {
  shuffle = !shuffle;
}

function delaySearch(e) {
  var key;
  if(window.event)
      key = window.event.keyCode;
  else
      key = e.which;
  
  // disable form enter
  if(key == 13)
      return false;
  
  clearTimeout(delayTimer);
  delayTimer = setTimeout(function() {
      loadSearch();
  }, 300);
  return true;
}

function loadSearch() {
  var key = document.search.searchBox.value;
  
  if(key == ""){
      updateHTML("results","");
  }
  else {
    var request = $.ajax({
      url: "search.php",
      type: "GET",
      data: {
        'key': key
      },
      dataType: "html"
    });
    
    request.done(function(data) {
      updateHTML("results",data);
    });
    
    request.fail(function(jqXHR, textStatus, errorThrown) {
      console.log("Request failed: "+textStatus+errorThrown);
    });
  }
}

// This function is called when a video changes
function updateVideo() {
  var url = ytplayer.getVideoUrl();
  var pos = url.search("v=")+2;
  curVideo = url.substr(pos, 11);
  updateUrl();
  var request = $.ajax({
    url: "updateVideo.php",
    type: "GET",
    data: {
      'key': curVideo
    },
    dataType: "html"
  });
  
  request.done(function(data) {
    updateHTML('info', data);
  });
  
  request.fail(function(jqXHR, textStatus, errorThrown) {
    alert("Request failed: "+textStatus+errorThrown);
  });
}

// This function is called when an error is thrown by the player
function onPlayerError(errorCode) {
}

var lastState = null;
// This function is called when the player changes state
function onPlayerStateChange(newState) {
  console.log("laststate:"+lastState+"current:"+newState);
  // if a sequence of -1, 3 happens or 5 happens, implying a switched video
  if(newState==0 && curPlaylist != -1) {
    if(shuffle) {
      var index = Math.random()*playlist.length;
      console.log(index);
      curPlaylist = Math.floor(index);
    }
    else {
      curPlaylist++;
      if(curPlaylist >= playlist.length) {
        curPlaylist = 0;
      }
    }
    ytplayer.loadVideoById(playlist[curPlaylist]);
    updateVideo();
  }
  
  if((lastState==-1 && (newState==3 || newState==1)) || (newState==5)){
    updateVideo();
  }
  else if(repeat && !newState && curPlaylist == -1) {
      ytplayer.playVideo();
  }
  
  lastState = newState;
}

function toggleRepeat() {
  repeat = !repeat;
  if(repeat) {
      // play video if stopped and user presses repeat
      if(!ytplayer.getPlayerState()) {
          ytplayer.playVideo();
      }
  }
}

// Update a particular HTML element with a new value
function updateHTML(elmId, value) {
  document.getElementById(elmId).innerHTML = value;
}

// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("ytPlayer");
  ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
  ytplayer.addEventListener("onError", "onPlayerError");
  var vars = getUrlVars();
  curVideo = vars['v'];
  if(curVideo != "undefined") {
      ytplayer.loadVideoById(curVideo.substring(0, 11));
  }
  /*
  p = vars['p'];
  console.log(p.length);
  for(var i = 0; i < p.length; i+=11) {
    playlist.push(p.substring(i, i+11));
  }
  */
}

// The "main method" of this sample. Called when someone clicks "Run".
function loadPlayer() {
  // Lets Flash from another domain call JavaScript
  var params = { allowScriptAccess: "always", allowFullScreen: "true"};
  // The element id of the Flash embed
  var atts = { id: "ytPlayer" };
  swfobject.embedSWF("http://www.youtube.com/e/GhFSgnvKqm4"+
      "?version=3&enablejsapi=1&playerapiid=ytplayer&fs=1", 
      "videoDiv", "600", "360", "9", null, null, params, atts);
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

function _run() {
  loadPlayer();
}

google.setOnLoadCallback(_run);