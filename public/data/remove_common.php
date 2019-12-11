<?php

function remove_cabinet($cabinet_id){

    global $mysqli;
    global $user_id;

    // remove all the specimens and all the folders before we remove the cabinet itself.
    $r = $mysqli->query("SELECT folder_id from folder_placement WHERE cabinet_id = $cabinet_id AND owner_id = $user_id");
    while($row = $r->fetch_assoc()){
        remove_folder($row['folder_id']);
    }

    // actually remove the cabinet.
    $stmt = $mysqli->prepare("DELETE FROM Cabinet where `id` = ? and `owner_id` = ?");
    $stmt->bind_param("ii", $cabinet_id, $user_id);
    $stmt->execute();
    $stmt->close();

    // FIXME: update the sort_index fields so they are sequential?

}

function remove_folder($folder_id){

    global $mysqli;
    global $user_id;

    remove_specimens_from_folder($folder_id);
    remove_folder_from_cabinet($folder_id);

    // remove the folder itself
    $stmt = $mysqli->prepare("DELETE FROM Folder where `id` = ?");
    $stmt->bind_param("i", $folder_id);
    $stmt->execute();
    $stmt->close();

}

function remove_specimens_from_folder($folder_id){

    global $mysqli;
    global $user_id;
    
    // remove the specimens from the folder
    $stmt = $mysqli->prepare("DELETE FROM specimen_placement where `owner_id` = ? and `folder_id` = ?");
    $stmt->bind_param("ii", $user_id, $folder_id);
    $stmt->execute();
    $stmt->close();
}

function remove_folder_from_cabinet($folder_id){

    global $mysqli;
    global $user_id;

    // remove the folder from the cabinet
    $stmt = $mysqli->prepare("DELETE FROM folder_placement where `owner_id` = ? and `folder_id` = ?");
    $stmt->bind_param("ii", $user_id, $folder_id);
    $stmt->execute();
    $stmt->close();

    // FIXME: update the sort_index fields so they are sequential?
}


?>