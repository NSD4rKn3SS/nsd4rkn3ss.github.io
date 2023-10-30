/*let matrixIP = '192.168.0.4';
let matrixID = '27970';
let matrixTEXT = '';
let matrixColor = '\\calign\\#ff4900';*/

function getURLParameters() {
  var query = window.location.search.substring(1); // Exclude the '?' character
  var params = {};

  // Split the query string into an array of parameters
  var pairs = query.split('&');

  // Iterate over each parameter and split it into a key/value pair
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1] || '');

    // Store the key/value pair in the params object
    if (key) {
      // If the key already exists, convert it into an array of values
      if (params[key]) {
        if (Array.isArray(params[key])) {
          params[key].push(value);
        } else {
          params[key] = [params[key], value];
        }
      } else {
        params[key] = value;
      }
    }
  }

  return params;
}

// Usage:
var param = getURLParameters();

let locale = param.locale ? param.locale : 'hu-HU', //en-US
    lat = param.lat ? param.lat : '47.2309',
    lng = param.lng ? param.lng : '16.621',
    hour12set = param.hour12 ? param.hour12 : false;
let openMeteoURL = 'https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lng+'&current_weather=true&timezone=auto';
let weather,
    formattedWeather;
let season = param.season ? param.season : 'summer';
let year = param.year ? param.year : '2023';

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
    var formattedDate = date.toLocaleDateString(locale, options);
    var formattedTime = date.toLocaleTimeString(locale, { hour12: hour12set });
  
    var dateTimeElement = document.getElementById("datetime");
    dateTimeElement.innerHTML = formattedDate +'<br>'+ formattedTime +' - '+formattedWeather;
    //matrixSetIcon('192.168.0.2', '50459', temp_bit);
    //matrixTEXT = formattedTime;
	//matrixSetText(matrixIP, matrixID, matrixColor+matrixTEXT);
}

function updateBG(season, year) {
  if (season && year) {
    let strBackgroundDesktop = "./images/"+season+"sale/"+year+"/home_header_bg_day_notext.gif";
    let curDate = new Date();
    if (curDate.getHours() >= 18 || curDate.getHours() < 6) {
      if (season === "summer") {
        strBackgroundDesktop = "./images/"+season+"sale/"+year+"/home_header_bg_night_notext.gif";
      }
      if (season === "spring") {
        strBackgroundDesktop = "././images/" + season + "sale/" + year +"/page_bg_english.gif";
      } else {
        strBackgroundDesktop = "./summersale2023/home_header_bg_night_notext.gif";
      }
      $('.page_pattern_holder').addClass(season+' y'+year+' night');
    } else {
      strBackgroundDesktop = "./images/"+season+"sale/"+year+"/home_header_bg_day_notext.gif"
      $('.page_pattern_holder').addClass(season + ' y' + year);
      $('.page_pattern_holder').removeClass('night');
    }
    $('.page_background_holder').css('background-image', 'url("' + strBackgroundDesktop + '")');
  }
  else {
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
}
// Refresh date and time every second (1000 milliseconds)
setInterval(updateDateTime, 1000);
setInterval(updateWeather, 3600000);
setInterval(updateBG, 3600000);

$(document).ready(function () {
    updateDateTime();
    updateWeather();
  updateBG(season, year);
});