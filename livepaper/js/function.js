var MM_lang 	   = false;
var MM_ENweather   = false;
var MM_geoLoc 	   = false;
var MM_temp 	   = false;
var MM_lat 		   = false;
var MM_lon 		   = false;
var MM_alt 	 	   = false;
var MM_ENshowRSS   = false;
var MM_showRSSURL  = false;
var MM_APIKey 	   = false;
var MM_IMG		   = false;
var MM_ENColor 	   = false;
var MM_CType 	   = false;
var MM_schColor    = false;
var MM_primColor   = false;
var MM_secColor    = false;
var MM_textColor   = false;
var MM_ENclock	   = false;
var MM_Timeline	   = false;
var MM_ENnewsRSS   = false;
var MM_newsRSSURL  = false;
var MM_BTCReport   = false;

var language = {
	"hu": {
		"weather": "Időjárás",
		"series": "Sorozatok",
		"wupd": "Utoljára frissítve:",
		"absolute0": "abszolút fagypont alatt (0 °K)",
	},
	"en": {
		"weather": "Weather",
		"series": "Watch list",
		"wupd": "Last updated:",
		"absolute0": "below absolute zero (0 °K)",
	}
};

var props_ori = {};
var props_new = {};


var propcheck = function(props) {
	if ($.isEmptyObject(props_ori)) {
		props_ori = props;
		init(props_ori);
	} else {
		props_new = {...props_ori, ...props};
		props_ori = props_new;
		init(props_new);
	}
}


var clear = function() {
	$('#tlSet, #tlRise, #tlCurr').css('left', '0');
	$('#middleIMG').css('background-image', 'url()');
	$('#showTitle, #showFeed, #wMain').empty();
	$('#showTitle, #showFeed, #wMain').removeClass('show');
}



function rgbToHex(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    	return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
	    r: parseInt(result[1], 16),
	    g: parseInt(result[2], 16),
	    b: parseInt(result[3], 16)
	} : null;
}

function makeCssRgb(hex) {
	return hexToRgb.r+', '+hexToRgb.g+', '+hexToRgb.b;
}


