// Variable to hold request
var request;

// Bind to the submit event of our form
$("#highscoreForm").submit(function(event){

    // Prevent default posting of form - put here to work in case of errors
    event.preventDefault();

    // Abort any pending request
    if (request) {
        request.abort();
    }
    // setup some local variables
    var $form = $(this);

    // Let's select and cache all the fields
    var $inputs = $form.find("input, select, button, textarea");

    // Serialize the data in the form
    var serializedData = $form.serialize();

    // Let's disable the inputs for the duration of the Ajax request.
    // Note: we disable elements AFTER the form data has been serialized.
    // Disabled form elements will not be serialized.
    $inputs.prop("disabled", true);

    let localPath = location.href.replace(/[^/]*$/, '');
    // Fire off the request to /form.php
    request = $.ajax({
        url: localPath+"scorePost.php",
        type: "get",
        data: serializedData
    });

    // Callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
        // Log a message to the console
        console.log("Hooray, it worked!");
        location.reload();
    });

    // Callback handler that will be called on failure
    request.fail(function (jqXHR, textStatus, errorThrown){
        // Log the error to the console
        console.error(
            "The following error occurred: "+
            textStatus, errorThrown
        );
        alert('Send failed, sorry :(');
    });

    // Callback handler that will be called regardless
    // if the request failed or succeeded
    request.always(function () {
        // Reenable the inputs
        $inputs.prop("disabled", false);
    });

});


function loadXML() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            parseXML(this);
        }
    };
    xhttp.open("GET", "highscores.xml", true);
    xhttp.send();
}

function parseXML(xml) {
    let i;
    let xmlDoc = xml.responseXML;
    let table="<tr><th>Name</th><th>Points</th></tr>";
    let x = xmlDoc.getElementsByTagName("SCORE");
    //x.sort(function(a, b){return b-a});
    let scores = [];
    for (i = 0; i <x.length; i++) {
        let name = x[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
        let score = x[i].getElementsByTagName("POINTS")[0].childNodes[0].nodeValue;
        scores.push({name : name, score : score});
    }
    //Rendezzük az adatokat a legnagyobb pontszám alapján
    scores.sort(function (a, b) {
        return a.score - b.score;
    }).reverse();
    //Táblázat készítése
    for (i = 0; i <scores.length; i++) {
        let name = scores[i].name;
        let score = scores[i].score;
        table += "<tr><td>" +
            name +
            "</td><td>" +
            score +
            "</td></tr>";
    }
    document.getElementById("highScore").innerHTML = table;
}