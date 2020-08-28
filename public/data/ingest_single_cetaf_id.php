<?php

require_once('config.php');
require_once('include/db_functions.php');
require_once('include/solr_functions.php');
require_once('include/curl_functions.php');
require_once('include/Specimen.php');


echo "\nImporting a single CETAF ID - great for testing.\n";

if(count($argv) != 2){
	echo "Error: Please pass in CETAF ID\n";
	exit;
}

$cetaf_id = $argv[1];

echo $cetaf_id . "\n";

$sp = Specimen::createSpecimenFromUri($cetaf_id);

if($sp){
    echo "Specimen created \n";
    if($sp->saveToDb()){
        echo "Specimen saved to db \n";
        if($sp->saveToSolr()){
            echo "Specimen indexed \n";
        }
    }
}
echo "Job done \n\n";
