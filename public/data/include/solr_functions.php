<?php

require_once('include/curl_functions.php');
require_once('include/db_functions.php');

/*

- delete it all!

curl -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/mundi1/update' --data-binary '{"delete":{"query":"*:*"} }'
curl -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/mundi1/update' --data-binary '{"commit":{} }'

*/

/**
 * 
 * Pass it an array of objects that are the docs
 * Will add them and commmit in specified seconds
 * 
 */
function solr_add_docs($docs){
    $solr_update_uri = SOLR_QUERY_URI . '/update';
    $response = curl_post_json($solr_update_uri, json_encode($docs));
    return $response->body;
}

function solr_run_search($query){
    $solr_query_uri = SOLR_QUERY_URI . '/query';
    $response = curl_post_json($solr_query_uri, json_encode($query));
    return $response->body;
}

function solr_get_doc_by_id($id){
    // this uses the RealTime Get feature
    $solr_query_uri = SOLR_QUERY_URI . '/get?id=' . $id;
    $ch = get_curl_handle($solr_query_uri);
    $response = run_curl_request($ch);
    if(isset($response->body)){
        $body = json_decode($response->body);
        if(isset($body->doc)){
            return $body->doc;
        }
    }
    return null;
}

function solr_commit($in = 0){
    $solr_update_uri = SOLR_QUERY_URI . '/update';
    $command = new stdClass();
    $command->commit = new stdClass();
    $response = curl_post_json($solr_update_uri, json_encode($command));
    return $response->body;
}

function solr_index_specimen_by_id($row_id){

    global $mysqli;
    global $herbaria_mundi_providers; // we only want to load this once.

    $out = array();

    $specimen_data = db_get_specimen_data_by_row_id($row_id);



    $solr_doc = parse_rdf_xml($specimen_data['raw'], $specimen_data['cetaf_id_normative']);

    $solr_doc->db_id_i = $row_id; // just incase we need it
    $solr_doc->cetaf_id_preferred_s = $specimen_data['cetaf_id_preferred']; // the one we use for links


    // we get the provider information by mapping the cetaf uri to a row in the db
    // as we can't be 100% sure of getting it from the RDF or Zenodo or wherever and it is important.
    if(!$herbaria_mundi_providers){
        $result = $mysqli->query("SELECT * FROM provider");
        $herbaria_mundi_providers = $result->fetch_all(MYSQLI_ASSOC);
        $result -> free_result();
    }

    foreach ($herbaria_mundi_providers as $provider) {
        $regex = '/' . $provider['uri_pattern'] . '/';
        //echo $regex . " " . $solr_doc->id . "\n";
        if(preg_match($regex, $solr_doc->id)){
            $solr_doc->provider_name_s = $provider['name'];
            $solr_doc->provider_logo_path_s = $provider['logo_path'];
            $solr_doc->provider_homepage_uri_s = $provider['home_uri'];
            break;
        }
    }
    // Check for cached thumbnail here and add it to the doc.
    // we need a predictable thumbnail cache because it could get big and we want to partition it predictably
    // so we base it on the row number and imagine 100 million sprecimens
    // zero pad the row number to 9 long 
    $path = preg_replace('/^([0-9]{3})([0-9]{3})([0-9]{3})/', '$1/$2/', str_pad($row_id, 9, '0', STR_PAD_LEFT));
    
    $thumb_file_path = $path . $row_id . '.jpg';
    $thumb_file_local_path = THUMBNAIL_CACHE . $thumb_file_path;
    $thumb_dir_local_path = THUMBNAIL_CACHE . $path;

    $solr_doc->thumbnail_path_s = $thumb_file_path;

    // nothing should be in the index unless it has a thumbnail so even if this 
    // is slow it is necessary and counts as part of indexing process!
    $thumbnail_remote_uri = get_thumbnail_uri_from_manifest($solr_doc->iiif_manifest_uri_ss[0], 400);
    $solr_doc->thumbnail_remote_uri_s = $thumbnail_remote_uri;

    // does the thumbnail alread exist?
    if(!file_exists($thumb_file_local_path)){

        // create the dir if needed
        @mkdir($thumb_dir_local_path, 0777, true);

        // if we are in dev then the remote URI might be local
        if(getenv('HERBARIA_MUNDI_DEV')){
            $thumbnail_remote_uri = str_replace(
                'https://www.herbariamundi.org',
                'http://localhost:3100/data',
                $thumbnail_remote_uri
            );
        }

        file_put_contents($thumb_file_local_path, fopen($thumbnail_remote_uri, 'r'));
    }

    // finally timestamp it 
    $solr_doc->last_indexed_dt = 'NOW';

    $out['solr_doc'] = $solr_doc;
    $out['solr_add_response'] = solr_add_docs(array($solr_doc));
    
    return $out;


}