var init = function(props) {
	clear();
	MM_lang 	   = props['language'];
	MM_ENweather   = props['enable_weather'];
	MM_geoLoc 	   = props['weather_geolocation'];
	MM_temp 	   = props['temperature'];
	MM_lat 		   = props['latitude'];
	MM_lon 		   = props['longitude'];
	MM_alt 	 	   = props['altitude'];
	MM_ENshowRSS   = props['enable_showrss'];
	MM_showRSSURL  = props['showrss_feed'];
	MM_APIKey 	   = props['weather_api_key'];
	MM_City		   = props['weather_city'];
	MM_IMG		   = props['image'];
	MM_ENColor 	   = props['use_custom_colors'];
	MM_CType 	   = props['bgcolor_type'];
	MM_schColor    = props['schemecolor'];
	MM_primColor   = props['primary_color'];
	MM_secColor    = props['secondary_color'];
	MM_textColor   = props['textcolor'];
	MM_ENclock	   = props['enable_clock'];
	MM_Timeline	   = false;
	MM_ENnewsRSS   = props['enable_newsrss'];
	MM_newsRSSURL  = props['newsrss_feed'];
	MM_BTCReport   = props['enable_btcreport'];

	function DayCycle(sunrise, sunset, currtime, sunrise24hr, sunset24hr) {
		moment.locale(MM_lang)
		var currphase = currtime >= sunrise && currtime <= sunset ? 'day' : 'night';
		$('#csDefault').removeClass('day night').addClass(currphase);
		$('#tlSet')
			.empty()
			.html(
				'<i class="wi wi-sunset"></i>'+
				'<span>'+sunset24hr+'</span>'
			);
		$('#tlRise')
			.empty()
			.html(
				'<i class="wi wi-sunrise"></i>'+
				'<span>'+sunrise24hr+'</span>'
			);
		var curricon = currtime >= sunrise && currtime <= sunset ? 'day-sunny' : 'night-clear';
		var currtimeF = moment(currtime * 1000).format('HH.mm');
		var ssetPos = sunset24hr.replace(":", ".")*4.1666;
		var srisePos = sunrise24hr.replace(":", ".")*4.1666;
		var curPos = currtimeF.replace(":", ".")*4.1666;
		$('#tlSet').css('left', ssetPos+'%');
		$('#tlRise').css('left', srisePos+'%');
		$('#tlCurr').css('left', curPos+'%').removeClass('wi wi-day-sunny wi-night-clear').addClass('wi wi-'+curricon);
	}


	if (MM_ENColor == true) {

		if (MM_CType == 1) {
			$('#csTwoTone, #csRGB, #csParticle').hide();
			$('#csDefault').show();
		}

		if (MM_CType == 2) {
			if (MM_primColor && MM_secColor) {
				$('#csDefault, #csRGB, #csParticle').hide();
				var primaryColor = makeCssRgb(MM_primColor);
		        var secondaryColor = makeCssRgb(MM_secColor);
		        var primaryColorAsCSS = 'rgba(' + primaryColor + ',1)';
		        var secondaryColorAsCSS = 'rgba(' + secondaryColor + ',1)';
		        $('.colorscheme-twotone').css('background', 'linear-gradient(135deg, '+primaryColorAsCSS+' 0%, '+secondaryColorAsCSS+' 100%)');
		        $('#csTwoTone').show();
		        cleanUpShows();
		    }
		}

		if (MM_CType == 3) {
			$('#csDefault, #csTwoTone, #csParticle').hide();
			$('#csRGB').show();
		}

		if (MM_CType == 4) {
			$('#csDefault, #csTwoTone, #csRGB').hide();
			$('#csParticle').show();
			$('#csParticle').attr('data-dntime', moment().format('HH'));
			function dayInt() { $('#csParticle').attr('data-dntime', moment().format('HH')) };
			setInterval(dayInt, 1000);
		}
	} else {
		$('#csTwoTone, #csRGB').hide();
		$('#csDefault').show();
	}

	if (MM_textColor) {
		$('body').css('color', MM_textColor);
	}

	if (MM_ENweather == true) {
		getWeather(MM_geoLoc);
		setInterval(function() {
			getWeather(MM_geoLoc);
		}, 600000 ); //1800000 30 Min

		function getWeather(Wmethod) {
			$('#wMain').empty();
			$('#wMain').append(''+
				'<h2 class="weather-title" id="wTitle">'+language[MM_lang]['weather']+'</h2>'+
				'<h3 class="weather-stitle" id="wCity"></h3>'+
				'<h3 class="weather-stitle mar-b-10">'+
				'	<small>'+
				'		<span id="wLat"></span>'+
				'		<span id="wLon"></span>'+
				'		<span id="wAlt"></span>'+
				'	</small>'+
				'</h3>'+
				'<div class="weather-cnt col-10">'+
				'	<span class="col-10">'+
				'		<i class="weather-icon col-a" id="wIcon"></i>'+
				'		<p class="weather-descr col-a" id="wDesc"></p>'+
				'	</span>'+
				'	<span class="col-5">'+
				'		<p class="temp-cnt col-10">'+
				'			<small class="tempmin" id="wTempMin"></small>'+
				'			<b class="tempcurr" id="wTempCurr"></b>'+
				'			<small class="tempmax" id="wTempMax"></small>'+
				'		</p>'+
				'	</span>'+
				'	<span class="col-5">'+
				'		<p class="pressure col-10" id="wPress"></p>'+
				'		<p class="wind-spd col-10" id="wWindSpd"></p>'+
				'		<p class="wind-ori col-10" id="wWindOri"></p>'+
				'	</span>'+
				'</div>'+
				'<h3 class="weather-stitle mar-b-10">'+
				'	<small>'+
				'		<span id="lastUpd"></span>'+
				'	</small>'+
				'</h3>'
			)

			function degToCompass(num, lang) {
				var val = Math.floor((num / 22.5) + 0.5);
				var arr = ['en', 'hu'];
					arr['en'] = ["N", "N-NE", "NE", "E-NE", "E", "E-SE", "SE", "S-SE", "S", "S-SW", "SW", "W-SW", "W", "W-NW", "NW", "N-NW"];
					arr['hu'] = ["É", "É-ÉK", "ÉK", "K-ÉK", "K", "K-DK", "DK", "D-DK", "D", "D-DNY", "DNY", "NY-DNY", "NY", "NY-ÉNY", "ÉNY", "É-ÉNY"];
				return arr[lang][(val % 16)];
			}

			if (Wmethod == '1') {
				if ("geolocation" in navigator) {
					navigator.geolocation.getCurrentPosition(makeWeather);
				};
			} else if (Wmethod == '2') {
				var position = [];
					position['coords'] = [];
					position['coords']['latitude'] = MM_lat;
					position['coords']['longitude'] = MM_lon;
					position['coords']['altitude'] = MM_alt;

				makeWeather(position);
			}

			function makeWeather(position) {
				var lat = position.coords.latitude;
				var lon = position.coords.longitude;
				var alt = position.coords.altitude;
				var alt_text = $("#wAlt");
				var lat_text = $("#wLat");
				var lon_text = $("#wLon");
				var city_name;
				var region_name;
				var timezone;
				var localtime;
				var temp;
				var tempMatrix;
				var temp_max;
				var temp_min;
				var pressure;
				var weather_code;
				var wind_speed;
				var wind_ori;
				var country_name;
				var weather_description;
				var sunrise;
				var sunset;
				var sunrise24hr;
				var sunset24hr;
				var nowTimestamp = Math.floor(Date.now() / 1000);
				var weatherClass = 'wi wi-owm-';
				var apiKey = MM_APIKey;
				var lastupdate;

				lat_text.html(lat+' ,');
				lon_text.html(lon);
				if (alt !== null) {
					alt_text.html(', '+alt);
				}
				
				$.getJSON("https://api.weatherapi.com/v1/forecast.json?key="+apiKey+"&lat="+lat+"&lon="+lon+"&days=4&lang="+MM_lang+"&q="+MM_City, function(data) {
					city_name = data["location"]["name"];
					region_name = data["location"]["region"];
					country_name = data["location"]["country"];
					weather_description = data["current"]["condition"]["text"];
					localtime = data["location"]["localtime"];
					timezone = data["location"]["tz_id"];
					sunrise24hr = moment(data["forecast"]["forecastday"][0]["astro"]["sunrise"], 'hh:mm A').format('HH:mm');
					sunset24hr = moment(data["forecast"]["forecastday"][0]["astro"]["sunset"], 'hh:mm A').format('HH:mm');
					sunrise = moment(data["forecast"]["forecastday"][0]["date"]+" "+sunrise24hr).tz(timezone).format('x') / 1000;
					sunset = moment(data["forecast"]["forecastday"][0]["date"]+" "+sunset24hr).tz(timezone).format('x') / 1000;
					

					if (MM_temp == 1) {
						temp = data["current"]["temp_c"]+' °C';
						tempMatrix = data["current"]["temp_c"]+"'C";
						temp_max = data["forecast"]["forecastday"][0]["day"]["maxtemp_c"]+' °C';
						temp_min = data["forecast"]["forecastday"][0]["day"]["mintemp_c"]+' °C';
					} else if (MM_temp == 2) {
						temp = data["current"]["temp_f"]+' °F';
						tempMatrix = data["current"]["temp_f"] + "'F";
						temp_max = data["forecast"]["forecastday"][0]["day"]["maxtemp_f"]+' °F';
						temp_min = data["forecast"]["forecastday"][0]["day"]["mintemp_f"]+' °F';
					}
					pressure = data["current"]["pressure_mb"]+ " mBar";
					wind_speed = data["current"]["wind_kph"] + " km/h";
					wind_ori = data["current"]["wind_degree"]+'° '+degToCompass(data["current"]["wind_degree"], MM_lang);
					weather_code = data["current"]["condition"]["code"]
					weatherClass += (nowTimestamp >= sunrise && nowTimestamp <= sunset ? 'day' : 'night');
					weatherClass += ('-' + weather_code);
					/*lastupdate = language[MM_lang]['wupd']+' '+moment(data["dt"] * 1000).format('HH:mm');*/
					lastupdate = language[MM_lang]['wupd']+' '+moment(data["current"]["last_updated_epoch"] * 1000).format('HH:mm');


					$.each(data["forecast"]["forecastday"], function(i, v) {
						
					});


					$("#wCity").html(city_name);
					$('#wIcon').addClass(weatherClass).css('background-image', 'url("https:'+data["current"]["condition"]["icon"]+'")');
					$("#wDesc").html(weather_description);
					$("#wTempMin").html('<small>min.</small> <b>'+temp_min+'</b>');
					$("#wTempCurr").html(temp);
					$("#wTempMax").html('<small>max.</small> <b>'+temp_max+'</b>');
					$("#wPress").html(pressure);
					$("#wWindSpd").html(wind_speed);
					$("#wWindOri").html(wind_ori);
					$("#lastUpd").html(lastupdate);
					DayCycle(sunrise,sunset,nowTimestamp,sunrise24hr,sunset24hr);

					var temp_bit = './img/weather/'+data["current"]["condition"]["code"]+'.bmp';
					var pressure_bit = './img/pressure.bmp';
					var wind_speed_bit = './img/wind.bmp';
					/*
					matrixSetIcon('192.168.0.2', '32190', wind_speed_bit);
					matrixSetText('192.168.0.2', '32190', wind_speed);

					
					matrixSetIcon('192.168.0.2', '61855', temp_bit);
					matrixSetText('192.168.0.2', '61855', tempMatrix);

					
					matrixSetIcon('192.168.0.2', '603', pressure_bit);
					matrixSetText('192.168.0.2', '603', pressure);
					*/
				});

				
			};

		};
	}


	if (MM_IMG != null) {
		$('#middleIMG').css('background-image', 'url('+MM_IMG+')');
	}

	if (MM_ENshowRSS == true) {

		function getShows() {
			var url = MM_showRSSURL;
			$('#showFeed').rss(url,{
			    // how many entries do you want?
			    limit: 5,
			    layoutTemplate: "<div class='feed-cnt'>{entries}</div>",
			    entryTemplate: '<div class="feed-item">'+
			    					'<a class="boxfill" href="{link}">'+
			    						//'<p class="feed-title">{title}<small class="feed-date">{pubDate}</small></p>'+
			    						'<p class="feed-title">{title}<small class="feed-date">{pubDate}</small><span>{desc}</span></p>'+
			    					'</a>'+
			    				'</div>',
			    tokens: {
					link: function(entry, tokens) { return entry.link },
					desc: function(entry, tokens) {
						var title = entry.title;
						var desc =  entry.contentSnippet;
						var subbed = desc.substring(title.length, desc.indexOf("airs on"));
						return subbed
					},
					pubDate: function(entry, tokens) {
						moment.locale(MM_lang);
						return moment(new Date(entry.publishedDate)).format("YYYY.MM.DD. (dddd)")
					},
				},

			  },
			);
			
			$('#showTitle').html(language[MM_lang]['series']);
			cleanUpShows();
		};
		getShows();
	}

	if (MM_ENnewsRSS == true) {
		var url = MM_newsRSSURL;

		function newsCarousel() {
			$('#newsFeed .feed-cnt').owlCarousel({
			    loop:true,
			    margin:30,
			    nav:false,
			    dots:true,
			    autoplay:true,
				autoplayTimeout:5000,
				autoplayHoverPause:false,
			    responsive:{
			        0:{
			            items:1
			        },
			    }
			});
		};

		function getNews() {
			$('#newsFeed').rss(url,{
				// how many entries do you want?
			    limit: 5,
			    layoutTemplate: "<div class='feed-cnt'>{entries}</div>",
			    entryTemplate: '<div class="feed-item">'+
			    					'<a class="boxfill" href="{link}">'+
			    						//'<p class="feed-title">{title}<small class="feed-date">{pubDate}</small><span>{desc}</span></p>'+
			    						'<h1 class="feed-title">{title}</h1>'+
			    						'<span class="feed-date">{pubDate}</span>'+
			    						'<p>{desc}...</p>'+
			    					'</a>'+
			    				'</div>',
			    tokens: {
					link: function(entry, tokens) { return entry.link },
					desc: function(entry, tokens) { return entry.contentSnippet; },
					pubDate: function(entry, tokens) {
						moment.locale(MM_lang);
						return moment(new Date(entry.publishedDate)).format("YYYY.MM.DD. (dddd)")
					},
			    },

			  },
			);

			$('#newsTitle').html(language[MM_lang]['news']);
			cleanUpNews();
		};
		getNews();

	}

	if (MM_ENclock == true) {
		function displayTime() {
		    var time = moment().format('HH:<b>mm</b><i>:ss</i>');
			//var timeClean = moment().format('HH:mm:ss');
			$('#clock').html(time);
			/*
			27461
			192.168.0.2
			*/
			/*
			var timeClean = false;
			if (moment().format('ss') % 2 == 0) {
				timeClean = '    '+moment().format('HH:mm');
			} else {
				timeClean = '    '+moment().format('HH mm');
			}
			matrixSetText('192.168.0.2', '40295', timeClean);
			*/
		    setTimeout(displayTime, 1000);
		}

		displayTime();
	}

	if (MM_BTCReport == true) {
		var rates;
		var updatetime;

		function makeReport(item) {
			$('#BTCRates').append('<span class="btc-item">'/*+item.code+'|'*/+item.symbol+' '+item.rate+'</span>');
		}

		function gatherBTC() {
			$.getJSON("https://api.coindesk.com/v1/bpi/currentprice.json", function(data) {
				/*console.log(data);*/
				updatetime = moment(data["time"]["updatedISO"]).format('YYYY-MM-DD HH:MM');
				rates = data["bpi"];

				$('#BTCRates').html(
					'<span class="btc-title">BTC Exchange price</span>'+
					'<span class="btc-time">'+updatetime+'</span>'
				);
				/*console.log(rates);*/

				makeReport(rates["USD"]);
				makeReport(rates["EUR"]);
			});
		}

		gatherBTC();

		setInterval(function() {
			gatherBTC();
		}, 300000 );


		let LINEDATA = [];
		let data = [];
		let labels = [];

		function graph() {
			var dateFrom = moment(new Date()).subtract(1, 'week').format('YYYY-MM-DD');
			var dateTo = moment(new Date()).format('YYYY-MM-DD');
			$.getJSON('https://api.coindesk.com/v1/bpi/historical/close.json?start='+dateFrom+'&end='+dateTo+'&currency=EUR', function(data) {
				LINEDATA = data.bpi ;
				data = Object.keys(LINEDATA).map(key => LINEDATA[key]);
				labels = Object.keys(LINEDATA);
				console.log(data);
				console.log(labels);
				
				new Chart(document.getElementById("chart"), {
					type: 'line',
					data: {
						labels: labels,
						datasets: [{
							label: 'Bitcoin',
							data: data,
							borderColor: "#FFF",
						}]
					}
				});
			});
		}

		graph();
		setInterval(graph, 30000);
	};


	setTimeout(function() {
		//MM_ENColor
		//MM_IMG
		$('#clock').addClass('show');
		if (MM_ENnewsRSS) { newsCarousel(); $('#newsRSS').addClass('show'); };
		if (MM_ENshowRSS) { $('#showRSS').addClass('show'); };
		if (MM_ENweather) {	$('#tlMain, #wMain').addClass('show'); };
		if (MM_BTCReport) { $('#BTCRates').parents('.btc-rates-cnt').addClass('show'); };
	}, 2000);
};

