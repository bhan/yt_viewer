<?
$key = $_GET['key'];

$feed = 'https://gdata.youtube.com/feeds/api/videos?q='.$key;
$sxml = simplexml_load_file($feed);

$arr = array();
echo "<table border='1'>";
foreach ($sxml -> entry as $entry) {
  $author = $entry->author->name;
  $content = $entry->content;
  $id = substr($entry->id, -11, 11);
  $thumbnail = "http://i.ytimg.com/vi/$id/0.jpg";
  $title = $entry->title;
  $media = $entry->children('http://gdata.youtube.com/schemas/2007');
  if($media->statistics) {
    $attrs = $media->statistics->attributes();
    $views = $attrs['viewCount'];
  }
  else {
    $views = 0;
  }
  echo "<tr id='result'>
    <td width='120'>
     <div style=\"position:relative;\">
      <div style=\"position:absolute;top:0;left:0;\">
       <img src='play.png' onclick=\"playVideo('$id');\" width='32' height='32'/>
      </div>
      <div style=\"position:absolute;bottom:0;left:0;\">
       <img src='add.png' onclick='addEntry(\"$id\");' width='30' height='30'/>
      </div>
      <img src='$thumbnail' width='120' height='90'/>
     </div>
    </td>
    <td valign='top' align='left'>
     <span id='$id'><a href=http://www.youtube.com/user/$author target=_blank>
       $author</a> $title
     </span> 
     <br> $views views
    </td>
  </tr>";
}
echo "</table>"
?>
