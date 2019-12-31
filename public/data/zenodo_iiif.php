<?php

    require_once('config.php');
    require_once('iiif/functions.php');

    // generates IIIF Cache for Zenodo specimens.

    // we use this to create tile pyramids
    $factory = new \DanielKm\Zoomify\ZoomifyFactory;
    $zoomify = $factory();

    $response = $mysqli->query("SELECT * FROM cetaf_id as c 
    join specimen as s on c.specimen_id = s.id
    where c.cetaf_id like 'https://herbariamundi.org/%'
    and iiif_manifest_uri is null");

    while($row = $response->fetch_assoc()){
        process_specimen($row, $zoomify);
    }

    // Process a source file and save tiles in a destination folder.
//    $result = $zoomify->process($source, $destination);

function process_specimen($row, $zoomify){

    global $mysqli;

    $zenodo = json_decode($row['raw']);

    // work out a path to keep this stuff in
    $zenodo_id = $zenodo->conceptrecid;
    $cache_path = '../' . ZENODO_SPECIMEN_CACHE . $zenodo_id . '/';
    if(!file_exists($cache_path)) mkdir($cache_path, 0777, true);

    $file_for_thumbnail = null;
    foreach($zenodo->files as $file){

        // we are only interested in jpg files
        if($file->type != 'jpg') continue;

        if($file_for_thumbnail == null) $file_for_thumbnail = $file;

        $img_local_path =  $cache_path . $file->key;
        $tiles_local_path = $cache_path . pathinfo($file->key, PATHINFO_FILENAME);

        file_put_contents($img_local_path, fopen($file->links->self, 'r'));

        $result = $zoomify->process($img_local_path, $tiles_local_path);

        // print_r($result);

    }
    
    // also add the complete zenodo record. 
    // we will pull data out of it live to generate the manifest.
    file_put_contents($cache_path . 'zenodo_record.json', $row['raw'] );

    // we are done so update the row to add in the manifest and thumbnail URIs
    $manifest_uri = PROTOCOL_HOST_PORT . '/iiif/p/' . $zenodo_id . '/manifest';
    $image_base_uri = get_image_uri($zenodo_id, $file_for_thumbnail);
    $thumbnail_uri = $image_base_uri . '/full/150,/0/default.jpg';

    $stmt = $mysqli->prepare("UPDATE specimen SET `thumbnail_path` = ?, `iiif_manifest_uri` = ? WHERE id = ?");
    if ( false===$stmt ) {
        echo $mysqli->error;
    }
    $stmt->bind_param(
        'ssi',
        $thumbnail_uri,
        $manifest_uri,
        $row['id']
    );
    echo $mysqli->error;
    $stmt->execute();
    
}

?>