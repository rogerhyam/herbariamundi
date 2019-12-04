<?php
require_once('config.php');
$result = $mysqli->query("SELECT barcode 
FROM image_archive.derived_images 
where image_type = 'JPG'
limit 10
offset " . rand(0,100000));

$rows = $result->fetch_all(MYSQLI_ASSOC);
$barcodes = array();
foreach ($rows as $row) {
    $barcodes[] = $row['barcode'];
}
$barcodes = '("' . implode('","', $barcodes) .'")';

$sql = "SELECT * FROM bgbase_dump.darwin_core where catalognumber in $barcodes";

$result = $mysqli->query($sql);

$out = array();
while ($row = $result->fetch_assoc()) {

    $specimen = new stdClass();
    $specimen->cetaf_id = $row['GloballyUniqueIdentifier'];
    $specimen->title = $row['ScientificName'] . ' specimen ' . $row['CatalogNumber'];
    $specimen->iiif_manifest_uri = 'https://iiif.rbge.org.uk/herb/iiif/'.  $row['CatalogNumber'] .'/manifest';
    $specimen->thumbnail_uri = 'https://iiif.rbge.org.uk/herb/iiif/'. $row['CatalogNumber'] .'/full/150,/0/default.jpg';
    $out[] = $specimen;

}
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo JSON_encode($out);

?>