<?php

require_once('config.php');
require_once('include/db_functions.php');
require_once('include/solr_functions.php');
require_once('include/curl_functions.php');
require_once('include/Specimen.php');


echo "\nIngesting from Zenodo\n";

// manually pass in number of days back

if(count($argv) != 2){
	echo "Error: Please pass in an integer number of days back in time to start.\n\n";
	exit;
}

$days = (int)$argv[1];

if(!is_int($days)){
    echo "Error: $days is not an integer!\n\n";
    exit;
}

echo "Going back $days days\n";

$json = file_get_contents('https://data.herbariamundi.org/since.php?days_back=' . $days);
$response = json_decode($json);

foreach($response->ids as $cetaf_id){

    echo "$cetaf_id\n";
    
    $success = false;
    if(db_specimen_exists($cetaf_id)){
        // if it is in the db that is good enough
        // don't go calling the URI
        echo "\tin DB already. Skipping.\n";
    }else{
        // it isn't in the db so lets call it and 
        // see if it exists in the world
        $sp = Specimen::createSpecimenFromUri($cetaf_id);
        if($sp){
            echo "\tSpecimen created \n";
            if($sp->saveToDb()){
                echo "\tSpecimen saved to db \n";
                $success = true; // it is enough to have it in the db
                if($sp->saveToSolr()){
                    echo "\tSpecimen indexed \n";
                }
            }
        }else{
            echo "\tFailed \n";
            sleep(0.5); // so we don't swamp server with 404
        }
    }

}
