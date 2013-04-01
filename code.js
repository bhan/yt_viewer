var curPlist = -1; var curVideo; var delayTimer;
var lastState; 
// tells onPlayerStateChange whether to update the video info
var updateInfo = true;
// array of video id's
var plist = new Array(); 
var plistDiv;
// associative array of {videoId: position in plist}
var plistHash = new Array(); var plistTable;
var repeat = false; var shuffle = false;
var instant = false;
var firstPop = true;

// adds currently playing video to playlist
function addToPlaylist(id) {
  if(!(id in plistHash)) {
    plist.push(id); plistHash[id] = plist.length-1;
    curPlist = plist.length-1;
    var table = document.getElementById('playlistTable');
    var entry = "<div id='p-"+id+"'>";
    entry+="<td width='30'>";
    entry+="<img onclick=\'playEntry(\""+id+"\");\' src='play.png' width='30' height='30'>";
    entry+="</td><td>";
    entry+=document.getElementById("info-"+id).innerHTML;
    entry+="</td><td width='30'>";
    entry+="<img src='remove.png' width='30' height='30' onclick='removeEntry(\""+id+"\");'>";
    entry+="</td>";
    entry+="</div>";
    row = table.insertRow(plist.length-1);
    row.innerHTML = entry;
  }
}
//add entry to playlist
function addEntry(id) {
  if(!(id in plistHash)) {
    plist.push(id); plistHash[id] = plist.length-1;
    if(curVideo == id)
      curPlist = plist.length-1;
    var table = document.getElementById('playlistTable');
    var entry = "<div id='p-"+id+"'>";
    entry+="<td width='30'>";
    entry+="<img onclick=\'playEntry(\""+id+"\");\' src='play.png' width='30' height='30'>";
    entry+="</td><td>";
    entry+=document.getElementById(id).innerHTML;
    entry+="</td><td width='30'>";
    entry+="<img src='remove.png' width='30' height='30' onclick='removeEntry(\""+id+"\");'>";
    entry+="</td>";
    entry+="</div>";
    row = table.insertRow(plist.length-1);
    row.innerHTML = entry;
  }
}

function regularSearch() {
  clearTimeout(delayTimer);
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
  };
}

function delaySearch(e) {
  var key;
  if(window.event)
      key = window.event.keyCode;
  else
      key = e.which;
  
  // disable form enter
  if(key == 13) {
    regularSearch();
    return false;
  }
  if(!instant)
    return;
    
  clearTimeout(delayTimer);
  delayTimer = setTimeout(regularSearch, 300);
  return true;
}
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}
// This function is called when an error is thrown by the player
function onPlayerError(errorCode) {
  console.log("error: "+errorCode);
}
// This function is called when the player changes state
function onPlayerStateChange(newState) {
  if(newState==0 && curPlist != -1) {
    if(shuffle) {
      var index = Math.random()*plist.length;
      curPlist = Math.floor(index);
    }
    else {
      curPlist++;
      if(curPlist >= plist.length) {
        curPlist = 0;
      }
    }
    ytplayer.loadVideoById(plist[curPlist]);
    updateVideo();
  }
  // if a sequence of -1, 3 happens or 5 happens, implying a switched video
  if((lastState==-1 && (newState==3 || newState==1)) || (newState==5)){
    //fallback in case user clicks within video
    if(updateInfo)
      updateVideo();
    else
      updateInfo = true;
  }
  
  // repeat video
  if(repeat && !newState && curPlist == -1) {
      ytplayer.playVideo();
  }
  lastState = newState;
}
// This function is automatically called by the player once it loads
function onYouTubePlayerReady(playerId) {
  ytplayer = document.getElementById("ytPlayer");
  ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
  ytplayer.addEventListener("onError", "onPlayerError");
  ytplayer.playVideo();
}
//play entry from playlist
function playEntry(id) {
  ytplayer.loadVideoById(id);
  curPlist = plistHash[id];
}
//play video from search results
function playVideo(id) {
  ytplayer.loadVideoById(id);
  updateInfo = false;
  var info="<img src='add.png' onclick='addEntry(\""+id+"\");' width='20' height='20'/>";
  info+=document.getElementById(id).innerHTML;
  updateHTML('info',info);
  curVideo = id;
  updateUrl(info);
  curPlist = -1;
}
//remove entry from playlist
function removeEntry(id) {
  var i = plistHash[id];
  delete plistHash[id];
  for(key in plistHash) {
    if(plistHash[key] > i)
      plistHash[key]-=1;
  }
  table = document.getElementById('playlistTable');
  table.deleteRow(i); 
  plist.splice(i, 1);
  if(plist.length == 0) {
    curPlist = -1;
  }
}

function toggleInstant() {
  instant = !instant;
}
function toggleRepeat() {
  repeat = !repeat;
}
function toggleShuffle() {
  shuffle = !shuffle;
}

// Update a particular HTML element with a new value
function updateHTML(elmId, value) {
  document.getElementById(elmId).innerHTML = value;
}
function updateUrl(data) {
  window.history.pushState(
    {"curVideo": curVideo,"data":data},curVideo, "?v="+curVideo);
}
// update video info when user clicks within video
function updateVideo() {
  var url = ytplayer.getVideoUrl();
  var pos = url.search("v=")+2;
  curVideo = url.substr(pos, 11);
  var request = $.ajax({
    url: "updateVideo.php",
    type: "GET",
    data: {
      'id': curVideo
    },
    dataType: "html"
  });
  
  request.done(function(data) {
    updateHTML('info', data);
    updateUrl(data);
  });
  
  request.fail(function(jqXHR, textStatus, errorThrown) {
    alert("Request failed: "+textStatus+errorThrown);
  });
}
// The "main method" of this sample. Called when someone clicks "Run".
function loadPlayer() {
  // Lets Flash from another domain call JavaScript
  var params = { allowScriptAccess: "always", allowFullScreen: "true"};
  // The element id of the Flash embed
  var atts = { id: "ytPlayer" };
  var vars = getUrlVars();
  curVideo = "GhFSgnvKqm4";
  if(vars['v'])
    curVideo = vars['v'];
  swfobject.embedSWF("http://www.youtube.com/e/"+curVideo+
    "?version=3&enablejsapi=1&playerapiid=ytplayer&fs=1", 
    "videoDiv", "600", "360", "9", null, null, params, atts);
}
function _run() {
  loadPlayer();
}

window.onpopstate = function(event) {
  // chrome has this when the page is first navigated to
  // this is a hack
  if(firstPop) {
    firstPop = false;
    return;
  }
  updateInfo = false;
  ytplayer.loadVideoById(event.state["curVideo"]);
  updateHTML("info",event.state["data"]);
};

google.setOnLoadCallback(_run);