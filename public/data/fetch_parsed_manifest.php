<?php
$authentication_override = true;
require_once('config.php');
require_once('include/ManifestWrapper.php');

// returns a parsed, possibly decorated, version of the manifest
// e.g.
// https://iiif.rbge.org.uk/herb/iiif/E00001237/manifest
// aHR0cHM6Ly9paWlmLnJiZ2Uub3JnLnVrL2hlcmIvaWlpZi9FMDAwMDEyMzcvbWFuaWZlc3Q=

// https://herbarium.bgbm.org/data/iiif/B200012401/manifest.json
// aHR0cHM6Ly9oZXJiYXJpdW0uYmdibS5vcmcvZGF0YS9paWlmL0IyMDAwMTI0MDEvbWFuaWZlc3QuanNvbg==

if(isset($_GET['manifest_uri'])){
    // mainly for debug we can be parsed the uri in the query string
    $manifest_uri = base64_decode($_GET['manifest_uri']);
}else{
    // from the app itself
    $payload = file_get_contents("php://input");
    $payload = JSON_decode($payload);
    $manifest_uri = $payload->manifest_uri;
}

$wrapper = ManifestWrapper::getWrapper($manifest_uri);

header('Content-Type: application/json');
echo json_encode($wrapper->getSimpleManifest());

?>