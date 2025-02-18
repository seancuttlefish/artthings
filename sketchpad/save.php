<?php

$output = array();

header('Cache-Control: no-store, no-cache, must-revalidate');
header('Cache-Control: post-check=0, pre-check=0', FALSE);
header('Pragma: no-cache');
header('Content-Type: application/json');

// Verify the upload via a username/password?

$svgdata = $_POST['svg'];
$pngdata = $_POST['png'];
$logdata = $_POST['log'];

$fileid = uniqid();

$svgfilename = "sketches/".$fileid.".svg";
$svgfile = fopen($svgfilename, "w");
fwrite($svgfile, $svgdata);
fclose($svgfile);

$filteredData = substr($pngdata, strpos($pngdata, ",")+1);
$unencodedData = base64_decode($filteredData);
$pngfilename = "sketches/".$fileid.".png";
$pngfile = fopen($pngfilename, "w");
fwrite($pngfile, $unencodedData);
fclose($pngfile);

$logfilename = "sketches/".$fileid.".log";
$logfile = fopen($logfilename, "w");
fwrite($logfile, $logdata);
fclose($logfile);

$output['fileid'] = $fileid;
echo json_encode($output);

?>