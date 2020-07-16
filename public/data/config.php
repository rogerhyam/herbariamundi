<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();

require('vendor/autoload.php');

// db credentials are kept here.
require_once('../../mundi_secret.php');

//define('THUMBNAIL_CACHE', 'thumbnail_cache/'); // live
define('THUMBNAIL_CACHE', 'thumbnail_cache/'); // dev

// these are defined once here but should never change
// even in dev environment
define('PROTOCOL_HOST_PORT_DATA', 'https://data.herbariamundi.org');
define('PROTOCOL_HOST_PORT_WWW', 'https://www.herbariamundi.org');

// note core name is defined here
define('SOLR_QUERY_URI','http://localhost:8983/solr/mundi1');

// ORCID Connection details
// client id and secret are loaded in the secret file
// define('ORCID_CLIENT_ID', "XXXXXXXXXXX");
// define('ORCID_CLIENT_SECRET', 'XXXXXXXXXXXXX');
define('ORCID_TOKEN_URI', 'https://orcid.org/oauth/token');

// the redirect uri depends on live or not
if(getenv('HERBARIA_MUNDI_DEV')){
  define('ORCID_REDIRECT_URI', 'http://localhost:3000/orcid_redirect.html');
}else{
  define('ORCID_REDIRECT_URI', 'https://www.herbariamundi.org/orcid_redirect.html');
}

// the login uri is constructed from variables above
define('ORCID_LOGIN_URI', 'https://orcid.org/oauth/authorize?client_id='. ORCID_CLIENT_ID .'&response_type=code&scope=/authenticate&redirect_uri=' . ORCID_REDIRECT_URI);



// create and initialise the database connection
$mysqli = new mysqli($db_host, $db_user, $db_password, $db_database);

// connect to the database
if ($mysqli->connect_error) {
  echo $mysqli->connect_error;
}

if (!$mysqli->set_charset("utf8")) {
  echo printf("Error loading character set utf8: %s\n", $mysqli->error);
}

// all calls must have a user of some kind unless overriden.
if(php_sapi_name() !== 'cli'){

  // check we have a user_id in the session that is in the db
  $valid_session = false;
  if(isset($_SESSION['user_id'])){
     $result = $mysqli->query("SELECT * FROM user where id = " . $_SESSION['user_id'] );
     if($result->num_rows){
        $valid_session = true;
        $user_id = $_SESSION['user_id'];
        $user_name = $_SESSION['user_name'];
     }
  }

  // for simplicity we set the authentication_override to false if it isn't set
  if(!isset($authentication_override)) $authentication_override = false;

  // If we don't have a valid user in the session and 
  // we haven't explicitly overriden the authentication (e.g. for login script)
  // we throw a 403: Forbidden.
  if(!$valid_session &&  !$authentication_override ){
    http_response_code(403);
    exit;
  }

}else{

  // we are called by a cli script so we are by default
  // logged in as user zero
  $user_id = 0;
  $user_name = get_current_user();

}

?>