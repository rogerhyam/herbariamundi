<?php

require_once('config.php');
require_once('include/solr_functions.php');

if(php_sapi_name() !== 'cli'){
    echo 'Command line only!';
    exit;
}

$ops = getopt('i:r:');

if(count($ops) == 0){
    echo "\nUse -i to specify specimen by cetaf_id\n";
    echo "Use -r to specify specimen by row id \n\n";
}

if(isset($ops['i'])){
    index_record_by_cetaf_id($ops['i']);
}

if(isset($ops['r'])){
    index_record_by_row_id($ops['r']);
}


function index_record_by_row_id($row_id){
    $out = solr_index_specimen_by_id($row_id);
    print_r($out);
}


function index_record_by_cetaf_id($cetaf_id){
    echo "Not implemented yet";
}


?>