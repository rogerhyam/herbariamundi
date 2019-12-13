<?php

    require_once('config.php');
    require_once('folder_common.php');

    $payload = file_get_contents("php://input");
    $payload = JSON_decode($payload);
    $folder_id = $payload->folderId;
    $specimen_id = $payload->specimenId;

     // add the specimen
     $stmt = $mysqli->prepare("DELETE FROM specimen_placement WHERE folder_id = ? and specimen_id = ? and owner_id = ?");
     echo $mysqli->error;
     $stmt->bind_param("iii", $folder_id, $specimen_id, $user_id);
     $stmt->execute();
     $stmt->close();

    // return a complete folder for replacement in UI
    $folder = get_folder($folder_id);

    header('Content-Type: application/json');
    echo JSON_encode($folder);


?>