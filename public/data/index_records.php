<?php

require_once('config.php');
require_once('include/solr_functions.php');

if(php_sapi_name() !== 'cli'){
    echo 'Command line only!';
    exit;
}

$ops = getopt('i:r:a:');

if(count($ops) == 0){
    echo "\nUse -i to specify specimen by cetaf_id\n";
    echo "Use -r to specify specimen by row id \n";
    echo "Use -a ALL to work through all records in the db \n\n";
}

if(isset($ops['i'])){
    index_record_by_cetaf_id($ops['i']);
}

if(isset($ops['r'])){
    index_record_by_row_id($ops['r']);
}

if(isset($ops['a'])){
    $result = $mysqli->query("SELECT id FROM specimen limit 10");
    while($row = $result->fetch_assoc()){
        index_record_by_row_id($row['id']);
    }
}


function index_record_by_row_id($row_id){
    $out = solr_index_specimen_by_id($row_id);
    print_r($out);
}


function index_record_by_cetaf_id($cetaf_id){
    echo "Not implemented yet";
}


?>