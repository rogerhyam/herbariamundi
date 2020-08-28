<?php
$authentication_override = true;
require_once('config.php');

$out = array();

$stmt = $mysqli->prepare("SELECT `name` FROM `provider` ORDER BY `name`");
$stmt->execute();
$stmt->bind_result($name);
while($stmt->fetch()){
    $out[] = $name;
}
$stmt->close();

header('Content-Type: application/json');
echo json_encode($out);
