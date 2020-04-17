<?php
require_once('config.php');
require_once('include/solr_functions.php');
/*
    This is a utility script to index / reindex specimens as required
*/

// can only be run on command line
if(php_sapi_name() !== 'cli'){
    echo "Only available on command line";
    exit();
}

$ops = getopt('q:');

if(count($ops) == 0){
$help = <<<EOD

--------------------
SOLR Index Specimens
--------------------
Required option:
-q = Index specimens matching SQL query WHERE clause supplied.
e.g. php solr_index_specimens.php -q "id > 0"
e.g. php solr_index_specimens.php -q "modified > '2020-03-19'"

EOD;
echo $help;
}

if(isset($ops['q'])){
    $where = $ops['q'];
    $sql = "SELECT id FROM specimen WHERE $where";
    echo $sql . "\n";
    $result = $mysqli->query($sql);
    $total = $result->num_rows;
    $count = 0;
    while($row = $result->fetch_assoc()){
        echo "$count of $total - {$row['id']}\n";
        solr_index_specimen_by_id($row['id']);
        $count++;
        if($count % 100 == 0 )solr_commit(); // commit every once in a while
    }
    solr_commit(); // done so commit

}


?>