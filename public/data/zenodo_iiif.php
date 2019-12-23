<?php

    require_once('config.php');

    // generates IIIF Cache for Zenodo specimens.

    // we user this to create tile pyramids
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
    $cache_path = ZENODO_SPECIMEN_CACHE . $zenodo_id . '/';
    if(!file_exists($cache_path)) mkdir($cache_path, 0777, true);

    foreach($zenodo->files as $file){

        // we are only interested in jpg files
        if($file->type != 'jpg') continue;

        $img_local_path =  $cache_path . $file->key;
        $tiles_local_path = $cache_path . pathinfo($file->key, PATHINFO_FILENAME);

        file_put_contents($img_local_path, fopen($file->links->self, 'r'));

        $result = $zoomify->process($img_local_path, $tiles_local_path);

        // also add the complete zenodo record. 
        // we will pull data out of it live to generate the manifest.
        file_put_contents($cache_path . 'zenodo_record.json', $row['raw'] );

        print_r($result);


    }
    




    // get the location of the file.


}

?>