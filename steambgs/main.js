class SteamBG {
	param = 	this.param				?? this.getURLParameters()
	locale = 	this.param.locale 		?? 'hu-HU' //en-US
	lat = 		this.param.lat 			?? '47.2309'
	lng = 		this.param.lng 			?? '16.621'
	hour12set = this.param.hour12 		?? false
	season = 	this.param.season 		?? 'summer'
	year = 		this.param.year 		??  '2023'
	openMeteoURL = 'https://api.open-meteo.com/v1/forecast?latitude='+this.lat+'&longitude='+this.lng+'&current_weather=true&timezone=auto'
	weather
	formattedWeather
	timeofday = 'day'
	bgs = {
		'years' : ["2023"],
		'seasons' : ["spring", "summer", "fall", "winter"]
		
	}

	getURLParameters() {
		let query = window.location.search.substring(1); // Exclude the '?' character
		let params = {};

		// Split the query string into an array of parameters
		let pairs = query.split('&');

		// Iterate over each parameter and split it into a key/value pair
		for (var i = 0; i < pairs.length; i++) {
			let pair = pairs[i].split('=');
			let key = decodeURIComponent(pair[0]);
			let value = decodeURIComponent(pair[1] || '');

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

	updateWeather() {
		let fn = this;
		$.getJSON(fn.openMeteoURL, function(data) {
			fn.weather = data;
			fn.formattedWeather = data['current_weather']['temperature']+'°C';
			let weatherElement = document.getElementById("weather");
			weatherElement.innerHTML = fn.formattedWeather;
		});			

	}

	updateDateTime() {
		let fn = this
		let date = new Date();
	  
		let options = {
		  year: "numeric",
		  month: "long",
		  day: "numeric",
		};
		let formattedDate = date.toLocaleDateString(fn.locale, options);
		let formattedTime = date.toLocaleTimeString(fn.locale, { hour12: fn.hour12set });
	  
		let dateTimeElement = document.getElementById("time");
		dateTimeElement.innerHTML = formattedDate +'<br>'+formattedTime;

		if ( date.getHours() >= 18 || date.getHours() < 6 ) { fn.timeofday = 'night' } else { fn.timeofday = 'day' }


	}

	updateBG(season, year) {
		let fn = this

		if (season && year) {
		  //set default BG
		  let strBackgroundDesktop = "./images/"+season+"sale/"+year+"/home_header_bg_day_notext.gif";
	  
		  //its night
		  if (fn.timeofday === 'night') {
			if (season === "summer") {
			  strBackgroundDesktop = "./images/"+season+"sale/"+year+"/home_header_bg_night_notext.gif";
			}
			if (season === "spring") {
			  strBackgroundDesktop = "./images/"+season+"sale/"+year+"/page_bg_english.gif";
			} else {
			  strBackgroundDesktop = "./summersale2023/home_header_bg_night_notext.gif";
			}
			$('.page_pattern_holder').addClass(season+' y'+year);
			$('.page_pattern_holder').addClass('night');
		  }
	  
		  //its day
		  else {
			if (season === "summer") {
			  strBackgroundDesktop = "./images/" + season + "sale/" + year + "/home_header_bg_day_notext.gif";
			}
			if (season === "spring") {
			  strBackgroundDesktop = "./images/" + season + "sale/" + year + "/page_bg_english.gif";
			} else {
			  strBackgroundDesktop = "./summersale2023/home_header_bg_day_notext.gif";
			}
			$('.page_pattern_holder').addClass(season+ ' y'+ year);
			$('.page_pattern_holder').removeClass('night');
		  }
	  
		  //set BG
		  $('.page_background_holder').css('background-image', 'url(' + strBackgroundDesktop + ')');
		}
	  
		else {
		  //set default BG
		  let strBackgroundDesktop = "./summersale2023/home_header_bg_day_notext.gif";

		  //its night
		  if ( fn.timeofday === 'night') {
			  strBackgroundDesktop = "./summersale2023/home_header_bg_night_notext.gif";
			  $('.page_pattern_holder').addClass('night');
		  }
		  //its day
		  else {
			  strBackgroundDesktop = "./summersale2023/home_header_bg_day_notext.gif"
			  $('.page_pattern_holder').removeClass('night');
		  }
		  $( '.page_background_holder' ).css( 'background-image', 'url(' + strBackgroundDesktop + ')' );
		}
	}

	intervals() {
		setInterval(this.updateDateTime, 1000);
		setInterval(this.updateWeather, 3600000);
		setInterval(this.updateBG, 3600000);
	}

	init() {
		this.param = this.getURLParameters();
		this.updateDateTime();
		this.updateWeather();
		this.updateBG(this.season, this.year);
		this.intervals();

	}
	
}