function cleanUpShows() { $('#showFeed').find('.feed-cnt:not(:eq(0))').remove(); }
function cleanUpNews() { $('#newsFeed').find('.feed-cnt:not(:eq(0))').remove(); }

var MMConfig = {

	language				 : 'en', //hu or en

	//Upcoming shows RSS
	enable_showrss 			 : true, //true or false
	showrss_feed 			 : 'https://showrss.info/user/schedule/217349.rss', //link to the feed from https://showrss.info/timeline

	//Weather feed
	enable_weather 		 	 : true, //true or false
	weather_api_key 	 	 : '828c0fd641334608a3d145757200608', //from https://www.weatherapi.com/
	weather_geolocation 	 : 2, //1 = automatic geoloc (if supported), 2 = use provided lat-lon
	temperature 			 : 1, //1 = Celsius, 2 = Fahrenheit
	weather_city			 : 'Szombathely', //Literally the name of your city
	latitude 				 : '47.23088', //the latitude of the city you want to display
	longitude 			 	 : '16.62155', //the longitude of the city you want to display
	altitude 				 : '0', //usually zero or not used

	//Image in the middle
	image 					 : ''/*'https://cutewallpaper.org/21/black-gif-background/Black-background-gif-13-GIF-Images-Download.gif'*/, //url of an image, preferably white with transparent or black bg

	//Color themes
	use_custom_colors 		 : true, //true or false
	bgcolor_type 			 : 4, //1 = Default (Gradient from original), 2 = Gradient from prim+sec color (You can set it down the line), 3 = RGB, 4 = Particle Day/Night cycle
	schemecolor 			 : '#FFFFFF', //Unused for setting windows scheme color in Wallpaper Engine
	primary_color 			 : '#000000', //for bgcolor type2
	secondary_color 		 : '#000000', //also
	textcolor 				 : '#FFFFFF', //Color of all texts

	//Clock
	enable_clock			: true, //true or false

	//News
	enable_newsrss			: false, //true or false
	newsrss_feed 			: 'https://444.hu/feed', //link to the news feed you'd like

	//BTC Report
	enable_btcreport		: false
};

