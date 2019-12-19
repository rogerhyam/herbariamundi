<?php
require_once('config.php');

$payload = file_get_contents("php://input");
$payload = JSON_decode($payload);
$search_text = $payload->searchText;

if(isset($payload->limit)){
    $limit = $payload->limit;
}else{
    $limit = 20;
    $payload->limit =$limit;
}

if(isset($payload->offset)){
    $offset = $payload->offset;
}else{
    $offset = 0;
    $payload->offset =$offset;
}

$sql = "SELECT * from specimen as s join cetaf_id as c on s.id = c.specimen_id WHERE MATCH(s.index_string) AGAINST('$search_text')limit $limit";

$result = $mysqli->query($sql);

$out = array();
while ($row = $result->fetch_assoc()) {

    $specimen = new stdClass();
    $specimen->id = $row['id'];
    $specimen->cetaf_id = $row['cetaf_id'];
    $specimen->title =  $row['title'];
    $specimen->iiif_manifest_uri = $row['iiif_manifest_uri'];
    $specimen->thumbnail_uri = $row['thumbnail_path'];
    $out[$row['id']] = $specimen;

}

header('Content-Type: application/json');
$out = array("specimens" => $out, "searchParams" => $payload);
echo JSON_encode($out);

?>