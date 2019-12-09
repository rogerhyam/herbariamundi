<?php

$out = array(

    'folders' => array(
        '1999' => array(
            'id' => '1999',
            'title' => 'Bananas'
        ),
        '22828' => array(
            'id' => '22828',
            'title' => 'Apples'
        ),
        '33' => array(
            'id' => '33',
            'title' => 'Oranges'
        ),
        '34' => array(
            'id' => '34',
            'title' => 'Pears'
        )
    ),
    'cabinets' => array(
        '1' => array(
            "id" => '1',
            "title" => 'Fruits',
            "description" => 'Sweet things',
            "folderIds" => array(
                '1999', '22828', '33'
            )
        ),
        '2' => array(
            "id" => '2',
            "title" => 'Stones',
            "description" => 'Hard things',
            'folderIds' => array('34')
        ),
        '3' => array(
            "id" => '3',
            "title" => 'Animals',
            "description" => 'Fury things',
            'folderIds' => array()
        )
    ),
    'cabinetIds' => array('3', '1', '2')
);


header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');
echo JSON_encode($out);

?>