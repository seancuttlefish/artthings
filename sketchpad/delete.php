<?php

$output = array();

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', FALSE);
header('Pragma: no-cache');
header('Content-Type: application/json');

// Verify the upload via a username/password?

$fileid = $_POST['fileid'];

$svg = rename("sketches/".$fileid.".svg", "sketches/trash/".$fileid.".svg");
$png = rename("sketches/".$fileid.".png", "sketches/trash/".$fileid.".png");
$log = rename("sketches/".$fileid.".log", "sketches/trash/".$fileid.".log");

$output['svg'] = $svg;
$output['png'] = $png;
$output['log'] = $log;
echo json_encode($output);

?>