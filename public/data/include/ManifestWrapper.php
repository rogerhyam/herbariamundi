<?php

// a wrapper class to 
class ManifestWrapper{

    protected $manifest;

    function __construct($man) {
        $this->manifest = $man;
    }

    /**
     * Factory method that returns right subclass
     * to handle the version of manifest loaded.
     */
    public static function getWrapper($manifestUri){

        // load the manifest from the URL
        //  e.g. https://iiif.rbge.org.uk/herb/iiif/E00001237/manifest

        // FIXME we could do some caching here.
        $man =  json_decode(file_get_contents($manifestUri));

        // if the json is corrupt or not reachable we give up
        if(!$man){
            error_log("Can't fetch or parse manifest: $manifestUri");
            return null;
        } 
        
        $version = null;

        // $man->{"@context"} may be an array or a single value.
        if(is_array($man->{"@context"})){
           
            $versions = preg_grep( '/http:\/\/iiif.io\/api\/presentation\/.+\/context.json/',$man->{"@context"});
            $versions = array_values($versions); // not interested in keys

            if(count($versions) == 1){
                $version = $versions[0];
            }

        }else{
            $version = $man->{"@context"};
        }

        
        if($version == 'http://iiif.io/api/presentation/2/context.json'){
            return new ManifestWrapperV2($man);
        }
        if($version == 'http://iiif.io/api/presentation/3/context.json'){
            return new ManifestWrapperV3($man);
        }

        http://iiif.io/api/image/3/context.json

        echo "Can't work out manifest version for $manifestUri\n";
        print_r($man->{"@context"});
        return null;

    }

    function getSimpleManifest(){
        $out = array();
        //var_dump($this->manifest);
        $out['id'] = $this->getId();
        $out['label'] = $this->getLabel();
        $out['summary'] = $this->getSummary();
        $out['metadata'] = $this->getMetadata();
        $out['canvases'] = $this->getCanvases();
        return $out;
    }

    function getId(){
        return $this->manifest->id;
    }
    function getLabel(){
        if(!isset($this->manifest->label)) return "";
        return $this->manifest->label;
    }
    function getSummary(){
        if(!isset($this->manifest->summary)) return "";
        return $this->manifest->summary;
    }

    function getMetadata(){
        if(!isset($this->manifest->metadata)) return array();
        else return $this->manifest->metadata;
        // overridend in version 2
    }

    function getCanvases(){
        return array();
    }

    function getThumbnailUri($size){
        $canvases = $this->getCanvases();
        return $canvases[0]['image_base_uri'] . '/full/,' .  $size . '/0/default.jpg';
    }

}

class ManifestWrapperV2 extends ManifestWrapper {
    function __construct($man) {
        parent::__construct($man);
    }

    function getId(){
        return $this->manifest->{'@id'};
    }

    function getSummary(){
        return $this->manifest->description;
    }

    function getCanvases(){
        $out = array();

        foreach ($this->manifest->sequences as $sequence) {
            if(isset($sequence->canvases)){
                foreach ($sequence->canvases as $item) {
                    $canvas = array();
                    $canvas['id'] = $item->{'@id'};
                    $canvas['label'] = $item->label;
                    $canvas['height'] = $item->height;
                    $canvas['width'] = $item->width;
                    foreach($item->images as $image){
                        $canvas['image_height'] = $image->resource->height;
                        $canvas['image_width'] = $image->resource->width;
                        $canvas['image_format'] = $image->resource->format;
                        $canvas['image_base_uri'] = $image->resource->service->{'@id'};
                        $canvas['image_info_uri'] = $canvas['image_base_uri'] . '/info.json';
                        $out[] = $canvas;
                        break 3;
                    }
                }

            }
        }

        return $out;

    }

    function getMetadata(){
        $out = array();

        // do nothing if we have nothing
        if(!isset($this->manifest->metadata)) return $out;

        foreach ($this->manifest->metadata as $item) {
            $out[] = array(
                'label' => array(
                    'en' => array($item->label)
                ),
                'value' => array(
                    'en' => array($item->value) 
                )
            );
        }
        return $out;
    }

}

class ManifestWrapperV3 extends ManifestWrapper {
    function __construct($man) {
        parent::__construct($man);
    }

    function getCanvases(){

        $out = array();

        // run through the top level items and find all the ones 
        // that are canvases
        foreach ($this->manifest->items as $item) {
            if($item->type == 'Canvas'){

                $canvas = array();
                
                $canvas['id'] = $item->id;
                $canvas['label'] = $item->label;
                $canvas['height'] = $item->height;
                $canvas['width'] = $item->width;

                // there will be an annotation page
                // with an annotation that has motivation Painting
                // we take the first one on the first page.
                // there should probably only be one
                foreach ($item->items as $anno_page) {
                    foreach ($anno_page->items as $anno) {
                        if($anno->motivation == 'Painting'){
                            $canvas['image_id'] = $anno->body->id;
                            $canvas['image_base_uri'] = $anno->body->service[0]->id;
                            $canvas['image_info_uri'] = $canvas['image_base_uri'] . '/info.json';
                            $canvas['image_format'] = $anno->body->format;
                            //$canvas['image_service'] = $anno->body->service;
                            $canvas['image_height'] = $anno->body->height;
                            $canvas['image_width'] = $anno->body->width;
                            break 2;
                        }
                    }
                }

                $out[] = $canvas;
            }
        }
        return $out;
    }

}

?>