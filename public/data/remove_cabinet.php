<?php

require_once('config.php');
require_once('remove_common.php');

$cabinet_id = $_GET['cabinet_id'];

$out = array();
$out['id'] = $cabinet_id; // we pass back what we delete 

remove_cabinet($cabinet_id);

// send back the thing we deleted so it can be pulled from the interface.
header('Content-Type: application/json');
echo JSON_encode($out);

?>