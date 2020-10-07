<?php

require_once('config.php');
require_once('include/db_functions.php');
require_once('include/solr_functions.php');
require_once('include/curl_functions.php');
require_once('include/Specimen.php');


echo "\nImporting a file of CETAF IDs - one per line.\n";

if(php_sapi_name() !== 'cli'){
    echo "Command line only!\n";
    exit;
}

$ops = getopt('f:l:o:');


// get the list of lines in the file
if(isset($ops['f'])){
    $lines = file($ops['f']);
    echo "FILE: {$ops['f']}.\n"; 
    $n = number_format(count($lines));
    echo "COUNT: $n lines in file.\n"; 
}else{
    echo "ERROR: You need to set a file with the -f option\n";
    exit;
}

// have the given a limit?
if(isset($ops['l'])){
    $limit = (int)$ops['l'];
    echo "LIMIT: $limit specimens.\n"; 
}else{
    $limit = -1;
    echo "LIMIT: Not set.\n";
}

// offset
if(isset($ops['o'])){
    $offset = (int)$ops['o'];
    echo "OFFSET: Skip $offset specimens.\n"; 
}else{
    $offset = 0;
    echo "OFFSET: Not set.\n";
}

echo "--------\n";

$offset_count = 0;
$limit_count = 0;
$line_count = 0;
foreach($lines as $line){
    
    if($offset_count < $offset){
        $offset_count++;
        $line_count++;
        continue;
    } 

    if($limit != -1 && $limit_count >= $limit){
        echo "\nReached limit of $limit \n";
        break; 
    }else{
        $limit_count++;
    }

    $cetaf_id = trim($line);

    // clunge for underscores in BGBM ids
    if(preg_match('/\/\/herbarium.bgbm.org\/.*_.*/', $cetaf_id)){
        $cetaf_id = str_replace('_', '', $cetaf_id);
        echo "Removed underscore from BGBM id\n";
    }

    echo "$line_count : $cetaf_id \n";
    
    $sp = Specimen::createSpecimenFromUri($cetaf_id);
    
    if($sp){
        echo "\tSpecimen created \n";
        if($sp->saveToDb()){
            echo "\tSpecimen saved to db \n";
            if($sp->saveToSolr()){
                echo "\tSpecimen indexed \n";
            }
        }
    }else{
        echo "\tSpecimen NOT created! See errors.\n";
    }

    $line_count++;
}

echo "Job done \n\n";
