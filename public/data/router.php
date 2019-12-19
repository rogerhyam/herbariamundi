<?php

// used during development to simulate .htaccess for the iiif directory
$matches = array();
if (!preg_match('/\/iiif(.*)/', $_SERVER["REQUEST_URI"], $matches)) {
    return false;  
}

// so we could have all iiif stuff coming here and just parse the path
// we could use .htaccess in production and just route through this script in dev.

// FIXME - in production the original $_SERVER["REQUEST_URI"] may not be passed so we #
// may need to pass it as a param and detect that.

$full_path = $_SERVER["REQUEST_URI"];

echo "<p>$full_path</p>";

$iiif_path = $matches[1];

if(preg_match('/^\/presentation/', $iiif_path)){
    echo "<p>We are calling the presentation api</p>";

    // set up variables from the path parts
    // include the manifest script.

}

if(preg_match('/^\/image/', $iiif_path)){
    echo "<p>We are calling the IMAGE API</p>";

    // set up variables from the path parts
    // include the image.json script or images server
    
}

?>