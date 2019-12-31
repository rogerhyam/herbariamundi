<?php

// follow the OAI-PMH end point for the target community in Zenodo
// copy/upate any specimen records it mentions

require_once('config.php');


/* 

We don't actually bother parsing the OAI response as it doesn't contain the data we want beyond the record key. We use that to call the rest API and get the JSON.
    
We look for all specimens modified since the last one we looked at.

We only harvest the images the first time we meet a specimen not on modification as the files themselves are immutable.

Protocol description here

http://www.openarchives.org/OAI/openarchivesprotocol.html#ListRecords

FIXME: handle deleting records

*/
    
$resumptionToken = true;

while($resumptionToken){    

    $start_date = get_last_update_date();

    $matches = array();
    $url = ZENODO_OAI_PMH_URI . '&from=' . $start_date;
    if(!is_bool($resumptionToken) && strlen($resumptionToken) > 0){
        $url .= "&resumptionToken=$resumptionToken";
    }

    echo $url;
    
    $response = file_get_contents($url);

    preg_match_all('/https:\/\/zenodo.org\/record\/([0-9]+)/', $response, $matches, PREG_PATTERN_ORDER);

    // if we don't have any record ids then we are done here
    if(count($matches[1]) == 0){
        echo "\nNo more records modified since:  $start_date \n"; 
        break;
    } 

    // work through the matching records
    foreach($matches[1] as $record_id){
        import_specimen($record_id);
    }

    // if there is a resumptionToken then we go around a gain.
    // if not we break
    $response = str_replace(array("\n", "\r"), '', $response); // just incase it is split cross lines
    $token_matches = array();
    if(preg_match('/<resumptionToken [^>]*>(.*)<\/resumptionToken>/', $response, $token_matches)){
        $resumptionToken = $token_matches[1];
        echo "\nResumption token set so continuing: $resumptionToken \n";
    }else{
        echo "\nNo resumption token set so stopping. \n";
        $resumptionToken = false;
    }

}

// --------- F U N C T I O N S ---------------

function import_specimen($record_id){

    global $mysqli;

    $url = "https://zenodo.org/api/records/$record_id";
    $response = file_get_contents($url);
    $record = json_decode($response);

    // here on in we deal with concept IDs and record IDs so we can track versions
    // The specimen ID is the concept ID. That is what we use in the CETAF_ID
    // https://herbariamundi.org/10.5281/zenodo.3588258

    // does a specimen record exist?
    $stmt = $mysqli->prepare("SELECT s.id from specimen as s join cetaf_id as c on s.id = c.specimen_id where c.cetaf_id = ?;");
    $cetaf_id = 'https://herbariamundi.org/' . $record->conceptdoi;
    $stmt->bind_param('s', $cetaf_id);
    $stmt->execute();
    $stmt->bind_result($specimen_id);
    if($stmt->fetch()){
        // it does exist update it
        $stmt->close();
        update_specimen($specimen_id, $record);
    }else{
        // it doesn't exist create it
        $stmt->close();
        create_specimen($record);
    }
    
}

function update_specimen($specimen_id, $record){

    global $mysqli;

    // all that can change is the metadata.
    // the ids all remain the same.
    $title = $record->metadata->title;
    $raw = json_encode($record);
    $index_string = substr( strip_tags($record->metadata->description), 0, 1000);

    $stmt = $mysqli->prepare("UPDATE specimen SET `title` = ?, `raw` = ?, `index_string` = ? WHERE id = ?");
    if ( false===$stmt ) {
        echo $mysqli->error;
    }
    $stmt->bind_param(
        'sssi',
        $title,
        $raw,
        $index_string,
        $specimen_id
    );
    echo $mysqli->error;
    $stmt->execute();
    
    echo "Updated $specimen_id \n";

}

function create_specimen($record){

    global $mysqli;

    // do this in a transaction as we need to be sure the cetaf_id and specimen tables keep in sync

    $cetaf_id = 'https://herbariamundi.org/' . $record->conceptdoi;
    //  $iiif_manifest_uri = "/iiif/presentation/" . $record->conceptrecid . '/manifest';
    $title = $record->metadata->title;
    // $thumbnail_path = "/iiif/image/" . $record->conceptrecid . "/full/150,/0/default.jpg";
    $raw = json_encode($record);
    $index_string = substr( strip_tags($record->metadata->description), 0, 1000);

    $stmt_sp = $mysqli->prepare("INSERT INTO specimen (`title`, `raw`, `index_string`) VALUES (?,?,?);");
    $stmt_sp->bind_param(
        'sss',
        $title,
        $raw,
        $index_string
    );
    $stmt_cetaf = $mysqli->prepare("INSERT INTO cetaf_id (`cetaf_id`, `specimen_id`) VALUES (?,?);");

    $mysqli->begin_transaction(MYSQLI_TRANS_START_READ_WRITE);
    $stmt_sp->execute();
    $specimen_id = $mysqli->insert_id;
    
    if($specimen_id){
        $stmt_cetaf->bind_param(
            'si',
            $cetaf_id,
            $specimen_id
        );
        $stmt_cetaf->execute();
    }

    if($mysqli->error){
        echo $mysqli->error;
        $mysqli->rollback();
    }else{
        $mysqli->commit();
    }
    
    echo "\nCreated $cetaf_id \n";
/*
id, iiif_manifest_uri, title, thumbnail_path, raw, index_string
*/
}

function get_last_update_date(){
    
    global $mysqli;

    // get the last modified zenodo specimen we have and work forward from there
    $response = $mysqli->query("SELECT max(modified) as latest FROM mundi.specimen;");
    $row = $response->fetch_assoc();
    $phpdate = strtotime( $row['latest'] );

    return date( 'c', $phpdate );

}

?>