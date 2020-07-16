<?php

$authentication_override = true;
require_once('config.php');
session_unset();

header('Content-Type: application/json');
echo JSON_encode(array('logged_out' => true));

?>