<?php

$authentication_override = true;
require_once('config.php');

$user_id = 1;

require_once('include/db_functions.php');
require_once('include/solr_functions.php');

switch ($_GET['type']) {
    case 'dets':
        if($_GET['verb'] == 'count'){
            count_dets();
        }else{
            csv_dets();
        }
        break;
    case 'tags':
        if($_GET['verb'] == 'count'){
            count_tags();
        }else{
            csv_tags();
        }
        break;
    default:
        echo "What do you want?";
        break;
}

function count_dets(){

    global $user_id;
    global $mysqli;

    $out = array();

    $response = $mysqli->query("SELECT count(*) as n from `determination` as d where d.user_id = $user_id;");
    $row = $response->fetch_assoc();

    $out['count'] = $row['n'];
    $out['countDisplay'] = number_format($row['n']);
    $out['data_type'] = 'determinations';
    
    header('Content-Type: application/json');
    echo JSON_encode($out);

}

function count_tags(){

    global $user_id;
    global $mysqli;

    $out = array();

    $response = $mysqli->query("SELECT count(*) as n from `tag_placement` as d where d.user_id = $user_id;");
    $row = $response->fetch_assoc();

    $out['count'] = $row['n'];
    $out['countDisplay'] = number_format($row['n']);
    $out['data_type'] = 'tags';
    
    header('Content-Type: application/json');
    echo JSON_encode($out);

}

function csv_tags(){

    global $mysqli;
    global $user_id;

    $out = array();

    // add the col names first
    $col_names = get_specimen_col_names();
    $col_names[] = 'tag_text';
    $col_names[] = 'tag_date_time';
    $col_names[] = 'tag_by_user_name';
    $col_names[] = 'tag_by_orcid';
    $col_names[] = 'tag_date_time';
    $out[] = $col_names;

    $response = $mysqli->query("SELECT t.tag_text, p.created, s.cetaf_id_normative as specimen_id, u.name as user_name, u.orcid
        FROM tag as t 
        JOIN tag_placement as p on t.id = p.tag_id 
        JOIN specimen as s on p.specimen_id = s.id
        JOIN `user` as u on p.user_id = u.id 
        WHERE p.user_id = $user_id;");


    while($row = $response->fetch_assoc()){
        
        $tag = get_specimen_cols($row['specimen_id']);

        $tag[] = '#' . $row['tag_text'];
        $tag[] = $row['created'];

        $tag[] = $row['user_name'];
        $tag[] = $row['orcid'];
        $tag[] = $row['created'];

        $out[] = $tag;
    }

    return_csv($out);
}

function csv_dets(){

    global $mysqli;
    global $user_id;

    $out = array();

    // add the col names first
    $col_names = get_specimen_col_names();
    
    $col_names[] = 'WFO_taxon_versioned';
    $col_names[] = 'WFO_link';
    $col_names[] = 'WFO_scientificName';
    $col_names[] = 'WFO_scientificNameAuthorship';
    $col_names[] = 'WFO_taxonomicStatus';
    $col_names[] = 'WFO_family';

    $col_names[] = 'det_by_user_name';
    $col_names[] = 'det_by_orcid';
    $col_names[] = 'det_date_time';

    $out[] = $col_names;

    $response = $mysqli->query("SELECT d.id as det_id, s.cetaf_id_normative as specimen_id, s.cetaf_id_preferred as cetaf_id, u.name as user_name, u.orcid, d.created, d.wfo_raw 
    from `determination` as d 
    join `specimen` as s on d.specimen_id = s.id 
    join `user` as u on d.user_id = u.id 
    where d.user_id = $user_id;");
   
    while($row = $response->fetch_assoc()){
   
        $det = get_specimen_cols($row['specimen_id']);
   
        $wfo_item = json_decode($row['wfo_raw']);
        if($wfo_item){

            $det[] = $wfo_item->id;
            $det[] = 'https://www.worldfloraonline.org/taxon/'. $wfo_item->taxonID_s;
            $det[] = $wfo_item->scientificName_s;
            $det[] = $wfo_item->scientificNameAuthorship_s;
            $det[] = $wfo_item->taxonomicStatus_s;
            $det[] = $wfo_item->family_s;

        }else{
            $pad = array_pad(array(), 6, '');
            $det = array_merge($det, $pad);
        }

        $det[] = $row['user_name'];
        $det[] = $row['orcid'];
        $det[] = $row['created'];
    
        //print_r($row);

        $out[] = $det;
    }

    return_csv($out);

}

function get_specimen_col_names(){
    $col_names = array();
    
    $col_names[] = 'CETAF ID';
    $col_names[] = 'Collector_name';
    $col_names[] = 'Collector_number';
    $col_names[] = 'Collection_year';
    $col_names[] = 'Country_ISO_code';
    $col_names[] = 'Host_institution';

    return $col_names;
}

function get_specimen_cols($specimen_id){

    $specimen = solr_get_doc_by_id($specimen_id);

    $sp = array();

    $sp[] = $specimen->cetaf_id_preferred_s;

    if($specimen){

        if(isset($specimen->collector_ss)){
            $sp[] = implode('|', $specimen->collector_ss);
        }else{
            $sp[] = '';
        }

        if(isset($specimen->collector_number_ss)){
            $sp[] = implode('|', $specimen->collector_number_ss);
        }else{
            $sp[] = '';
        }
        if(isset($specimen->collection_year_i)){
            $sp[] = $specimen->collection_year_i;
        }else{
            $sp[] = '';
        }
        if(isset($specimen->country_code_ss)){
            $sp[] = implode('|', $specimen->country_code_ss);
        }else{
            $sp[] = '';
        }

        $sp[] = $specimen->provider_name_s;

    }else{
        $sp = array_pad($sp, 5, '');
    }

    return $sp;

}

function return_csv($rows){

    $file_name = 'herbariamundi_' . $_GET['type'] . '_' . date(DATE_ATOM) . '.csv';

    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="'.$file_name.'"');

    $out = fopen('php://output', 'w');
    foreach($rows as $row){
        fputcsv($out, $row);
    }
    fclose($out);

}


?>