<?php

require_once('config.php');

/* 
Takes the Zenodo record id that have been stored in the database by the OAI harvester
and calls them to update or create the specimen records.
*/

echo "Starting harvest.\n";

$result = $mysqli->query("SELECT zenodo_id FROM zenodo_oai_changes ORDER BY change_noticed ASC");

$total_rows = $result->num_rows;

echo "Found $total_rows to process.\n";

$row_count = 0;
while($row = $result->fetch_assoc()){
    import_specimen($row['zenodo_id']);
    sleep(1); // zenodo will block us if we go too fast
    $row_count++;
    echo "$row_count of $total_rows\n";
}

echo "Finished.\n";


// --------- F U N C T I O N S ---------------

function import_specimen($record_id){

    global $mysqli;

    $url = "https://zenodo.org/api/records/$record_id";
    $response = file_get_contents($url);
    $header = parseHeaders($http_response_header);
    
    if($header['reponse_code'] == '429'){
        echo "Too many connections - waiting a minute then will try next.\n";
        sleep(60);
        return;
    }

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

    // take it off the do list
    $mysqli->query("DELETE FROM zenodo_oai_changes WHERE zenodo_id = $record_id");
    if($mysqli->error) echo $mysqli->error;
    
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

function parseHeaders( $headers )
{
    $head = array();
    foreach( $headers as $k=>$v )
    {
        $t = explode( ':', $v, 2 );
        if( isset( $t[1] ) )
            $head[ trim($t[0]) ] = trim( $t[1] );
        else
        {
            $head[] = $v;
            if( preg_match( "#HTTP/[0-9\.]+\s+([0-9]+)#",$v, $out ) )
                $head['reponse_code'] = intval($out[1]);
        }
    }
    return $head;
}


?>