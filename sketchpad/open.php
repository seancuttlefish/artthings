<?php

$output = array();

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', FALSE);
header('Pragma: no-cache');
header('Content-Type: application/json');

$dir = 'sketches';
$files = scandir($dir,1);

$output['files'] = $files;
echo json_encode($output);

?>