$(document).ready(function() {
	//console.log(MMConfig);
	propcheck(MMConfig);

	////////////////////////// PARTICLE ENGINE ////////////////////////////////////////
	/////////////////////////////////////////////////////////////////////////////////////////

	var ParticleEngine = (function () {
		'use strict';

		function ParticleEngine(canvas_id) {
			// enforces new
			if (!(this instanceof ParticleEngine)) {
				return new ParticleEngine(args);
			}

			var _ParticleEngine = this;

			this.canvas_id = canvas_id;
			this.stage = new createjs.Stage(canvas_id);
			this.totalWidth = this.canvasWidth = document.getElementById(canvas_id).width = document.getElementById(canvas_id).offsetWidth;
			this.totalHeight = this.canvasHeight = document.getElementById(canvas_id).height = document.getElementById(canvas_id).offsetHeight;
			this.compositeStyle = "lighter";

			this.particleSettings = [{ id: "small", num: 300, fromX: 0, toX: this.totalWidth, ballwidth: 3, alphamax: 0.4, areaHeight: .5, color: "#DDD", fill: false },
			{ id: "medium", num: 100, fromX: 0, toX: this.totalWidth, ballwidth: 8, alphamax: 0.3, areaHeight: 1, color: "#DDD", fill: true },
			{ id: "large", num: 10, fromX: 0, toX: this.totalWidth, ballwidth: 30, alphamax: 0.2, areaHeight: 1, color: "#DDD", fill: true }];
			this.particleArray = [];
			this.lights = [{ ellipseWidth: 400, ellipseHeight: 100, alpha: 0.6, offsetX: 0, offsetY: 0, color: "#DDD" },
			{ ellipseWidth: 350, ellipseHeight: 250, alpha: 0.3, offsetX: -50, offsetY: 0, color: "#DDD" },
			{ ellipseWidth: 100, ellipseHeight: 80, alpha: 0.2, offsetX: 80, offsetY: -50, color: "#DDD" }];

			this.stage.compositeOperation = _ParticleEngine.compositeStyle;


			function drawBgLight() {
				var light;
				var bounds;
				var blurFilter;
				for (var i = 0, len = _ParticleEngine.lights.length; i < len; i++) {
					light = new createjs.Shape();
					light.graphics.beginFill(_ParticleEngine.lights[i].color).drawEllipse(0, 0, _ParticleEngine.lights[i].ellipseWidth, _ParticleEngine.lights[i].ellipseHeight);
					light.regX = _ParticleEngine.lights[i].ellipseWidth / 2;
					light.regY = _ParticleEngine.lights[i].ellipseHeight / 2;
					light.y = light.initY = _ParticleEngine.totalHeight / 2 + _ParticleEngine.lights[i].offsetY;
					light.x = light.initX = _ParticleEngine.totalWidth / 2 + _ParticleEngine.lights[i].offsetX;

					blurFilter = new createjs.BlurFilter(_ParticleEngine.lights[i].ellipseWidth, _ParticleEngine.lights[i].ellipseHeight, 1);
					bounds = blurFilter.getBounds();
					light.filters = [blurFilter];
					light.cache(bounds.x - _ParticleEngine.lights[i].ellipseWidth / 2, bounds.y - _ParticleEngine.lights[i].ellipseHeight / 2, bounds.width * 2, bounds.height * 2);
					light.alpha = _ParticleEngine.lights[i].alpha;

					light.compositeOperation = "screen";
					_ParticleEngine.stage.addChildAt(light, 0);

					_ParticleEngine.lights[i].elem = light;
				}

				TweenMax.fromTo(_ParticleEngine.lights[0].elem, 10, { scaleX: 1.5, x: _ParticleEngine.lights[0].elem.initX, y: _ParticleEngine.lights[0].elem.initY }, { yoyo: true, repeat: -1, ease: Power1.easeInOut, scaleX: 2, scaleY: 0.7 });
				TweenMax.fromTo(_ParticleEngine.lights[1].elem, 12, { x: _ParticleEngine.lights[1].elem.initX, y: _ParticleEngine.lights[1].elem.initY }, { delay: 5, yoyo: true, repeat: -1, ease: Power1.easeInOut, scaleY: 2, scaleX: 2, y: _ParticleEngine.totalHeight / 2 - 50, x: _ParticleEngine.totalWidth / 2 + 100 });
				TweenMax.fromTo(_ParticleEngine.lights[2].elem, 8, { x: _ParticleEngine.lights[2].elem.initX, y: _ParticleEngine.lights[2].elem.initY }, { delay: 2, yoyo: true, repeat: -1, ease: Power1.easeInOut, scaleY: 1.5, scaleX: 1.5, y: _ParticleEngine.totalHeight / 2, x: _ParticleEngine.totalWidth / 2 - 200 });
			}

			var blurFilter;
			function drawParticles() {

				for (var i = 0, len = _ParticleEngine.particleSettings.length; i < len; i++) {
					var ball = _ParticleEngine.particleSettings[i];

					var circle;
					for (var s = 0; s < ball.num; s++) {
						circle = new createjs.Shape();
						if (ball.fill) {
							circle.graphics.beginFill(ball.color).drawCircle(0, 0, ball.ballwidth);
							blurFilter = new createjs.BlurFilter(ball.ballwidth / 2, ball.ballwidth / 2, 1);
							circle.filters = [blurFilter];
							var bounds = blurFilter.getBounds();
							circle.cache(-50 + bounds.x, -50 + bounds.y, 100 + bounds.width, 100 + bounds.height);
						} else {
							circle.graphics.beginStroke(ball.color).setStrokeStyle(1).drawCircle(0, 0, ball.ballwidth);
						}

						circle.alpha = range(0, 0.1);
						circle.alphaMax = ball.alphamax;
						circle.distance = ball.ballwidth * 2;
						circle.ballwidth = ball.ballwidth;
						circle.flag = ball.id;
						_ParticleEngine.applySettings(circle, ball.fromX, ball.toX, ball.areaHeight);
						circle.speed = range(2, 10);
						circle.y = circle.initY;
						circle.x = circle.initX;
						circle.scaleX = circle.scaleY = range(0.3, 1);

						_ParticleEngine.stage.addChild(circle);


						animateBall(circle);

						_ParticleEngine.particleArray.push(circle);
					}
				}
			}

			this.applySettings = function (circle, positionX, totalWidth, areaHeight) {
				circle.speed = range(1, 3);
				circle.initY = weightedRange(0, _ParticleEngine.totalHeight, 1, [_ParticleEngine.totalHeight * (2 - areaHeight / 2) / 4, _ParticleEngine.totalHeight * (2 + areaHeight / 2) / 4], 0.8);
				circle.initX = weightedRange(positionX, totalWidth, 1, [positionX + ((totalWidth - positionX)) / 4, positionX + ((totalWidth - positionX)) * 3 / 4], 0.6);
			}

			function animateBall(ball) {
				var scale = range(0.3, 1);
				var xpos = range(ball.initX - ball.distance, ball.initX + ball.distance);
				var ypos = range(ball.initY - ball.distance, ball.initY + ball.distance);
				var speed = ball.speed;
				TweenMax.to(ball, speed, { scaleX: scale, scaleY: scale, x: xpos, y: ypos, onComplete: animateBall, onCompleteParams: [ball], ease: Cubic.easeInOut });
				TweenMax.to(ball, speed / 2, { alpha: range(0.1, ball.alphaMax), onComplete: fadeout, onCompleteParams: [ball, speed] });
			}

			function fadeout(ball, speed) {
				ball.speed = range(2, 10);
				TweenMax.to(ball, speed / 2, { alpha: 0 });
			}

			drawBgLight();
			drawParticles();
		}

		ParticleEngine.prototype.render = function () {
			this.stage.update();
		}

		ParticleEngine.prototype.resize = function () {
			this.totalWidth = this.canvasWidth = document.getElementById(this.canvas_id).width = document.getElementById(this.canvas_id).offsetWidth;
			this.totalHeight = this.canvasHeight = document.getElementById(this.canvas_id).height = document.getElementById(this.canvas_id).offsetHeight;
			this.render();

			for (var i = 0, length = this.particleArray.length; i < length; i++) {
				this.applySettings(this.particleArray[i], 0, this.totalWidth, this.particleArray[i].areaHeight);
			}

			for (var j = 0, len = this.lights.length; j < len; j++) {
				this.lights[j].elem.initY = this.totalHeight / 2 + this.lights[j].offsetY;
				this.lights[j].elem.initX = this.totalWidth / 2 + this.lights[j].offsetX;
				TweenMax.to(this.lights[j].elem, .5, { x: this.lights[j].elem.initX, y: this.lights[j].elem.initY });
			}
		}

		return ParticleEngine;

	}());


	////////////////////////UTILS//////////////////////////////////////
	//////////////////////////////////////////////////////////////////

	function range(min, max) {
		return min + (max - min) * Math.random();
	}

	function round(num, precision) {
		var decimal = Math.pow(10, precision);
		return Math.round(decimal * num) / decimal;
	}

	function weightedRange(to, from, decimalPlaces, weightedRange, weightStrength) {
		if (typeof from === "undefined" || from === null) {
			from = 0;
		}
		if (typeof decimalPlaces === "undefined" || decimalPlaces === null) {
			decimalPlaces = 0;
		}
		if (typeof weightedRange === "undefined" || weightedRange === null) {
			weightedRange = 0;
		}
		if (typeof weightStrength === "undefined" || weightStrength === null) {
			weightStrength = 0;
		}

		var ret
		if (to == from) { return (to); }

		if (weightedRange && Math.random() <= weightStrength) {
			ret = round(Math.random() * (weightedRange[1] - weightedRange[0]) + weightedRange[0], decimalPlaces)
		} else {
			ret = round(Math.random() * (to - from) + from, decimalPlaces)
		}
		return (ret);
	}

	///////////////// RUN CODE //////////////////////////
	//////////////////////////////////////////////////////

	var particles
	(function () {
		particles = new ParticleEngine('projector');
		createjs.Ticker.addEventListener("tick", updateCanvas);
		window.addEventListener('resize', resizeCanvas, false);

		function updateCanvas() {
			particles.render();
		}

		function resizeCanvas() {
			particles.resize();
		}
	}());
});