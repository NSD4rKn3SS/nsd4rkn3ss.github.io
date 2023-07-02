/*let matrixIP = '192.168.0.4';
let matrixID = '27970';
let matrixTEXT = '';
let matrixColor = '\\calign\\#ff4900';*/

let locale = 'hu-HU', //en-US
    lat = '47.2309',
    lng = '16.621';
let openMeteoURL = 'https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lng+'&current_weather=true&timezone=auto';
let weather,
    formattedWeather;

function updateWeather() {
    $.getJSON(openMeteoURL, function(data) {
        weather = data;
        formattedWeather = weather['current_weather']['temperature']+'°C';
    });
}


function updateDateTime() {
    var date = new Date();
  
    var options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    var formattedDate = date.toLocaleDateString("hu-HU", options);
    var formattedTime = date.toLocaleTimeString("hu-HU", { hour12: false });
  
    var dateTimeElement = document.getElementById("datetime");
    dateTimeElement.innerHTML = formattedDate +' '+ formattedTime +'<br>'+formattedWeather;
    //matrixSetIcon('192.168.0.2', '50459', temp_bit);
    //matrixTEXT = formattedTime;
	//matrixSetText(matrixIP, matrixID, matrixColor+matrixTEXT);
}

function updateBG() {
    let strBackgroundDesktop = "./summersale2023/home_header_bg_day_notext.gif";
    let curDate = new Date();
    if ( curDate.getHours() >= 18 || curDate.getHours() < 6 ) {
        strBackgroundDesktop = "./summersale2023/home_header_bg_night_notext.gif";
        $('.page_pattern_holder').addClass('night');
    } else {
        strBackgroundDesktop = "./summersale2023/home_header_bg_day_notext.gif"
        $('.page_pattern_holder').removeClass('night');
    }
    $( '.page_background_holder' ).css( 'background-image', 'url("' + strBackgroundDesktop + '")' );
}
// Refresh date and time every second (1000 milliseconds)
setInterval(updateDateTime, 1000);
setInterval(updateWeather, 3600000);
setInterval(updateBG, 3600000);

$(document).ready(function () {
    updateDateTime();
    updateWeather();
    updateBG();
});