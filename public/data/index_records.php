<?php

require_once('config.php');
require_once('include/solr_functions.php');

if(php_sapi_name() !== 'cli'){
    echo 'Command line only!';
    exit;
}

$ops = getopt('i:r:a:l');

if(count($ops) == 0){
    echo "\nUse -i to specify specimen by cetaf_id\n";
    echo "Use -r to specify specimen by row id \n";
    echo "Use -a ALL to work through all records in the db \n";
    echo "Use -l Latest to work through records tagged for re-indexing \n\n";
}

if(isset($ops['i'])){
    index_record_by_cetaf_id($ops['i']);
}

if(isset($ops['r'])){
    index_record_by_row_id($ops['r']);
}

if(isset($ops['a'])){

    $result = $mysqli->query("SELECT count(*) as n FROM specimen");
    $row = $result->fetch_assoc();
    $total = $row['n'];
    
    $result = $mysqli->query("SELECT id FROM specimen");
    $count = 0;
    $display_length = 0;
    while($row = $result->fetch_assoc()){
        index_record_by_row_id($row['id']);
        $count++;
        
        echo str_repeat(chr(8), $display_length); // rewind
        echo str_repeat(" ", $display_length); // blank
        echo str_repeat(chr(8), $display_length); // rewind
        
        $percentage = round(($count/$total)*100);
        $display = sprintf("%s |%s| %s", number_format($count), str_pad(str_repeat("=", $percentage), 100, "-"), number_format($total) );
        $display_length = strlen($display);
        
        echo $display;

        if($count % 1000 == 0){
            echo "\nSolr Commit\n";  
            solr_commit();
        }
    }
    echo "\nSolr Commit\n"; 
    solr_commit();
}

if(isset($ops['l'])){

    $result = $mysqli->query("SELECT count(*) as n FROM specimen WHERE indexing_requested IS NOT NULL");
    $row = $result->fetch_assoc();
    $total = $row['n'];

    $result = $mysqli->query("SELECT id FROM specimen WHERE indexing_requested IS NOT NULL ORDER BY indexing_requested ASC");
    $count = 0;
    $display_length = 0;
    while($row = $result->fetch_assoc()){
        index_record_by_row_id($row['id']);
        $count++;
        
        echo str_repeat(chr(8), $display_length); // rewind
        echo str_repeat(" ", $display_length); // blank
        echo str_repeat(chr(8), $display_length); // rewind
        
        $percentage = round(($count/$total)*100);
        $display = sprintf("%s |%s| %s", number_format($count), str_pad(str_repeat("=", $percentage), 100, "-"), number_format($total) );
        $display_length = strlen($display);
        
        echo $display;

        if($count % 1000 == 0){
            echo "\nSolr Commit\n";  
            solr_commit();
        }
    }
    echo "\nSolr Commit\n"; 
    solr_commit();

}

function index_record_by_row_id($row_id){
    $out = solr_index_specimen_by_id($row_id);
    solr_commit();
}

function index_record_by_cetaf_id($cetaf_id){
    echo "Not implemented yet";
}


?>