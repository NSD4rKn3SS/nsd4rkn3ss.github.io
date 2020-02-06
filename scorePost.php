<?php
/*
$_POST['name'] = ;
$_POST['score'] = ;
*/
$xml_doc = new DomDocument;
$xml_doc->Load('highscores.xml');
$scores = $xml_doc->getElementsByTagName('HIGHSCORES')->item(0);
$newscore = $xml_doc->createElement('SCORE');
$newname = $xml_doc->createElement('NAME', $_POST['name']);
$newpoints = $xml_doc->createElement('POINTS', $_POST['points']);
$newscore->appendChild($newname);
$newscore->appendChild($newpoints);
$scores->appendChild($newscore);
$done = $xml_doc->save("highscores.xml");
?>

