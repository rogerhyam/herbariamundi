<?php

require_once('config.php');
require_once('include/solr_functions.php');

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
    $sql = "SELECT s.cetaf_id_normative from specimen_placement as p join specimen as s on p.specimen_id = s.id WHERE p.folder_id = {$folder['id']} AND p.owner_id = $user_id";
    $r2 = $mysqli->query($sql);
    while($row2 = $r2->fetch_assoc()){
        
        $folder['specimenIds'][] = $row2['cetaf_id_normative'];

        // get the actual specimen from solr
        $out['specimens']['byId'][$row2['cetaf_id_normative']] = solr_get_doc_by_id($row2['cetaf_id_normative']);

    }
    $out['folders'][$folder['id']] = $folder;
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