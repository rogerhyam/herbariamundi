<?php

    require_once('config.php');
    require_once('folder_common.php');

    $payload = file_get_contents("php://input");
    $payload = JSON_decode($payload);
    $folder_id = $payload->folderId;
    $specimen_db_id = $payload->specimenDbId; // this is the database id

    // work out how we place it at the end of the folder
    $sort_index = 0;
    $stmt = $mysqli->prepare("SELECT max(sort_index) FROM specimen_placement WHERE folder_id = ? AND owner_id = ?");
    $stmt->bind_param("ii", $folder_id, $user_id);
    $stmt->execute();
    $stmt->bind_result($sort_index);
    $stmt->fetch();
    $stmt->close();
    $sort_index++;

    // add the specimen
    $stmt = $mysqli->prepare("INSERT INTO specimen_placement (folder_id, specimen_id, owner_id, sort_index) VALUES (?,?,?,?)");
    echo $mysqli->error;
    $stmt->bind_param("iiii", $folder_id, $specimen_db_id, $user_id, $sort_index);
    $stmt->execute();
    $stmt->close();

    // return a complete folder for replacement.
    $folder = get_folder($folder_id);

    header('Content-Type: application/json');
    echo JSON_encode($folder);
    
?>