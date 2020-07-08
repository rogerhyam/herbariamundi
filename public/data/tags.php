<?php
require_once('config.php');
require_once('include/solr_functions.php');

$payload = file_get_contents("php://input");
$payload = JSON_decode($payload);


$out = array();

switch ($_GET['verb']) {
    
    case 'save':
        $out['specimenId'] = $payload->specimenId;
        $out['specimenDbId'] = $payload->specimenDbId;
        $out['saved'] = save_tag($payload->tagText, $payload->specimenId, $payload->specimenDbId, $user_id);
        $out['tags'] = fetch_tags($payload->specimenId, $payload->specimenDbId, $user_id);
        update_solr($payload->specimenId, $payload->tagText, false);
        break;

    case 'delete':
        $out['specimenId'] = $payload->specimenId;
        $out['specimenDbId'] = $payload->specimenDbId;
        $out['deleted'] = delete_tag($payload->tagId, $payload->specimenId, $payload->specimenDbId, $user_id);
        $out['tags'] = fetch_tags($payload->specimenId, $payload->specimenDbId, $user_id);
        update_solr($payload->specimenId, $payload->tagText, true);
        break;
    
    case 'fetch':
        $out['specimenId'] = $payload->specimenId;
        $out['specimenDbId'] = $payload->specimenDbId;
        $out['fetched'] = $payload->specimenId;
        $out['tags'] = fetch_tags($payload->specimenId, $payload->specimenDbId, $user_id);
        break;
    
    case 'suggest':
        // this is not called through a react action but directly
        $out['prefix'] = $payload->prefix;
        $out['suggestions'] = suggestions($payload->prefix, $user_id);
        break;

    default:
        $out['error'] = 'Unrecognised verb: ' . $_GET['verb'];
        break;

}

function update_solr($specimen_id, $tag_text, $remove = false){

    $doc = array();
    $doc['id'] = $specimen_id;

    if(!$remove){
        $doc['tags_ss'] = array( "add" => array($tag_text));
    }else{
        $doc['tags_ss'] = array( "remove" => array($tag_text));
    }
    
    solr_add_docs(array($doc));
    solr_commit();

    
        /*
    
        {"id":"mydoc",
     "price":{"set":99},
     "popularity":{"inc":20},
     "categories":{"add":["toys","games"]},
     "promo_ids":{"remove":"a123x"},
     "tags":{"remove":["free_to_try","on_sale"]}
    }
    
    */
    

}

function suggestions($prefix, $user_id){
   
    global $mysqli;
    
    $stmt = $mysqli->prepare(
        "SELECT t.`id`, t.`tag_text`
        FROM `tag` as t
        LEFT JOIN (SELECT distinct(tp.`tag_id`) as tid FROM `tag_placement` as tp WHERE tp.`user_id` = ?) as tp2
        ON t.id = tp2.tid
        WHERE t.`tag_text` LIKE ?
        ORDER BY t.`tag_text`
        LIMIT 100");
    echo $mysqli->error;
    $like_prefix = $prefix . '%';
    $stmt->bind_param("is", $user_id, $like_prefix);
    $stmt->execute();
    $stmt->bind_result($tag_id, $tag_text);

    $out = array();
    while($stmt->fetch()){
        $out[] = array(
            "id" => $tag_id,
            "label" => $tag_text
        );
    }

    $stmt->close();
    
    return $out;

}

function fetch_tags($specimen_id, $specimen_db_id, $user_id){

    global $mysqli;
    
    $stmt = $mysqli->prepare(
        "SELECT `tag`.`id`, `tag`.`tag_text`, `tag_placement`.`user_id`
        FROM `tag`
        JOIN `tag_placement` ON `tag`.`id` = `tag_placement`.`tag_id` 
        WHERE `tag_placement`.`specimen_id` = ?
        ORDER BY `tag`.`tag_text`;");
    $stmt->bind_param("i", $specimen_db_id);
    $stmt->execute();
    $stmt->bind_result($tag_id, $tag_text, $owner_id);

    $out = array();
    $out["ownTags"] = array();
    $out["othersTags"] = array();
    while($stmt->fetch()){
        $tag = array(
            "id" => $tag_id,
            "text" => $tag_text
        );
        if($owner_id == $user_id){
            $out["ownTags"][] = $tag;
        }else{
            $out["othersTags"][] = $tag;
        }
    }

    $stmt->close();

    return $out;

}

function save_tag($text, $specimen_id, $specimen_db_id, $user_id){

    global $mysqli;

    // is it in the tags table? If not then add it.
    $stmt = $mysqli->prepare("INSERT IGNORE INTO `tag` (`tag_text`) VALUES (?)");
    $stmt->bind_param("s", $text);
    $stmt->execute();
    $stmt->close();

    $tag_id = $mysqli->insert_id;

    // if the tag already existed then we won't have got an insert id
    if($tag_id == 0){
        $stmt = $mysqli->prepare("SELECT id FROM `tag` WHERE `tag_text` = ?");
        $stmt->bind_param("s", $text);
        $stmt->execute();
        $stmt->bind_result($tag_id);
        $stmt->fetch();
        $stmt->close();
    }

    // now add that to the specimen
    // Have they already got this tag for this specimen?
    // there is a unique key on the combination of user/specimen/tag to prevent this.
    $stmt = $mysqli->prepare("INSERT IGNORE INTO `tag_placement` (`tag_id`, `specimen_id`, `user_id`) VALUES (?,?,?)");
    $stmt->bind_param("iii", $tag_id, $specimen_db_id, $user_id);
    $stmt->execute();
    $stmt->close();

    return (object)array(
        'tagId' => $tag_id,
        'tagText' => $text,
        'specimenId' => $specimen_id,
        'userId' => $user_id
    );

}

function delete_tag($tag_id, $specimen_id, $specimen_db_id, $user_id){

    global $mysqli;

    $out = array();
    $out['specimenId'] = $specimen_id;

    $stmt = $mysqli->prepare("DELETE
    FROM `tag_placement`
    WHERE `tag_id` = ?
    AND `specimen_id` = ?
    AND `user_id` = ?");
    echo $mysqli->error;
    $stmt->bind_param("iii", $tag_id, $specimen_db_id, $user_id);
    $stmt->execute();
    $out['rows_affected'] = $stmt->affected_rows;
    $stmt->close();

    return $out;

}


//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo JSON_encode($out);


?>