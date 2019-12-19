<?php

require_once('config.php');

$out = array();
$out['folders'] = array();
$out['cabinets'] = array();
$out['cabinetIds'] = array();
$out['specimens'] = array();
$out['specimens']['byId'] = array();

$all_specimen_ids = array();

// populate the folders
$r = $mysqli->query("SELECT * from folder join folder_placement on folder.id = folder_placement.folder_id  WHERE owner_id = $user_id");
while($row = $r->fetch_assoc()){

    $folder = array();
    $folder['id'] = $row['id'];
    $folder['title'] = $row['title'];
    $folder['description'] = $row['description'];

    $folder['specimenIds'] = array();
    $r2 = $mysqli->query("SELECT specimen_id from specimen_placement WHERE folder_id = {$folder['id']} AND owner_id = $user_id");
    while($row2 = $r2->fetch_assoc()){
        $folder['specimenIds'][] = $row2['specimen_id'];
        $all_specimen_ids[] = $row2['specimen_id'];
    }

    $out['folders'][$folder['id']] = $folder;
}

// add all the specimens that were mentioned in folders.
if(count($all_specimen_ids) > 0){

    $all_specimen_ids = array_unique($all_specimen_ids);
    $all_specimens_list = implode(',', $all_specimen_ids);
    $sql = "SELECT * from specimen as s join cetaf_id as c on s.id = c.specimen_id where s.id in ($all_specimens_list)";
    $out['specimens']['sql'] = $sql; // FIXME
    $result = $mysqli->query($sql);
    while( $row = $result->fetch_assoc() ) {
        $specimen = new stdClass();
        $specimen->id = $row['id'];
        $specimen->cetaf_id = $row['cetaf_id'];
        $specimen->title =  $row['title'];
        $specimen->iiif_manifest_uri = $row['iiif_manifest_uri'];
        $specimen->thumbnail_uri = $row['thumbnail_path'];

        $out['specimens']['byId'][$specimen->id] = $specimen;

    }
}

// populate the cabinets
$r = $mysqli->query("SELECT * from cabinet WHERE owner_id = $user_id ORDER BY sort_index ");
while($row = $r->fetch_assoc()){
    $cabinet = array();
    $cabinet['id'] = $row['id'];
    $cabinet['title'] = $row['title'];
    $cabinet['description'] = $row['description'];
    $cabinet['sortIndex'] = $row['sort_index'];
    $cabinet['folderIds'] = array();

    $r2 = $mysqli->query("SELECT folder_id from folder_placement WHERE cabinet_id = {$cabinet['id']} AND owner_id = $user_id");
    while($row2 = $r2->fetch_assoc()){
        $cabinet['folderIds'][] = $row2['folder_id'];
    }

    $out['cabinets'][$cabinet['id']] = $cabinet;

    // also add it to the list 
    $out['cabinetIds'][] = $cabinet['id'];
}


//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo JSON_encode($out);

?>