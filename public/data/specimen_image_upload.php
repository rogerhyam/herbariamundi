<?php

// just saves an image in a folder for the specimen.
require_once('config.php');


$out = array();

$out['specimenId'] = $_POST['specimen_id'];
$out['name'] = $_FILES['specimen_image']['name'];

$target_dir = USER_DATA_DIR_ROOT_DIR . $user_id . '/' . $_POST['specimen_id'] . '/';
if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);

$target_file = $target_dir . basename($_FILES["specimen_image"]["name"]);

if (move_uploaded_file($_FILES["specimen_image"]["tmp_name"], $target_file)) {
    $out['success'] = true;

    $new_height = 150;
    list($old_width, $old_height) = getimagesize($target_file);
    $new_width = floor( $old_width * (150/$old_height) );
  
    $new_image = imagecreatetruecolor($new_width, $new_height);
    $old_image = imagecreatefromjpeg($target_file);
  
    imagecopyresampled($new_image, $old_image, 0, 0, 0, 0, $new_width, $new_height, $old_width, $old_height);

    ob_start (); 
    imagejpeg($new_image);
    $image_data = ob_get_contents(); 
    ob_end_clean(); 
    $image_data_base64 = base64_encode($image_data);

    imagedestroy($old_image);
    imagedestroy($new_image);
    
    $out['thumbnail_uri'] = 'data:image/jpeg;base64,' . $image_data_base64;

} else {
    $out['success'] = false;
    $out['thumbnail_uri'] = null;
}

// create a thumbnail


header('Content-Type: application/json');
echo JSON_encode($out);
?>