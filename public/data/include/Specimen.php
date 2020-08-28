<?php

class Specimen{

    protected  $db_id;
    protected  $cetaf_id_normative;
    protected  $cetaf_id_preferred;
    protected  $raw;

    function __construct($db_id, $cetaf_id_normative, $cetaf_id_preferred, $raw ) {
        $this->db_id = $db_id;
        $this->cetaf_id_normative = $cetaf_id_normative;
        $this->cetaf_id_preferred = $cetaf_id_preferred;
        $this->raw = $raw;
    }

    public static function createSpecimenFromDbId($db_id){

        $specimen_data = db_get_specimen_data_by_row_id($db_id);

        if(!$specimen_data){
            error_log("Not a valid database id: $db_id");
            return null;
        }

        extract($specimen_data); // first use of extract
        return new Specimen($id, $cetaf_id_normative, $cetaf_id_preferred, $raw);
    
    }

    public static function createSpecimenFromUri($cetaf_id){

        // check it is a valid uri
        if(!filter_var($cetaf_id, FILTER_VALIDATE_URL) ){
            error_log("Not a valid URI: $cetaf_id");
            return null;
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
            error_log("302 redirect to: $redirect" );
            $cetaf_id = $redirect; // we go forward with the new URI.

            // we call the new one again so we have the right response object
            $curl = get_curl_handle($cetaf_id);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array( "Accept: application/rdf+xml"));
            $response = run_curl_request($curl);
        }
    
        if($response->info['http_code'] != 303){
            error_log("Unexpected response code: '" . $response->info['http_code'] . "'. Expecting 303 or 302 Redirect to RDF.");
            return null;
        }

        $rdf_url = $response->info['redirect_url']; // I think this is always an absolute uri calculated by curl from the location header.
        error_log("rdf_uri: $rdf_url");

        // call for the RDF itself
        $rdf = curl_get_rdf_xml($rdf_url);

        libxml_use_internal_errors(true); // store up parse errors
        $xml=simplexml_load_string($rdf); // parse the xml
        if ($xml === false) {
            foreach(libxml_get_errors() as $error) {
                error_log($error->message);
            }
            return null;
        }

        // xml is good so we can create a specimen
        $db_id = null;
        $cetaf_id_preferred = $cetaf_id;
        $cetaf_id_normative = preg_replace('/^http:|^https:/i', '', $cetaf_id);
        $raw = $xml->asXML();

        return new Specimen($db_id, $cetaf_id_normative, $cetaf_id_preferred, $raw );

    }

    public function saveToDb(){

        if(!$this->raw || !$this->cetaf_id_preferred){
            error_log("Trying to save non-initialised specimen");
            return false;
        }

        $this->db_id = db_set_data_for_specimen($this->cetaf_id_preferred, $this->raw);

        if(!$this->db_id){
            error_log("Failed to save to db: " . $this->cetaf_id_preferred);
        }

        return $this->db_id;

    }

    public function saveToSolr(){

        if(!$this->db_id){
            error_log("Trying to index non-saved specimen: " . $this->cetaf_id_preferred);
            return false;
        }

        $response = solr_index_specimen_by_id($this->db_id);
        if($response) solr_commit();
        return $response;
    
    }




}