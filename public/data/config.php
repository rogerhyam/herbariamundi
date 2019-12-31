<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();

require('vendor/autoload.php');

// db credentials are kept here.
require_once('../../mundi_secret.php');

// URI of OMI-PMH end point at Zenodo to follow
// this is the community with all the specimens in it
define('ZENODO_OAI_PMH_URI', 'https://zenodo.org/oai2d?verb=ListRecords&set=user-bravo&metadataPrefix=oai_dc');

// Where do we store IIIF data from Zenodo
// check permissions on this when installing
// end in slash
//define('ZENODO_SPECIMEN_CACHE', 'zenodo_cache/'); // live
define('ZENODO_SPECIMEN_CACHE', 'data/zenodo_cache/'); // dev

// unfortunately the dev vs live proxying get so complicated that dynamically 
// detecting the host and ip is not possible. Better to set it as config here
//define('PROTOCOL_HOST_PORT', 'http://bravo.rbge.info'); // live
define('PROTOCOL_HOST_PORT', 'http://localhost:3000'); // dev

// create and initialise the database connection
$mysqli = new mysqli($db_host, $db_user, $db_password, $db_database);

// connect to the database
if ($mysqli->connect_error) {
  echo $mysqli->connect_error;
}

if (!$mysqli->set_charset("utf8")) {
  echo printf("Error loading character set utf8: %s\n", $mysqli->error);
}
// create an anonymous use if there isn't already one.
if(!isset($_SESSION['user_id'])){

  $access_token = session_id();
  $result = $mysqli->query("SELECT * FROM User where orcid is null and access_token='$access_token'");

  if($result->num_rows){
    $row = $result->fetch_assoc();
    $_SESSION['user_id'] = $row['id'];
    $_SESSION['user_name'] = $row['name'];
  }else{
    $name = 'Anonymous';
    $mysqli->query("INSERT INTO user (`name`, `access_token`) values ('$name', '$access_token')");
    $_SESSION['user_id'] = $mysqli->insert_id;
    $_SESSION['user_name'] = $name;
  }

}

// so we have them handy

$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];

?>