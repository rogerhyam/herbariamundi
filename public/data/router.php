<?php

// This file handles the routing for IIIF requests


// this bit is used during development to simulate .htaccess for the iiif directory
// in production uri's starting with iiif don't come here
$matches = array();
if (!preg_match('/\/iiif(.*)/', $_SERVER["REQUEST_URI"], $matches)) {
    return false;  
}
$iiif_path = $matches[1];


// even in production this is the full request URI so we can parse it and 
// server the appropriate IIIF response
$full_path = $_SERVER["REQUEST_URI"];

echo "<p>$full_path</p>";


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