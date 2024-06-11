class SteamBG {
	constructor() {
		this.param = this.getURLParameters();
		this.locale = this.param.locale || 'hu-HU';
		this.lat = this.param.lat || '47.2309';
		this.lng = this.param.lng || '16.621';
		this.hour12set = this.param.hour12 || false;
		this.season = this.param.season || 'summer';
		this.year = this.param.year || '2023';
		this.openMeteoURL = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lng}&current_weather=true&timezone=auto`;
		this.weather = null;
		this.formattedWeather = null;
		this.timeofday = 'day';
		this.bgs = {
			'years': ["2023"],
			'seasons': ["spring", "summer", "fall", "winter"]
		};
	}

	getURLParameters() {
		let query = window.location.search.substring(1);
		let params = {};
		let pairs = query.split('&');
		for (let pair of pairs) {
			let [key, value] = pair.split('=');
			key = decodeURIComponent(key);
			value = decodeURIComponent(value || '');
			if (key) {
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
		fetch(this.openMeteoURL)
			.then(response => response.json())
			.then(data => {
				this.weather = data;
				this.formattedWeather = data['current_weather']['temperature'] + '°C';
				let weatherElement = document.getElementById("weather");
				weatherElement.innerHTML = this.formattedWeather;
			})
			.catch(error => console.error(error));
	}

	updateDateTime() {
		let date = new Date();
		let dateLocale = this.locale || this.param.locale;
		let options = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		let formattedDate = date.toLocaleDateString(dateLocale, options);
		let formattedTime = date.toLocaleTimeString(dateLocale, { hour12: this.hour12set });
		let dateTimeElement = document.getElementById("time");
		dateTimeElement.innerHTML = formattedDate + '<br>' + formattedTime;
		this.timeofday = date.getHours() >= 18 || date.getHours() < 6 ? 'night' : 'day';
	}

	updateBG(season, year) {
		let strBackgroundDesktop;
		if (season && year) {
			strBackgroundDesktop = `./images/${season}sale/${year}/home_header_bg_${this.timeofday === 'night' ? 'night' : 'day'}_notext.gif`;
			$('.page_pattern_holder').addClass(`${season} y${year}`).toggleClass('night', this.timeofday === 'night');
		} else {
			strBackgroundDesktop = `./summersale2023/home_header_bg_${this.timeofday === 'night' ? 'night' : 'day'}_notext.gif`;
			$('.page_pattern_holder').toggleClass('night', this.timeofday === 'night');
		}
		$('.page_background_holder').css('background-image', `url(${strBackgroundDesktop})`);
	}

	intervals() {
		setInterval(() => this.updateDateTime(), 1000);
		setInterval(() => this.updateWeather(), 3600000);
		setInterval(() => this.updateBG(this.season, this.year), 3600000);
	}

	init() {
		this.updateDateTime();
		this.updateWeather();
		this.updateBG(this.season, this.year);
		this.intervals();
	}
}

const steamBG = new SteamBG();
steamBG.init();