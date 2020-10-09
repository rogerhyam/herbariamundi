<?php

$authentication_override = true;
require_once('config.php');

$user_id = 1;

require_once('include/db_functions.php');
require_once('include/solr_functions.php');

$response = $mysqli->query("SELECT d.id as det_id, s.cetaf_id_normative as specimen_id, s.cetaf_id_preferred as cetaf_id, u.name as user_name, u.orcid, d.created, d.wfo_raw 
    from `determination` as d 
    join `specimen` as s on d.specimen_id = s.id 
    join `user` as u on d.user_id = u.id 
    where d.user_id = $user_id;");
    
$out = array();
while($row = $response->fetch_assoc()){
    $det = array();
    
    $det[] = $row['cetaf_id'];
    
    $specimen = solr_get_doc_by_id($row['specimen_id']);
    if($specimen){

        if(isset($specimen->collector_ss)){
            $det[] = implode('|', $specimen->collector_ss);
        }else{
            $det[] = '';
        }

        if(isset($specimen->collector_number_ss)){
            $det[] = implode('|', $specimen->collector_number_ss);
        }else{
            $det[] = '';
        }
        if(isset($specimen->country_code_ss)){
            $det[] = implode('|', $specimen->country_code_ss);
        }else{
            $det[] = '';
        }
        if(isset($specimen->collection_year_i)){
            $det[] = $specimen->collection_year_i;
        }else{
            $det[] = '';
        }

        $det[] = $specimen->provider_name_s;

    }else{
        $det[] = '';
    }

    $wfo_item = json_decode($row['wfo_raw']);
    if($wfo_item){

        $det[] = $wfo_item->id;
        $det[] = 'https://www.worldfloraonline.org/taxon/'. $wfo_item->taxonID_s;
        $det[] = $wfo_item->scientificName_s;
        $det[] = $wfo_item->scientificNameAuthorship_s;
        $det[] = $wfo_item->taxonomicStatus_s;
        $det[] = $wfo_item->family_s;

    }else{

        $det[] = '';
        $det[] = '';
        $det[] = '';
        $det[] = '';
        $det[] = '';
        $det[] = '';


    }
    $det[] = $row['user_name'];
    $det[] = $row['orcid'];
    $det[] = $row['created'];
    
    //print_r($row);

    $out[] = $det;
}

print_r($out);

//header('Content-Type: application/json');
//echo JSON_encode(array('logged_out' => true));

?>