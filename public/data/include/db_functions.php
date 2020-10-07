<?php

/**
 * Given a cetaf_id will search db and find
 * Doesn't matter if cetaf_id is canonical or redirect id
 * 
 * @return associate array or false if it isn't in db. cetaf_id value may be an array.
 */
function db_get_specimen_data_by_row_id($row_id){

    global $mysqli;

    $out = array();

    // specimen actual data
    $response = $mysqli->query("SELECT * FROM specimen WHERE id = $row_id");
    if($response->num_rows == 0) return null;
    $out = $response->fetch_assoc();

    return $out;

}

/**
 * Will create or update specimen record with new
 * data.
 * the $cetaf_id may be an array if more than one is known
 * 
 * @return rowId or false on failure
 * 
 */

function db_set_data_for_specimen($cetaf_id, $raw){

    global $mysqli;
    $cetaf_id_preferred = $cetaf_id;
    $cetaf_id_normative = preg_replace('/^http:|^https:/i', '', $cetaf_id);

    // look to see if any of the ids are in the database
    $sql = "SELECT * FROM specimen WHERE cetaf_id_normative = '$cetaf_id_normative'";
    
    $response = $mysqli->query($sql);

    // if we can't find any then we will add them
    if($response->num_rows == 0){
        $specimen_id = null;
    }else{

        $rows = $response->fetch_all(MYSQLI_ASSOC);
        $specimen_id = $rows[0]['id'];
    }

    if($specimen_id){
        // we have a specimen_id so we are updating a row
        $stmt = $mysqli->prepare("UPDATE specimen SET `raw` = ?, `cetaf_id_normative` = ?, `cetaf_id_preferred` = ? WHERE id = ?");
        $stmt->bind_param('sssi', $raw, $cetaf_id_normative, $cetaf_id_preferred, $specimen_id);
        $stmt->execute();

    }else{
        
        // we don't have a specimen_id so we are creating
        $stmt = $mysqli->prepare("INSERT INTO specimen (`raw`, `cetaf_id_normative`, `cetaf_id_preferred`) VALUES (?, ?, ?)");
        $stmt->bind_param('sss', $raw, $cetaf_id_normative, $cetaf_id_preferred);
        $stmt->execute();
        $specimen_id = $mysqli->insert_id;

    }

    return $specimen_id;

}
function db_get_genera($text){

    global $mysqli;

    $genera = array();
    $words = str_word_count($text, 1);
    $words = array_unique($words);

    foreach($words as $word){

        // we assume capitalised first letter - no numbers
        if(!preg_match('/^[A-Z][a-z]+$/', $word)) continue;

        // longer than two unless it is the trivial pusuit genera
        if(strlen($word) < 3 && $word != 'Aa' && $word != 'Io') continue;
        
        $sql = "select * from genus_name where genus = '$word'";
        $r = $mysqli->query($sql);

        if($r->num_rows > 0){
            $genera[] = $word;
        }

    }

    return $genera;

}

function db_set_iiif_status($db_id, $status){
    
    global $mysqli;

    $stmt = $mysqli->prepare("UPDATE specimen SET iiif_status = ? WHERE id = ?;") ;
    $stmt->bind_param('si', $status, $db_id);
    $stmt->execute();
    $stmt->close();

    return true;

}

function db_specimen_exists($cetaf_id){

    global $mysqli;

    $cetaf_id_normative = preg_replace('/^http:|^https:/i', '', $cetaf_id);

    $stmt = $mysqli->prepare("SELECT count(*) as n FROM specimen WHERE `cetaf_id_normative` = ?") ;
    $stmt->bind_param('s', $cetaf_id_normative);
    $stmt->execute();
    $stmt->bind_result($n);
    $stmt->fetch();
    $stmt->close();

    if($n > 0) return true;
    else return false;

}

function db_set_failed_cetaf_id($cetaf_id){

    global $mysqli;

    $stmt = $mysqli->prepare("INSERT INTO cetaf_id_fails (`cetaf_id`) VALUES (?)");
    $stmt->bind_param('s', $cetaf_id);
    $stmt->execute();

}

function db_is_failed_cetaf_id($cetaf_id){

    global $mysqli;

    $stmt = $mysqli->prepare("SELECT count(*) as n FROM cetaf_id_fails WHERE `cetaf_id` = ?") ;
    $stmt->bind_param('s', $cetaf_id);
    $stmt->execute();
    $stmt->bind_result($n);
    $stmt->fetch();
    $stmt->close();

    if($n > 0) return true;
    else return false;
}

function db_enqueue_specimen_for_indexing($specimen_db_id){

    global $mysqli;
    $stmt = $mysqli->prepare("UPDATE specimen SET indexing_requested = now() WHERE id = ?");
    $stmt->bind_param('i', $specimen_db_id);
    $stmt->execute();
    /*
    ALTER TABLE `mundi`.`specimen` 
    ADD COLUMN `indexing_requested` DATETIME NULL AFTER `iiif_status`;
    */

}

function db_dequeue_specimen_for_indexing($specimen_db_id){

    global $mysqli;
    $stmt = $mysqli->prepare("UPDATE specimen SET indexing_requested = NULL WHERE id = ?");
    $stmt->bind_param('i', $specimen_db_id);
    $stmt->execute();
    /*
    ALTER TABLE `mundi`.`specimen` 
    ADD COLUMN `indexing_requested` DATETIME NULL AFTER `iiif_status`;
    */

}

?>