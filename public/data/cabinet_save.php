<?php

    // save an existing or new cabinet to the db.
    require_once('config.php');
    $cabinet = file_get_contents("php://input");
    $cabinet = JSON_decode($cabinet);
    $cab_id = $cabinet->cabinetId;

    if($cab_id == "_NEW_"){

        // we are adding a new one. It goes after all the others.
        $r = $mysqli->query("SELECT count(*) as n FROM cabinet WHERE owner_id = '{$_SESSION['user_id']}'");
        $row = $r->fetch_assoc();
        $sort_index = $row['n'];

        $stmt = $mysqli->prepare("INSERT INTO cabinet (`title`, `description`, `sort_index`, `owner_id` ) VALUES (?,?,?,?)");
        $stmt->bind_param("ssii", $cabinet->title, $cabinet->description, $sort_index, $_SESSION['user_id']);
        $stmt->execute();

        if($mysqli->error){
            echo $mysqli->error;
        }

        // get the new id 
        $cab_id = $mysqli->insert_id;

    }else{
        $stmt = $mysqli->prepare("UPDATE cabinet SET `title` = ?, `description` = ? WHERE id = ? AND `owner_id` = ?");
        $stmt->bind_param("ssii", $cabinet->title, $cabinet->description, $cab_id, $_SESSION['user_id']);
        $stmt->execute();

        if($mysqli->error){
            echo $mysqli->error;
            error_log($mysqli->error);
        }
        
    }

    // finally return the saved version of tha cabinet as confirmation
    $r = $mysqli->query("SELECT * FROM cabinet WHERE id = $cab_id");
    $row = $r->fetch_assoc();
    $out = array();
    $out['id'] = $row['id'];
    $out['title'] = $row['title'];
    $out['description'] = $row['description'];
    $out['ownerId'] = $row['owner_id'];
    $out['sortIndex'] = $row['sort_index'];
    $out['folderIds'] = array();

    $r = $mysqli->query("SELECT folder_id FROM folder_placement WHERE cabinet_id = $cab_id AND owner_id = {$_SESSION['user_id']} ORDER BY sort_index");
    while($row = $r->fetch_assoc()){
        $out['folderIds'][] = $row['folder_id'];
    }

    header('Content-Type: application/json');       
    echo JSON_encode($out);

?>