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

    $out = array();

    $specimen_data = db_get_specimen_data_by_row_id($row_id);

    switch ($specimen_data['raw_format']) {
        case 'rdf+xml':
            $solr_doc = parse_rdf_xml($specimen_data['raw'], $specimen_data['cetaf_id_normative']);
            /*
            FIXME - where do we get these for CETAF IDs as the RDF may not contain them.
            $solr_doc['provider_code_s'] = ??;
            $solr_doc['provider_name_s'] = ??;
            $solr_doc['provider_logo_uri_s'] = ??;
            $solr_doc['provider_homepage_uri_s'] = ??; // is there a dwc link?
            */
            break;
        case 'zenodo+json':
            $solr_doc = parse_zenodo_json($specimen_data['raw'], $specimen_data['cetaf_id_normative']);
            break;
    }

    $solr_doc->db_id_i = $row_id; // just incase we need it
    $solr_doc->cetaf_id_preferred_s = $specimen_data['cetaf_id_preferred'];

    // Check for cached thumbnail here and add it to the doc.
    // we need a predictable thumbnail cache because it could get big and we want to partition it predictably
    // so we base it on the row number and imagine 100 million sprecimens
    // zero pad the row number to 9 long 
    $path = preg_replace('/^([0-9]{3})([0-9]{3})([0-9]{3})/', '$1/$2/', str_pad($row_id, 9, '0', STR_PAD_LEFT));
    $path .= $row_id . '.jpg';
    $solr_doc->thumbnail_path_s = $path;

    // nothing should be in the index unless it has a thumbnail so even if this 
    // is slow it is necessary and counts as part of indexing process!
    $thumbnail_remote_uri = get_thumbnail_uri_from_manifest($solr_doc->iiif_manifest_uri_ss[0], 400);
    $solr_doc->thumbnail_remote_uri_s = $thumbnail_remote_uri;

    $thumb_local_path = THUMBNAIL_CACHE . $path;
    // does the thumbnail alread exist?
    if(!file_exists($thumb_local_path)){
        // create the dir if needed
        @mkdir(substr($thumb_local_path,0, -6), 0777, true);
        file_put_contents($thumb_local_path, fopen($thumbnail_remote_uri, 'r'));
    }

    $out['solr_doc'] = $solr_doc;
    $out['solr_add_response'] = solr_add_docs(array($solr_doc));
    
    return $out;


}

function parse_zenodo_json($json, $cetaf_id_normative){

    $solr_doc = array();
    $zenodo_doc = json_decode($json);

    // the id of the document is the cetaf_id with associated fields.
    $solr_doc['id'] = $cetaf_id_normative;

    // Only ever have https for hm cetaf_ids
    $solr_doc['cetaf_id_ss'] = array('https:' . $cetaf_id_normative);

    // we build a string of all text to check for taxon names

    // a title
    $title = $zenodo_doc->metadata->title;
    $solr_doc['title_s'] = $title;

    // do the big text areas first.
    $description = strip_tags($zenodo_doc->metadata->description);
    $solr_doc['description_s'] = $description;

    // raw txt
    $solr_doc['raw_txt'][] = preg_replace('/\s+/', ' ', $title . ' ' . $description);

    // FIXME: add key words in here
    
    // Family
    $solr_doc['family_ss'][] = get_families($title . ' ' . $description);

    // genus
    $solr_doc['genus_ss'][] = db_get_genera($title);


    // we use the subject mapping table to add values to the index
    foreach($zenodo_doc->metadata->subjects as $subject){

        // fix issue that the wikidata url is often used instead of the concept uri
        // https://www.wikidata.org/wiki/Q739
        // https://www.wikidata.org/entity/Q739
        $uri = preg_replace('/^http[s]{0,1}:\/\/www.wikidata.org\/wiki\/(Q[0-9]+)$/', 'https://www.wikidata.org/entity/$1', $subject->identifier);

        // add it as a subject anyhow
        $solr_doc['zenodo_subject_ss'][] = $uri;
        
        // each mention in the table
        $mappings = db_get_zenodo_mappings($uri);
        foreach($mappings as $map){
            $solr_doc[$map->field][] = $map->value;
        }

    }

    foreach($zenodo_doc->metadata->creators as $creator){
        $solr_doc['collector_ss'][] = $creator->name;
    }

    // pull the year out of the date string
    $matches = array();
    if(preg_match('/([0-9]{4})/', $zenodo_doc->metadata->publication_date, $matches)){
        $solr_doc['collection_year_i'][] = $matches[1];
    }

    // most importantly the manifest
    // IIIF Manifest URI 
    // https://data.herbariamundi.org/iiif/p/3588258/manifest
    $solr_doc['iiif_manifest_uri_ss'][] = 'https://data.herbariamundi.org/iiif/p/' . $zenodo_doc->conceptrecid . '/manifest';

    // lat/lon - extract or use
    /*
        Also use regex to find lat/lon
        ^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$
        groups 1 and 4 contain latitude and longitude respectively
    */


    // institution code
    $solr_doc['provider_code_s'] = 'Zenodo';
    $solr_doc['provider_name_s'] = 'Zenodo';
    $solr_doc['provider_logo_uri_s'] = 'https://about.zenodo.org/static/img/logos/zenodo-black-border.svg';
    $solr_doc['provider_homepage_uri_s'] = "https://zenodo.org/communities/herbariamundi";

    return (object)$solr_doc;
}


function get_families($text){

    $families = array();
    $words = str_word_count($text, 1);
    
    foreach($words as $word){

        if(preg_match('/^[A-Z][a-z]+aceae$/', $word)){
            $families[] = $word;
            continue;
        }

        // 8 families seen as exceptions
        switch ($word) {
            case 'Umbelliferae': 
                $families[] = 'Apiaceae';
                break;
            case 'Palmae':
                $families[] = 'Arecaceae';
                break;
            case 'Compositae':
                $families[] = 'Asteraceae';
                break;
            case 'Cruciferae':
                $families[] = 'Brassicaceae';
                break;
            case 'Guttiferae':
                $families[] = 'Clusiaceae';
                break;
            case 'Leguminosae':
                $families[] = 'Fabaceae';
                break;
            case 'Labiatae':
                $families[] = 'Lamiaceae';
                break;
            case 'Gramineae':
                $families[] = 'Poaceae';
                break;
        }
 

    }

    return array_unique($families);

}

function parse_rdf_xml($xml, $cetaf_id_normative){

    // convert the RDF into name/value pairs in JSON for building the SOLR document.
    // FIXME: hard coded in dev. I need to work out how to switch this between dev and live
    $rdf2json_api_uri = "http://127.0.0.1:3100/data/rdf2json.php";

    $post_params=[
        'rdf_xml'=>$xml,
        'cetaf_id_normative'=> $cetaf_id_normative
    ];

    $ch = get_curl_handle($rdf2json_api_uri);
    curl_setopt($ch, CURLOPT_POST, 1);
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_params);
    $response = run_curl_request($ch);

    print_r($response);

    $parsed_rdf = json_decode($response->body);

    // we have the fields to add a solr document now. Let's do it!
    $solr_doc = $parsed_rdf->solr_fields;

    return $solr_doc;
}

function get_thumbnail_uri_from_manifest($manifest_uri, $size){

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