<?php

require_once('config.php');
require_once('include/db_functions.php');
require_once('include/solr_functions.php');
require_once('include/curl_functions.php');
require_once('include/Specimen.php');

/*

    Given a seed CETAF ID where the last part of the ID is an integer of the form /[A-Z][0-9]+
    crawl the number space out from that specimen looking for ones we haven't
    come across before.

*/

echo "\nImporting a seeding CETAF ID.\n";

if(count($argv) != 2){
	echo "Error: Please pass in CETAF ID\n";
	exit;
}

$initial_uri = $argv[1];

$matches = array();
if(!preg_match('/^(.*\/[A-Z]+)([0-9]+)$/', $initial_uri, $matches)){
    error_log("Can't parse the initial URI into parts");
}

$seeds = array();

$uri_root = $matches[1];
$places = strlen($matches[2]); // we need to 0 pad after doing maths

crawl($matches[2], 1);

function crawl($seed, $step){
    
    global $places;
    global $uri_root;

    $uri = $uri_root . str_pad(abs($seed), $places, "0", STR_PAD_LEFT);
    echo "Trying $uri  \n";

    $success = false;
    if(db_specimen_exists($uri)){
        // if it is in the db that is good enough
        // don't go calling the URI
        echo "\tFound in DB\n";
        $success = true;
    }else if(db_is_failed_cetaf_id($uri)){
        // if we know it has failed from a previous call
        // we don't look again.
        $success = false;
        echo "\tAlready tried \n";
    }else{
        // it isn't in the db so lets call it and 
        // see if it exists in the world
        $sp = Specimen::createSpecimenFromUri($uri);
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
            // failed to make a specimen so take a note of the 
            // uri we called so we don't call it again
            db_set_failed_cetaf_id($uri);
            echo "\tTagging as failed \n";
            sleep(0.5); // so we don't swamp server with 404
        }
    }
    crawl($seed -1, 1);

}
