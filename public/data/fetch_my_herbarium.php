<?php

require_once('config.php');

$out = array();
$out['folders'] = array();
$out['cabinets'] = array();
$out['cabinetIds'] = array();

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




/*

$out = array(

    'folders' => array(
        '1999' => array(
            'id' => '1999',
            'title' => 'Bananas'
        ),
        '22828' => array(
            'id' => '22828',
            'title' => 'Apples'
        ),
        '33' => array(
            'id' => '33',
            'title' => 'Oranges'
        ),
        '34' => array(
            'id' => '34',
            'title' => 'Pears'
        )
    ),
    'cabinets' => array(
        '1' => array(
            "id" => '1',
            "title" => 'Fruits',
            "description" => 'Sweet things',
            "folderIds" => array(
                '1999', '22828', '33'
            )
        ),
        '2' => array(
            "id" => '2',
            "title" => 'Stones',
            "description" => 'Hard things',
            'folderIds' => array('34')
        ),
        '3' => array(
            "id" => '3',
            "title" => 'Animals',
            "description" => 'Fury things',
            'folderIds' => array()
        )
    ),
    'cabinetIds' => array('3', '1', '2')
);
*/

//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo JSON_encode($out);

?>