function parse_rdf_xml($xml, $cetaf_id_normative){

    // this is slow!

    // convert the RDF into name/value pairs in JSON for building the SOLR document.
    if(getenv('HERBARIA_MUNDI_DEV')){
        $rdf2json_api_uri = "http://127.0.0.1:3100/data/rdf2json.php";
    }else{
        $rdf2json_api_uri = "https://www.herbariamundi.org/rdf2json.php";
    }

    $post_params=[
        'rdf_xml'=>$xml,
        'cetaf_id_normative'=> $cetaf_id_normative
    ];

    $ch = get_curl_handle($rdf2json_api_uri);
    curl_setopt($ch, CURLOPT_POST, 1);
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_params);
    $response = run_curl_request($ch);

    $parsed_rdf = json_decode($response->body);

    // we have the fields to add a solr document now. Let's do it!
    $solr_doc = $parsed_rdf->solr_fields;

    print_r($parsed_rdf);
    exit;

    return $solr_doc;
}

function get_thumbnail_uri_from_manifest($manifest_uri, $size){
    
    // if we are in dev we use a different URI for the manifest
    if(getenv('HERBARIA_MUNDI_DEV')){
        $manifest_uri = str_replace('https://data.herbariamundi.org','http://localhost:3100/data', $manifest_uri);
    }

    $json = file_get_contents($manifest_uri);
    $manifest = json_decode($json);
    
    // is it version 1 or 2?
    $version = false;
    foreach($manifest->{'@context'} as $context){
        if($context == 'http://iiif.io/api/presentation/2/context.json') $version = 2;
        if($context == 'http://iiif.io/api/presentation/3/context.json') $version = 3;
    }
    
    switch ($version) {
        
        case 2:
            $image_uri = extract_image_uri_from_v2_manifest($manifest);
        break;
        
        case 3:
            $image_uri = extract_image_uri_from_v3_manifest($manifest);
        break;

        default:
            return null;
    }

    return $image_uri . '/full/,' .  $size . '/0/default.jpg';

}


function extract_image_uri_from_v2_manifest($manifest){

    foreach($manifest->sequences as $sequence){
        foreach($sequence->canvases as $canvas){
            foreach($canvas->images as $image){
                if(isset($image->resource->service) && $image->resource->{'@type'} == 'dctypes:Image'){
                    return $image->resource->service->{'@id'};
                }
            }
        }
    }
    return null;
    
}

function extract_image_uri_from_v3_manifest($manifest){

    // get the first canvas item
    foreach($manifest->items as $item){
        if($item->type != 'Canvas') continue;
        else $canvas = $item;
    }

    // it has an AnnotationPage in its items
    foreach($canvas->items as $item){
        if($item->type != 'AnnotationPage') continue;
        else $annotation_page = $item;
    }

    // it has annotations with painting intent
    foreach($annotation_page->items as $item){
        if($item->type != 'Annotation') continue;
        if(strcasecmp($item->motivation, 'painting') !== 0) continue; // painting may not be in right case
        else $annotation = $item;
    }

    foreach($annotation->body->service as $service){
        if($service->type == 'ImageService3'){
            return $service->id;
        }
    }

    // got to here so something went wrong
    return null;

}

?>