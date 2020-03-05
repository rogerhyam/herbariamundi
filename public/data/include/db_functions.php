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

function db_set_data_for_specimen($cetaf_id, $raw, $raw_format){

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
        $stmt = $mysqli->prepare("UPDATE specimen SET `raw` = ?, `raw_format` = ?, `cetaf_id_normative` = ?, `cetaf_id_preferred` = ? WHERE id = ?");
        $stmt->bind_param('ssssi', $raw, $raw_format, $cetaf_id_normative, $cetaf_id_preferred, $specimen_id);
        $stmt->execute();

    }else{
        
        // we don't have a specimen_id so we are creating
        $stmt = $mysqli->prepare("INSERT INTO specimen (`raw`, `raw_format`, `cetaf_id_normative`, `cetaf_id_preferred`) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('ssss', $raw, $raw_format, $cetaf_id_normative, $cetaf_id_preferred);
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

function db_get_zenodo_mappings($uri){

    global $mysqli;

    $out = array();

    $stmt = $mysqli->prepare("SELECT `solr_field`, `value` FROM zenodo_subject_mapping WHERE uri = ?");
    $stmt->bind_param('s', $uri);
    $stmt->execute();
    $stmt->bind_result($field, $value);
    while($stmt->fetch()){
        $out[] = (object)array(
            'field' => $field,
            'value' => $value
        );
    }
    $stmt->close();

    return $out;

}

?>