<?php
  
    require_once('config.php');

    $out = new stdClass();
    $out->banana = 'cake';
    $out->veg = 'curry';

    echo JSON_encode($out);

?>