<?php
require_once('config.php');

$payload = file_get_contents("php://input");
$payload = JSON_decode($payload);
$search_text = $payload->searchText;

if(isset($payload->limit)){
    $limit = $payload->limit;
}else{
    $limit = 20;
    $payload->limit =$limit;
}

if(isset($payload->offset)){
    $offset = $payload->offset;
}else{
    $offset = 0;
    $payload->offset =$offset;
}

$sql = "SELECT * from specimen as s join cetaf_id as c on s.id = c.specimen_id WHERE MATCH(s.index_string) AGAINST('$search_text')limit $limit";

$result = $mysqli->query($sql);

$out = array();
while ($row = $result->fetch_assoc()) {

    $specimen = new stdClass();
    $specimen->id = $row['id'];
    $specimen->cetaf_id = $row['cetaf_id'];
    $specimen->title =  $row['title'];
    $specimen->iiif_manifest_uri = $row['iiif_manifest_uri'];
    $specimen->thumbnail_uri = $row['thumbnail_path'];
    $specimen->iiif_loaded = true;

    // we need to work out the source of the specimen
    // in herbariamundi this will be done at index time but here 
    // we need to clunge it
    if(strpos($specimen->iiif_manifest_uri, "https://iiif.rbge.org.uk") === 0){
        $specimen->provider_logo_uri = 'https://iiif.rbge.org.uk/herb/rbge_logo.png';
        $specimen->provider_homepage_uri = "http://www.rbge.org.uk";
    }else{
        $specimen->provider_logo_uri = 'https://about.zenodo.org/static/img/logos/zenodo-black-border.svg';
        $specimen->provider_homepage_uri = "https://zenodo.org/communities/herbariamundi";

        // we also fix the thumbnail if it doesn't have on created yet
        if(!$specimen->thumbnail_uri){
            $z = json_decode($row['raw']);
            $specimen->thumbnail_uri = $z->links->thumbs->{'250'};
            $specimen->iiif_loaded = false;
        }

    }



    $out[$row['id']] = $specimen;

}

header('Content-Type: application/json');
$out = array("specimens" => $out, "searchParams" => $payload);
echo JSON_encode($out);

?>