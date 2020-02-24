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
            break;
        case 'zenodo+json':
            $solr_doc = parse_zenodo_json($specimen_data['raw'], $specimen_data['cetaf_id_normative']);
            break;
    }

    $solr_doc->db_id_i = $row_id; // just incase we need it
    $solr_doc->cetaf_id_preferred_s = $specimen_data['cetaf_id_preferred'];
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


/*
    // Scientific Name -- can't do it without ids $solr_doc['scientific_name_ss'][] = ??
    // epithet $solr_doc['specific_epithet_ss'][]  -- can't do

   

    // collector
    $solr_doc['collector_ss'][] = $lit->getValue();
    
    // collector number
    $solr_doc['collector_number_ss'][] = $lit->getValue();

    // institution code
    $solr_doc['instituted_code_ss'][] = $lit->getValue();

foreach($resource->all('<http://rs.tdwg.org/dwc/terms/earliestDateCollected>', 'literal') as $lit){

    // pull the year out of the date string
    $matches = array();
    if(preg_match('/([0-9]{4})/', $lit->getValue(), $matches)){
        $solr_fields['collection_year_i'][] = $matches[1];
    }
    
}

// decimal lat lon - there should only be one pair but we do all combinations if there are more!
foreach($resource->all('<http://rs.tdwg.org/dwc/terms/decimalLatitude>', 'literal') as $lat_lit){
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/decimalLongitude>', 'literal') as $lon_lit){
        $solr_fields['collection_location_p'][] = $lat_lit->getValue() . ',' . $lon_lit->getValue();
    }
}

// raw text
$solr_fields['raw_txt'][] = preg_replace('/\s+/', ' ', strip_tags($xml_rdf_string));


// try to find a manifest of high res image - this may be institution specific.

// IIIF Manifest URI
foreach($resource->all('<http://purl.org/dc/terms/relation>', 'resource') as $res){

    // what dc:type is it?
    foreach($res->all('<http://purl.org/dc/terms/type>', 'resource') as $type){
        if($type->getUri() == 'http://purl.org/dc/dcmitype/Image'){
            $solr_fields['image_uri_ss'][] = $res->getUri();
        }
        if($type->getUri() == 'http://iiif.io/api/presentation/3#Manifest'){
            $solr_fields['iiif_manifest_uri_ss'][] = $res->getUri();
        }
    }

    
}
*/

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
    $parsed_rdf = json_decode($response->body);

    // we have the fields to add a solr document now. Let's do it!
    $solr_doc = $parsed_rdf->solr_fields;

    return $solr_doc;
}


?>