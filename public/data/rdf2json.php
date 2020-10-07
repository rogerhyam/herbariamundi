<?php
/*

    This is a total cheat / hack to get data out of RDF reliably.
    
    If we use the EasyRdf library to parse RDF repeatedly it leaks enough memory to crash after
    about 10,000 documents. It works great on single calls though - which is what it is designed to do.

    This script therefore acts as a webservice that we pass RDF to and it returns useful JSON data in a form that 
    can be slotted into a SOLR document for indexing.

    It is quite neat really as it means the indexer etc doesn't need to know anything about RDF which is
    probably good design really :)

    Cost is a local HTTP call for every document.
    
 */
require 'vendor/autoload.php';
error_reporting(E_ERROR | E_PARSE); // there are a bunch of deprecation warnings in EasyRdf

$out = array();

$xml_rdf_string = $_POST['rdf_xml'];
$cetaf_id_normative = $_POST['cetaf_id_normative'];

// we consider all possible forms of the id - could add protocols!
$cetaf_ids = array(
    'http:' . $cetaf_id_normative,
    'https:' . $cetaf_id_normative
);

$out['cetaf_ids'] = $cetaf_ids;

$rdf = new EasyRdf_Graph($cetaf_ids[0]);
$parser = new \EasyRdf_Parser_RdfXml();

try{
    $out['total_rdf_trips_parsed'] = $parser->parse($rdf, $xml_rdf_string, 'rdfxml', '');
}catch(Exception $e){
    $out['parse_exception'] = true;
    $out['parse_exception_message'] = $e->getMessage();
}


// OK - we have some RDF - let's extract some fields!!!

// which cetaf_id are the assertions about?
// get the cetaf_id that has the most properties 
// associated with it as being the one the graph is
// about.
$most_props = 0;
$cetaf_id = null;
$out['prop_count'] = array();
foreach($cetaf_ids as $id){
    $resource = $rdf->resource($id);
    $props = $resource->properties();
    $out['prop_count'][$id] = count($props);
    if(count($props) > $most_props){
        $cetaf_id = $id;
        $most_props = count($props);
    }
}

// $out['cetaf_id_used'] = $cetaf_id;
$solr_fields = array();

// the id of the document is the cetaf_id with most associated fields.
$solr_fields['id'] = $cetaf_id_normative;

// but we store all of them
$solr_fields['cetaf_id_ss'] = $cetaf_ids;

// we iterate over all the versions of the cetaf_id to extract 
// all properties associated with both http and https version 

foreach($cetaf_ids as $id){

    $resource = $rdf->resource($cetaf_id);
    $props = $resource->propertyUris();
    $out['all_properties'] = $props;
        
    // Scientific Name
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/scientificName>', 'literal') as $lit){
        $solr_fields['scientific_name_ss'][] = $lit->getValue();
    }

    // Family
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/family>', 'literal') as $lit){
        $solr_fields['family_ss'][] = $lit->getValue();
    }

    // Genus
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/genus>', 'literal') as $lit){
        $solr_fields['genus_ss'][] = $lit->getValue();
    }

    // epithet
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/specificEpithet>', 'literal') as $lit){
        $solr_fields['specific_epithet_ss'][] = $lit->getValue();
    }

    // countryCode
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/countryCode>', 'literal') as $lit){
        $solr_fields['country_code_ss'][] = $lit->getValue();
    }

    // recordedBy
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/recordedBy>', 'literal') as $lit){
        $solr_fields['collector_ss'][] = $lit->getValue();
    }

    // collector number
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/recordNumber>', 'literal') as $lit){
        $solr_fields['collector_number_ss'][] = $lit->getValue();
    }

    // institution code
    foreach($resource->all('<http://rs.tdwg.org/dwc/terms/institutionCode>', 'literal') as $lit){
        $solr_fields['instituted_code_ss'][] = $lit->getValue();
    }

    // year
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

}

// we may have created duplicate entries because of looking at all possible cetaf_ids
foreach($solr_fields as $field_name => $value) {
   if(is_array($value)){
        $solr_fields[$field_name] = array_unique($value);
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

$out['solr_fields'] = $solr_fields;

header('Content-Type: application/json');
echo json_encode($out);

?>