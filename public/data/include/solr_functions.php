<?php

require_once('include/curl_functions.php');
require_once('include/db_functions.php');
require_once('include/ManifestWrapper.php');

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

    $xml_string = $specimen_data['raw'];

    // clunge for BGBM as of July 2020 - can probably be removed if they fixed their typo
    $xml_string = str_replace("//herbarium.bgbm.org//B", '//herbarium.bgbm.org/object/B', $xml_string);

    $solr_doc = parse_rdf_xml($xml_string, $specimen_data['cetaf_id_normative']);

    $solr_doc->db_id_i = $row_id; // just incase we need it
    $solr_doc->cetaf_id_preferred_s = $specimen_data['cetaf_id_preferred']; // the one we use for links


    // we get the provider information by mapping the cetaf uri to a row in the db
    // as we can't be 100% sure of getting it from the RDF or Zenodo or wherever and it is important.
    if(!$herbaria_mundi_providers){
        $result = $mysqli->query("SELECT * FROM provider");
        $herbaria_mundi_providers = $result->fetch_all(MYSQLI_ASSOC);
        $result->free_result();
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

    if(!isset($solr_doc->iiif_manifest_uri_ss[0])){
        error_log("No manifest URI found in RDF so giving up on indexing $row_id" );
        //print_r($solr_doc);
        db_set_iiif_status($row_id, 'NOT_FOUND');
        return null;
    }

    $wrapper = ManifestWrapper::getWrapper($solr_doc->iiif_manifest_uri_ss[0]);

    // if the wrapper couldn't parse it will be null
    if(!$wrapper){
        error_log('Problems creating manifest wrapper for: ' . $solr_doc->iiif_manifest_uri_ss[0]);
        return null; // get out of here 
    } 

    $thumbnail_remote_uri = $wrapper->getThumbnailUri(400);
    
    if(!$thumbnail_remote_uri){
        error_log("Couldn't extract thumbnail uri from IIIF manifest ". $solr_doc->iiif_manifest_uri_ss[0]);
        return null; // get out of here 
    } 

    // flag the fact that we have a IIIF Manifest - because we got the uri out of it
    db_set_iiif_status($row_id, 'FOUND');

    $solr_doc->thumbnail_remote_uri_s = $thumbnail_remote_uri;

    // does the thumbnail alread exist?
    if(!file_exists($thumb_file_local_path)){

        // create the dir if needed
        set_error_handler(function($errno, $errstr, $errfile, $errline) { 
            //echo "\nProblem creating thumbnail";
            //echo "\n$thumb_file_local_path";
            // echo "\n$errstr\n$errfile line: $errline";
            //exit;
        });
        mkdir($thumb_dir_local_path, 0777, true);
        restore_error_handler();

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


    // tags in db for this specimen
    $solr_doc->tags_ss = array();
    $result = $mysqli->query("SELECT tag_text FROM tag_placement as tp join tag as t on t.id = tp.tag_id where tp.specimen_id = $row_id");
    if($result){
        while($row = $result->fetch_assoc()){
            $solr_doc->tags_ss[] = $row['tag_text'];
        }
    }else{
        error_log("Trouble getting tags for specimen $row_id");
        error_log($mysqli->error);
    }
    

    // Add any determinations
    $solr_doc->wfo_taxon_ss = array();
    $solr_doc->wfo_taxon_group_ss = array();
    $result = $mysqli->query("SELECT * FROM determination where specimen_id = $row_id");
    if($result){
        while($row = $result->fetch_assoc()){
            $wfo_item = json_decode($row['wfo_raw']);
            if(is_object($wfo_item)){
                $solr_doc->wfo_taxon_ss[] = $wfo_item->id;
                $solr_doc->wfo_taxon_group_ss[] = $wfo_item->taxonID_s;
                
                // family
                if(isset($wfo_item->family_s)){
                    $solr_doc->family_ss[] =  $wfo_item->family_s;
                    $solr_doc->family_ss = array_unique($solr_doc->family_ss);
                }

                // genus
                if(isset($wfo_item->genus_s)){
                    $solr_doc->genus_ss[] = $wfo_item->genus_s;
                    $solr_doc->genus_ss = array_unique($solr_doc->genus_ss);
                }

                // species
                if(isset($wfo_item->specificEpithet_s)){
                    $solr_doc->specific_epithet_ss[] = $wfo_item->specificEpithet_s;
                    $solr_doc->specific_epithet_ss = array_unique($solr_doc->specific_epithet_ss);
                } 
            }
        }
    }else{
        error_log("Trouble getting dets for specimen $row_id");
        error_log($mysqli->error);
    }

    // make sure the specimen isn't queued any more
    db_dequeue_specimen_for_indexing($row_id);

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

    // print_r($response);

    $parsed_rdf = json_decode($response->body);

    // we have the fields to add a solr document now. Let's do it!
    $solr_doc = $parsed_rdf->solr_fields;

    return $solr_doc;
}


?>