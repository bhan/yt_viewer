<?
$id = $_GET['id'];

$feed = "https://gdata.youtube.com/feeds/api/videos/$id";
$sxml = simplexml_load_file($feed);

$title = $sxml->title;
$author = $sxml->author->name;
echo "<table><tr><td width='20'>";
echo "<img src='add.png' onclick='addToPlaylist(\"$id\");' width='20' height='20'/>";
echo "</td><td>";
echo "<div id='info-$id'><a href='http://www.youtube.com/user/$author' target='_blank'>$author</a> $title</div>";
echo "</td></tr></table>";
?>