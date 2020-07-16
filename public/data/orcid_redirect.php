<?php

$authentication_override = true;
require_once('config.php');

// will be called with the access code for authentication
$access_code = $_GET['code'];

$post_fields = array(
    'client_id' => ORCID_CLIENT_ID,
    'client_secret' => ORCID_CLIENT_SECRET,
    'grant_type' => 'authorization_code',
    'code' => $access_code,
    'redirect_uri' => ORCID_REDIRECT_URI
);

// var_dump($post_fields);

// we need to use this code to get the access token
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, ORCID_TOKEN_URI);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_fields));

$data = curl_exec($ch);

$orcid_response = json_decode($data);

// var_dump($orcid_response);

// what kind of response is it?
if(isset($orcid_response->access_token) ){

    // we are in 
    echo 'we are here;';

    // does the user exist in the db
    $stmt = $mysqli->prepare("SELECT id FROM user WHERE orcid = ?");
    $stmt->bind_param("s", $orcid_response->orcid);
    $stmt->execute();
    echo $mysqli->error;
    $stmt->bind_result($user_id);
    $stmt->fetch();
    $stmt->close();
    
    if($user_id){
        // the user already exists - update with latest tokens.
        $stmt = $mysqli->prepare("UPDATE user SET 
            `access_token` = ?, 
            `refresh_token` = ?, 
            `expires_in` = ?, 
            `name` = ?, 
            `raw` = ? 
            WHERE id = ?");
        $stmt->bind_param("ssissi",
            $orcid_response->access_token,
            $orcid_response->refresh_token,
            $orcid_response->expires_in,
            $orcid_response->name,
            $data,
            $user_id
         );
        $stmt->execute();
        echo $mysqli->error;
        $stmt->close();

    }else{
        // this is a new user - we need to create them
        // the user already exists - update with latest tokens.
        $stmt = $mysqli->prepare("INSERT INTO user ( 
            `orcid`,
            `access_token`, 
            `refresh_token`, 
            `expires_in`, 
            `name`, 
            `raw` 
            ) VALUES ( ?,?,?,?,?,?)");
        $stmt->bind_param("sssiss",
            $orcid_response->orcid,
            $orcid_response->access_token,
            $orcid_response->refresh_token,
            $orcid_response->expires_in,
            $orcid_response->name,
            $data
         );
        $stmt->execute();
        echo $mysqli->error;
        $user_id = $mysqli->insert_id;
        $stmt->close();

    }

    // we are safely logged in so add the $user_id and name to the session
    $_SESSION['user_id'] = $user_id;
    $_SESSION['user_name'] = $orcid_response->name;
    $_SESSION['orcid'] = $orcid_response->orcid;

    $message = '<h2>Success!</h2>';
    $message .= "<button onclick=\"closeWindowAndRefresh()\">Close</button>";

    render_html_page($message, true);

}else{

    // failed to log in
    session_unset();

    $message = '<h2>Failed</h2><dl>';
    foreach ($orcid_response as $key => $value) {
        $message .= "<dt>$key<dt><dd>$value</dd>";
    }
    $message .= '</dl>';
    $message .= "<button onclick=\"closeWindowAndRefresh()\">Close</button>";

    render_html_page($message, false);

}

/*
object(stdClass)#2 (7) {
  ["access_token"]=>
  string(36) "a2e741bc-2c81-4039-be59-eaa252e6f603"
  ["token_type"]=>
  string(6) "bearer"
  ["refresh_token"]=>
  string(36) "fe41dd4b-0a34-48aa-b5fd-b839dd0f49d1"
  ["expires_in"]=>
  int(631138518)
  ["scope"]=>
  string(13) "/authenticate"
  ["name"]=>
  string(10) "Roger Hyam"
  ["orcid"]=>
  string(19) "0000-0003-4581-1379"
}

*/


/*
curl -i -L -k -H 'Accept: application/json' --data '
client_id=APP-M2OKX0CJNXE9CBMO
&client_secret=18aae478-1e6b-40c1-8492-5ffd1ca66b77
&grant_type=authorization_code
&redirect_uri=http://127.0.0.1:3100/data/orcid_redirect.php
&code=REPLACE WITH OAUTH CODE' 
https://orcid.org/oauth/token
*/

// very simple page
function render_html_page($message, $auto_close){
    if($auto_close){ echo "<script>closeWindowAndRefresh();</script>"; }
    echo "<h1>ORCiD Sign In Response</h1>";
    echo $message;
}
?>