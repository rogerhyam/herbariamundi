<?php
require_once('config.php');

$sql = "SELECT * from specimen as s join cetaf_id as c on s.id = c.specimen_id limit 10 offset " . rand(0, 49990);

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
//print_r($out);

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
$out = array("specimens" => $out);
echo JSON_encode($out);

?>