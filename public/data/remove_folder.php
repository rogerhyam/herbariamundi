<?php

require_once('config.php');
require_once('remove_common.php');

$folder_id = $_GET['folder_id'];

$out = array();
$out['id'] = $folder_id; // we pass back what we delete 

// we return the cabinet id so that it can be removed in the interface.
$stmt = $mysqli->prepare("SELECT cabinet_id FROM folder AS f JOIN folder_placement as p on f.id = p.folder_id where p.owner_id = ? and f.id = ?");
$stmt->bind_param("ii", $user_id, $folder_id);
$stmt->execute();
$stmt->bind_result($cabinet_id);
$stmt->fetch();
$out['cabinetId'] = $cabinet_id;
$stmt->close();

// actually do the deed
remove_folder($folder_id);

// send back the thing we deleted so it can be pulled from the interface.
header('Content-Type: application/json');
echo JSON_encode($out);

?>