<?php

// just saves an image in a folder for the specimen.
require_once('config.php');

$out = array();

$specimen_data_string = file_get_contents("php://input");
$specimen_data = JSON_decode($specimen_data_string);

// the way we handle temp specimens is that they are created as a folder that contains the images and associated metadata.
// an entry is added to the main specimens table with the user_id in the owner_id column.
// we can then treat them like regular specimens for being moved about etc
// the manifest path is local to the server

// save a dump of all the data submitted
$target_dir = USER_DATA_DIR_ROOT_DIR . $user_id . '/' . $specimen_data->specimenId . '/';
file_put_contents($target_dir . 'submitted_data.json', $specimen_data_string);

$title = $specimen_data->genus . ' ' . $specimen_data->specificEpithet . ' ' . ' - ' . $specimen_data->collector . ' ' . $specimen_data->collectorNumber;
$title = trim($title);
$manifest_uri = "/iiif/manifest.php?user_id=$user_id&specimen_id=". $specimen_data->specimenId;
$thumbnail_path =  "/iiif/image_server.php?user_id=$user_id&specimen_id=" . $specimen_data->specimenId;
$rdf = $specimen_data_string;
$index_string = $title;

$stmt = $mysqli->prepare("INSERT INTO specimen (title, iiif_manifest_uri, thumbnail_path, rdf, index_string, owner_id ) VALUES (?,?,?,?,?,?) ");
$out['sql_error'] = $stmt->error;
$stmt->bind_param("sssssi", $title, $manifest_uri, $thumbnail_path, $rdf, $index_string, $user_id);
$out['sql_error2'] = $stmt->error;
$stmt->execute();
$out['sql_error3'] = $stmt->error;
$stmt->close();



$out['request'] = $specimen_data;

header('Content-Type: application/json');
echo JSON_encode($out);

?>