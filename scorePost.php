<?php
header("Access-Control-Allow-Origin: *");
if (!isset($_GET['points']) || !isset($_GET['name'])) {
	
} else {
	$postedName = $_GET['name'];
	$postedPoints = $_GET['points'];

	if ($postedPoints < 0) {
	    $postedPoints = '0';
	} elseif ($postedPoints > 11520000) {
	    $postedPoints = 'cheater';
	}
	$xml_doc = new DomDocument;
	$xml_doc->Load('highscores.xml');
	$scores = $xml_doc->getElementsByTagName('HIGHSCORES')->item(0);
	$newscore = $xml_doc->createElement('SCORE');
	$newname = $xml_doc->createElement('NAME', $postedName);
	$newpoints = $xml_doc->createElement('POINTS', $postedPoints);
	$newscore->appendChild($newname);
	$newscore->appendChild($newpoints);
	$scores->appendChild($newscore);
	$done = $xml_doc->save("highscores.xml");
}
?>

