<?php

require_once('config.php');
require_once('include/db_functions.php');
require_once('include/solr_functions.php');
require_once('include/curl_functions.php');

// will import/update specimens based on supplied cetaf_id

// ids to be ingested
$cetaf_ids = array();
$out = array();

// we can be run either from the commandline or called by the browser client
if(php_sapi_name() === 'cli'){

    $cli_mode = true;

    $ops = getopt('i:f:l:o:');

    // the i option is a single id to be ingested
    // the option can be repeated
    if(isset($ops['i'])){
        if(is_array($ops['i'])){
            $cetaf_ids= array_merge($ops['i'], $cetaf_ids);
        }else{
            $cetaf_ids[] = $ops['i'];
        }
    }

    // the f option is a file containing ids one per line
    if(isset($ops['f'])){
        $file_ids = file($ops['f']);

        // the l option sets a limit on the number pulled in from the file
        if(isset($ops['l'])){

            // we can offset as well
            if(isset($ops['o'])) $offset = $ops['o'];
            else $offset = 0;

            $file_ids = array_slice($file_ids, $offset, $ops['l']);
        }

        // the n option means we only ingest if they are new to us
        if(isset($ops['n'])) $new_only = true;
        else $new_only = false;

        // combine any in file with any on command line
        $cetaf_ids= array_merge($file_ids, $cetaf_ids);
    }

}else{

    $cli_mode = false;

    // get a single cetaf_id
    if(isset($_GET['cetaf_id'])){
        $cetaf_ids[] = $_GET['cetaf_id'];
    }

    // post a list of cetaf_ids one per line
    if(isset($_POST['cetaf_ids'])){
        $post_ids = explode("\n", $_POST['cetaf_ids']);
        $cetaf_ids= array_merge($post_ids, $cetaf_ids);
    }

}

// clean up the array of ids a bit
array_walk($cetaf_ids, function(&$value){ 
        $value = trim($value); 
    }
);


// work through the ids
foreach($cetaf_ids as $cetaf_id){

    // check it is a valid uri
    if(!filter_var($cetaf_id, FILTER_VALIDATE_URL) ){
        $out[$cetaf_id]['error'] = "Not a valid URL";
        continue;
    }

    // check if we already have it.
    if($new_only && db_specimen_exists($cetaf_id)){
        $out[$cetaf_id]['exists'] = "Specimen already in database so continuing to next";
        continue;
    }

    // call to get the data
    // get default curl handle
    $curl = get_curl_handle($cetaf_id);
    
    // set other things here
    curl_setopt($curl, CURLOPT_HTTPHEADER, array( "Accept: application/rdf+xml"));
    $response = run_curl_request($curl);

    // we may get a 302 if this is an http that has been moved to an https
    if($response->info['http_code'] == 302){

        $redirect = $response->info['redirect_url'];

        $out[$cetaf_id]['302_redirected_to'] = $redirect;

        $cetaf_id = $redirect; // we go forward with the new URI.

        // we call the new one again so we have the right response object
        $curl = get_curl_handle($cetaf_id);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array( "Accept: application/rdf+xml"));
        $response = run_curl_request($curl);
    }
    
    if($response->info['http_code'] != 303){
        $out[$cetaf_id]['error'] = "Unexpected response code: '". $response->info['http_code'] ."'. Expecting 303 or 302 Redirect to RDF.";
        continue;
    }

    $rdf_url = $response->info['redirect_url']; // I think this is always an absolute uri calculated by curl from the location header.
    $out[$cetaf_id]['rdf_uri'] = $rdf_url;

    // call for the RDF itself
    $rdf = curl_get_rdf_xml($rdf_url);

    libxml_use_internal_errors(true); // store up parse errors
    $xml=simplexml_load_string($rdf); // parse the xml
    if ($xml === false) {
        // we have errors report them and move on
        $out[$cetaf_id]['error'] = array();
        foreach(libxml_get_errors() as $error) {
            $out[$cetaf_id]['error'] = $error->message;
        }
        continue;
    }

    // xml is good so we can save it.
    // note we use all the versions of the id
    $row_id = db_set_data_for_specimen($cetaf_id, $xml->asXML(), "rdf+xml");
    if($row_id !== false){
        $out[$cetaf_id]['db_row_id'] = $row_id;
    }else{
        $out[$cetaf_id]['error'] = "Failed to save data to db";
        continue;
    }

    // now we go on and index the thing
    $out[$cetaf_id]['solr_indexing_response'] = solr_index_specimen_by_id($row_id);
    $out[$cetaf_id]['solr_commmit_response'] = json_decode( solr_commit() );

}

if($cli_mode){
    print_r($out);
}else{
    header('Content-Type: application/json');
    echo json_encode($out);
}

?>