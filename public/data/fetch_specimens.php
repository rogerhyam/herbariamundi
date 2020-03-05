<?php
require_once('config.php');
require_once('include/solr_functions.php');

$payload = file_get_contents("php://input");

// the payload is as good as ready to go
// as a SOLR query
// we convert it to a PHP object to check
// a few things are in order
$payload = JSON_decode($payload);

// never return more than 100 for safety
if(!isset($payload->limit)){
    $payload->limit =100;
}

// all the error handling etc is done in the frontend
$response = solr_run_search($payload);

header('Content-Type: application/json');
echo JSON_encode($response);

?>