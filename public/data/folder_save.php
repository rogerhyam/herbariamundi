<?php

    // save an existing or new cabinet to the db.
    require_once('config.php');
    $folder = file_get_contents("php://input");
    $folder = JSON_decode($folder);
    $folder_id = $folder->folderId;
    $cabinet_id = $folder->cabinetId;

    if($folder_id == "_NEW_"){

        // we are adding a new one. It goes after all the others.
        $r = $mysqli->query("SELECT count(*) as n FROM folder_placement WHERE owner_id = $user_id AND cabinet_id = $cabinet_id");
        $row = $r->fetch_assoc();
        $sort_index = $row['n'];

        $stmt = $mysqli->prepare("INSERT INTO Folder (`title`, `description` ) VALUES (?,?)");
        $stmt->bind_param("ss", $folder->title, $folder->description);
        $stmt->execute();
        $stmt->close();

        if($mysqli->error) echo $mysqli->error;

        // get the new id 
        $folder_id = $mysqli->insert_id;

        // place the folder.
        $stmt = $mysqli->prepare("INSERT INTO folder_placement (`folder_id`, `cabinet_id`, `owner_id`, `sort_index`) VALUES (?,?,?,?)");
        $stmt->bind_param("iiii", $folder_id, $cabinet_id, $user_id, $sort_index);
        $stmt->execute();
        $stmt->close();

    }else{
        // FIXME: UPDATING TIME
        error_log('updating');
    }

    // finally return the saved version of tha cabinet as confirmation
    $r = $mysqli->query("SELECT * FROM Folder as f join folder_placement as p on f.id = p.folder_id WHERE f.id = $folder_id and p.owner_id = $user_id");
    $row = $r->fetch_assoc();
    $out = array();
    $out['id'] = $row['id'];
    $out['title'] = $row['title'];
    $out['description'] = $row['description'];
    $out['sortIndex'] = $row['sort_index'];
    $out['cabinetId'] = $row['cabinet_id'];
    $out['specimenIds'] = array();

    $r = $mysqli->query("SELECT specimen_id FROM specimen_placement WHERE folder_id = $folder_id AND owner_id = $user_id ORDER BY sort_index");
    while($row = $r->fetch_assoc()){
        $out['specimenIds'][] = $row['specimen_id'];
    }

    header('Content-Type: application/json');
    echo JSON_encode($out);

?>