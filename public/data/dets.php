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
        $out['saved'] = save_det($payload->wfoId, $payload->specimenId, $payload->specimenDbId, $payload->wfoItem, $user_id);
        $out['dets'] = fetch_dets($payload->specimenDbId, $user_id);
        update_solr($payload->specimenDbId);
        break;

    case 'delete':
        $out['specimenDbId'] = $payload->specimenDbId;
        $out['deleted'] = delete_det($payload->detId, $payload->specimenDbId, $user_id);
        $out['dets'] = fetch_dets($payload->specimenDbId, $user_id);
        update_solr($payload->specimenDbId);
        break;
 
    case 'fetch':
        $out['specimenDbId'] = $payload->specimenDbId;
        $out['fetched'] = $payload->specimenId;
        $out['dets'] = fetch_dets($payload->specimenDbId, $user_id);
        break;

    default:
        $out['error'] = 'Unrecognised verb: ' . $_GET['verb'];
        break;

}

function update_solr($specimen_db_id){
    // we have to reindex the whole record because it is not 
    // possible to remove fam,gen,sp values as we don't know
    // where the come from e.g. did it get the value "Rhododendron" from this det or
    // another det or the original record.
    db_enqueue_specimen_for_indexing($specimen_db_id);
}

function fetch_dets($specimen_db_id, $user_id){

    global $mysqli;
    
    $stmt = $mysqli->prepare(
        "SELECT d.id, d.wfo_raw, u.id, u.name, u.orcid, d.created FROM `determination` as d join  `user` as u on d.user_id = u.id
        WHERE d.`specimen_id` = ?
        ORDER BY d.`created`;");
    $stmt->bind_param( "i",$specimen_db_id );
    $stmt->execute();
    $stmt->bind_result( 
        $det_id,
        $wfo_raw,
        $owner_id,
        $user_name,
        $user_orcid,
        $det_created
    );

    $out = array();
    $out["ownDets"] = array();
    $out["othersDets"] = array();

    while($stmt->fetch()){

        $wfo_item = json_decode($wfo_raw);

        $det = array(
            "id" => $det_id,
            "created" => $det_created,
            "wfo_item" => $wfo_item,
            "wfo_link" => 'http://www.worldfloraonline.org/taxon/' . $wfo_item->taxonID_s,
            'wfo_label' => $wfo_item->scientificName_s . ' ' .  $wfo_item->scientificNameAuthorship_s,
            'user_link' => 'https://orcid.org/' . $user_orcid,
            "user_label" => $user_name
        );
        if($owner_id == $user_id){
            $out["ownDets"][] = $det;
        }else{
            $out["othersDets"][] = $det;
        }
    }

    $stmt->close();

    return $out;

}


function save_det($wfo_id, $specimen_id, $specimen_db_id, $wfo_item, $user_id){

    global $mysqli;

    // now add that to the specimen
    // Have they already got this tag for this specimen?
    // there is a unique key on the combination of user/specimen/tag to prevent this.
    $stmt = $mysqli->prepare("INSERT IGNORE INTO `determination` (`wfo_id`, `specimen_id`, `wfo_raw`, `user_id`) VALUES (?,?,?,?)");
    $raw = json_encode($wfo_item);
    $stmt->bind_param("sisi", $wfo_id, $specimen_db_id, $raw, $user_id);
    $stmt->execute();
    $stmt->close();

    $det_id = $mysqli->insert_id;

    return (object)array(
        'detId' => $det_id,
        'wfoId' => $wfo_id,
        'specimenId' => $specimen_id,
        'userId' => $user_id,
        'wfoItem' => $wfo_item
    );

}


function delete_det($det_id, $specimen_db_id, $user_id){

    global $mysqli;

    $out = array();
    $out['det_id'] = $det_id;
    $stmt = $mysqli->prepare("DELETE
    FROM `determination`
    WHERE `id` = ?
    AND `specimen_id` = ?
    AND `user_id` = ?");
    echo $mysqli->error;
    $stmt->bind_param("iii", $det_id, $specimen_db_id, $user_id);
    $stmt->execute();
    $out['rows_affected'] = $stmt->affected_rows;
    $stmt->close();

    return $out;

}


//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo JSON_encode($out);


?>