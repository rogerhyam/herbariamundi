<?php

require_once('functions.php');

$base_uri = get_base_uri();
$specimen_id = get_specimen_id();
$metadata = get_specimen_metadata();

echo "<p>presetation   MANIFEST</p>";

$out = new stdClass();
$out->context = array("http://www.w3.org/ns/anno.jsonld","http://iiif.io/api/presentation/3/context.json");
$out->id = "$base_uri/manifest";
$out->type = "Manifest";
$out->label = create_label("Default Manifest for $specimen_id" );

//

$out->meta = $metadata;


print_r($out);
exit;

//print_r($out);
$json = json_encode( $out, JSON_PRETTY_PRINT + JSON_UNESCAPED_SLASHES );
// total hack to add the @ to the context attribute (not acceptable in php)
$json = str_replace('"context":','"@context":', $json);
//header('Content-Type: application/json');
echo $json;

?>