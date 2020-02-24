<?php

require_once('config.php');
require_once('include/solr_functions.php');

/* 
Takes the Zenodo record id that have been stored in the database by the OAI harvester
and calls them to update or create the specimen record and index it.


Later .. 

Auto tagging with family ending in aceae or 

Apiaceae=Umbelliferae
Arecaceae=Palmae 
Asteraceae=Compositae
Brassicaceae=Cruciferae
Clusiaceae=Guttiferae
Fabaceae=Leguminosae
Lamiaceae=Labiatae
Poaceae=Gramineae

Also use regex to find lat/lon
^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$
groups 1 and 4 contain latitude and longitude respectively


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
break;
}

echo "Finished.\n";


// --------- F U N C T I O N S ---------------

function import_specimen($record_id){

    global $mysqli;
  
    $url = "https://zenodo.org/api/records/$record_id";
    echo "Calling Zenodo with : $url";
    $response = file_get_contents($url);
    $header = parseHeaders($http_response_header);
    
    if($header['reponse_code'] == '429'){
        echo "Too many connections - waiting a minute then will try next one.\n";
        sleep(60);
        return;
    }

    $record = json_decode($response);

    // here on in we deal with concept IDs and record IDs so we can track versions
    // The specimen ID is the concept ID. That is what we use in the CETAF_ID
    // https://data.herbariamundi.org/10.5281/zenodo.3588258

    // does a specimen record exist?
    $specimen_id = null;
    $stmt = $mysqli->prepare("SELECT id from specimen where cetaf_id_normative = ?;");
    $cetaf_id = '//data.herbariamundi.org/' . $record->conceptdoi;
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
        $specimen_id = create_specimen($record);
    }

    // index it
    if($specimen_id){
        $out = solr_index_specimen_by_id($specimen_id);
        solr_commit();
        print_r($out);
    }

    // take it off the do list
    $mysqli->query("DELETE FROM zenodo_oai_changes WHERE zenodo_id = $record_id");
    if($mysqli->error) echo $mysqli->error;
    
}

function update_specimen($specimen_id, $record){

    global $mysqli;

    // all that can change is the metadata.
    // the ids all remain the same.
    
    $raw = json_encode($record);
    $stmt = $mysqli->prepare("UPDATE specimen SET `raw` = ? WHERE id = ?");
    $stmt->bind_param(
        'si',
        $raw,
        $specimen_id
    );
    $stmt->execute();
    echo $mysqli->error;    
    echo "Updated $specimen_id \n";
}

function create_specimen($record){

    global $mysqli;

    $cetaf_id_normative = '//data.herbariamundi.org/' . $record->conceptdoi;
    $cetaf_id_preferred = 'https:' . $cetaf_id_normative;
    $raw_format = 'zenodo+json';

    $raw = json_encode($record);

    $stmt_sp = $mysqli->prepare("INSERT INTO specimen (`cetaf_id_normative`,`cetaf_id_preferred`,`raw`, `raw_format` ) VALUES (?,?,?,?);");
    $stmt_sp->bind_param(
        'ssss',
        $cetaf_id_normative,
        $cetaf_id_preferred,
        $raw,
        $raw_format
    );
    $stmt_sp->execute();
    if($mysqli->error){
        echo $mysqli->error;
        return null;
    }else{
        $specimen_id = $mysqli->insert_id;
        echo "\nCreated $specimen_id as $cetaf_id_preferred \n";
        return $specimen_id;
    }

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