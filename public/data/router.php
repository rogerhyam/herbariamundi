<?php

require_once('config.php');

// This file handles the routing for IIIF requests


// this bit is used during development to simulate .htaccess for the iiif directory
// in production uri's starting with iiif don't come here
$matches = array();
if (!preg_match('/\/iiif(.*)/', $_SERVER["REQUEST_URI"], $matches)) {
    return false;  
}
$iiif_path = $matches[1];

// all iiif requests will contain the object identifier 

// looking for presenation api services
if(preg_match('/^\/p\//', $iiif_path)){
    require_once('iiif/presentation_manifest.php');
}

// looking for image api services
if(preg_match('/^\/i\//', $iiif_path)){

    if(preg_match('/info.json$/', $iiif_path)){
        require_once('iiif/image_info.php');
    }else{
        require_once('iiif/image_server.php');
    }

}

?>