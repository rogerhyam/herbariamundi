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
define('ZENODO_OAI_PMH_URI', 'https://zenodo.org/oai2d');

// Where do we store IIIF data from Zenodo
// check permissions on this when installing
// end in slash
//define('ZENODO_SPECIMEN_CACHE', 'zenodo_cache/'); // live
define('ZENODO_SPECIMEN_CACHE', 'data/zenodo_cache/'); // dev


//define('THUMBNAIL_CACHE', 'thumbnail_cache/'); // live
define('THUMBNAIL_CACHE', 'thumbnail_cache/'); // dev

// these are defined once here but should never change
// even in dev environment
define('PROTOCOL_HOST_PORT_DATA', 'https://data.herbariamundi.org');
define('PROTOCOL_HOST_PORT_WWW', 'https://www.herbariamundi.org');

// note core name is defined here
define('SOLR_QUERY_URI','http://localhost:8983/solr/mundi1');

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
if(php_sapi_name() !== 'cli'){

  // check we have a user_id in the session that is  in the db
  $valid_session = false;
  if(isset($_SESSION['user_id'])){
     $result = $mysqli->query("SELECT * FROM user where id = " . $_SESSION['user_id'] );
     if($result->num_rows){
        $valid_session = true;
     }
  }
  // no valid session so create one
  if(!$valid_session){
    $access_token = session_id();
    $result = $mysqli->query("SELECT * FROM user where orcid is null and access_token='$access_token'");
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

}else{

  $user_id = 0;
  $user_name = get_current_user();

}

?>