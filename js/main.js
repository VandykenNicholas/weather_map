"use strict";

let startingZoom = 3;
const myToken = mapboxToken;
mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/navigation-night-v1', // style URL
	center: [-97.4574899293861, 39.289328773319056], // starting position [lng, lat]
	zoom: startingZoom, // starting zoom
	projection: 'globe' // display the map as a 3D globe
});
map.on('style.load', () => {
	map.setFog({}); // Set the default atmosphere style
});

let markersArry = [];

let currentMarker = {};

function getCenter() {
	let center = map.getCenter();
	geocode(center, myToken).then(function () {
		let marker = new mapboxgl.Marker()
			.setLngLat(center)
			.addTo(map)
		currentMarker = marker;
		markersArry.push(marker);
	});
	return center;
}

$(`#PlaceCenter`).click(function () {
	
	getWeather(getCenter());
	getArea(getCenter());
})

$(`#zoomOut`).click(function () {
	map.setZoom(startingZoom -= 1);
});
$(`#zoomIn`).click(function () {
	map.setZoom(startingZoom += 1);
});
$(`#submit`).click(function () {
	let input = $(`#textInput`).val();
	geocode(input, myToken).then(function (result) {
		map.jumpTo({center: result});
		map.setZoom(17);
	});
});
$(`#markerRemove`).click(function () {
		markersArry.forEach(function (index) {
			index.remove();
			markersArry = [];
			$("#weatherInput").replaceWith(`<div class="container" id="weatherInput"></div>`);
			rorCount = 0;
		});
	}
);
$(document).keyup(function (event) {
	if (event.keyCode === 13) {
		let input = $(`#textInput`).val();
		geocode(input, myToken).then(function (result) {
			map.jumpTo({center: result});
			map.setZoom(17);
		});
	}
});

let rorCount = 0;

function getArea(center) {
	$.get("http://api.openweathermap.org/geo/1.0/reverse?", {
		APPID: weatherMapKey,
		lat: center.lat,
		lon: center.lng,
	}).done(function (data) {
		$(`#weatherInput`).append(`<div class=" row text-center text-wrap  m-1 p-1 justify-content-center " style="font-size: 30px"><div class="col-auto border bg-dark text-light rounded-pill ">${data[0].name}, ${data[0].state}</div></div><div class="row d-flex justify-content-around wrap-nowrap mt-2" id="${rorCount}"></div>`);
	})
	
}

function getWeather(center) {
	let weather = {};
	$.get("http://api.openweathermap.org/data/2.5/forecast?", {
		APPID: weatherMapKey,
		lat: center.lat,
		lon: center.lng,
		units: 'imperial'
	}).done(function (data) {
		let maxTemp = 0;
		let lowTemp = 0;
		let date = ``;
		let periodsOfRain = [];
		let mainWordCounter = [0, 0, 0, 0, 0, 0];
		let mainWordArr = [`Clear`, `Cloud`, `Snow`, `Rain`, `Drizzle`, `Thunderstorms`]
		let tempTime = ``;
		for (let i = 0; i < data.list.length; i++) {
			let temp = data.list[i].dt_txt.split(` `);
			let dateCompare = temp[0];
			if (i === 0) {
				date = dateCompare;
				maxTemp = data.list[i].main.temp_max;
				lowTemp = data.list[i].main.temp_min;
			}
			if (dateCompare !== date || i === (data.list.length - 1)) {
				
				weather.date = date.slice(5);
				weather.max = maxTemp;
				weather.low = lowTemp;
				weather.rainPeriods = periodsOfRain;
				const max = Math.max(...mainWordCounter);
				const index = mainWordCounter.indexOf(max);
				let word = mainWordArr[index];
				if (index === 0) {
					word = word + ` Sky's`;
				} else if (index === 1 || index === 3) {
					word = word + `y`
				}
				weather.main = word;
				if (weather.main === "Cloudy") {
					weather.main = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"25\" height=\"25\" fill=\"currentColor\" class=\"bi bi-cloud-sun-fill\" viewBox=\"0 0 16 16\">\n" +
						"  <path d=\"M11.473 11a4.5 4.5 0 0 0-8.72-.99A3 3 0 0 0 3 16h8.5a2.5 2.5 0 0 0 0-5h-.027z\"/>\n" +
						"  <path d=\"M10.5 1.5a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0v-1zm3.743 1.964a.5.5 0 1 0-.707-.707l-.708.707a.5.5 0 0 0 .708.708l.707-.708zm-7.779-.707a.5.5 0 0 0-.707.707l.707.708a.5.5 0 1 0 .708-.708l-.708-.707zm1.734 3.374a2 2 0 1 1 3.296 2.198c.199.281.372.582.516.898a3 3 0 1 0-4.84-3.225c.352.011.696.055 1.028.129zm4.484 4.074c.6.215 1.125.59 1.522 1.072a.5.5 0 0 0 .039-.742l-.707-.707a.5.5 0 0 0-.854.377zM14.5 6.5a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z\"/>\n" +
						"</svg>"
				}
				if (weather.main === "Clear Sky's") {
					weather.main = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-sun"
						viewBox="0 0 16 16">
							<path
					d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
						</svg>`
				}
				if (weather.main === "Snow") {
					weather.main = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-snow3" viewBox="0 0 16 16">
					  <path d="M8 7.5a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1z"/>
					  <path d="M8 16a.5.5 0 0 1-.5-.5v-1.293l-.646.647a.5.5 0 0 1-.707-.708L7.5 12.793v-1.51l-2.053-1.232-1.348.778-.495 1.85a.5.5 0 1 1-.966-.26l.237-.882-1.12.646a.5.5 0 0 1-.5-.866l1.12-.646-.883-.237a.5.5 0 1 1 .258-.966l1.85.495L5 9.155v-2.31l-1.4-.808-1.85.495a.5.5 0 1 1-.259-.966l.884-.237-1.12-.646a.5.5 0 0 1 .5-.866l1.12.646-.237-.883a.5.5 0 1 1 .966-.258l.495 1.849 1.348.778L7.5 4.717v-1.51L6.147 1.854a.5.5 0 1 1 .707-.708l.646.647V.5a.5.5 0 0 1 1 0v1.293l.647-.647a.5.5 0 1 1 .707.708L8.5 3.207v1.51l2.053 1.232 1.348-.778.495-1.85a.5.5 0 1 1 .966.26l-.236.882 1.12-.646a.5.5 0 0 1 .5.866l-1.12.646.883.237a.5.5 0 1 1-.26.966l-1.848-.495-1.4.808v2.31l1.4.808 1.849-.495a.5.5 0 1 1 .259.966l-.883.237 1.12.646a.5.5 0 0 1-.5.866l-1.12-.646.236.883a.5.5 0 1 1-.966.258l-.495-1.849-1.348-.778L8.5 11.283v1.51l1.354 1.353a.5.5 0 0 1-.707.708l-.647-.647V15.5a.5.5 0 0 1-.5.5zm2-6.783V6.783l-2-1.2-2 1.2v2.434l2 1.2 2-1.2z"/>
					</svg>`
				}
				if (weather.main === "Rainy") {
					weather.main = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
					\t\t\t\t     className="bi bi-cloud-rain" viewBox="0 0 16 16">
					\t\t\t\t\t<path
					\t\t\t\t\t\td="M4.158 12.025a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 0 1-.948-.316l1-3a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm3 0a.5.5 0 0 1 .316.633l-1 3a.5.5 0 1 1-.948-.316l1-3a.5.5 0 0 1 .632-.317zm.247-6.998a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 11H13a3 3 0 0 0 .405-5.973zM8.5 2a4 4 0 0 1 3.976 3.555.5.5 0 0 0 .5.445H13a2 2 0 0 1 0 4H3.5a2.5 2.5 0 1 1 .605-4.926.5.5 0 0 0 .596-.329A4.002 4.002 0 0 1 8.5 2z"/>
					\t\t\t\t</svg>`
				}
				if (weather.main === "Thunderstorms") {
					weather.main = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
					\t\t\t\t     className="bi bi-cloud-lightning-rain-fill" viewBox="0 0 16 16">
					\t\t\t\t\t<path
					\t\t\t\t\t\td="M2.658 11.026a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316zm9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316zm-7.5 1.5a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316zm9.5 0a.5.5 0 0 1 .316.632l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.316zm-7.105-1.25A.5.5 0 0 1 7.5 11h1a.5.5 0 0 1 .474.658l-.28.842H9.5a.5.5 0 0 1 .39.812l-2 2.5a.5.5 0 0 1-.875-.433L7.36 14H6.5a.5.5 0 0 1-.447-.724l1-2zm6.352-7.249a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 10H13a3 3 0 0 0 .405-5.973z"/>
					\t\t\t\t</svg>`
				}
				if (weather.main === "Drizzle") {
					weather.main = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
					\t\t\t\t     className="bi bi-cloud-drizzle-fill" viewBox="0 0 16 16">
					\t\t\t\t\t<path
					\t\t\t\t\t\td="M4.158 12.025a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm6 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm-3.5 1.5a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 0 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm6 0a.5.5 0 0 1 .316.633l-.5 1.5a.5.5 0 1 1-.948-.316l.5-1.5a.5.5 0 0 1 .632-.317zm.747-8.498a5.001 5.001 0 0 0-9.499-1.004A3.5 3.5 0 1 0 3.5 11H13a3 3 0 0 0 .405-5.973z"/>
					\t\t\t\t</svg>`
				}
				
				$(`#${rorCount}`).append(`<div class="col-auto g-1 shadow-lg rounded-top bg-secondary text-center text-light border border-light">
					<div class="row p-1 border-bottom border-dark m-0">
					<div>${weather.date}</div>
					</div>
					<div class="row p-1 border-bottom border-dark m-auto">
					<div>${weather.main}</div>
					</div>
					<div class="row p-1 border-bottom border-dark m-auto">
					<div><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-thermometer-high" viewBox="0 0 16 16">
					  <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V2.5a.5.5 0 0 1 1 0v8.585a1.5 1.5 0 0 1 1 1.415z"/>
					  <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1z"/>
					</svg>: ${weather.max}<span>&#176;</span></div>
					</div>
					<div class="row p-1 border-bottom  border-dark m-auto">
					<div><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-thermometer-snow" viewBox="0 0 16 16">
					  <path d="M5 12.5a1.5 1.5 0 1 1-2-1.415V9.5a.5.5 0 0 1 1 0v1.585A1.5 1.5 0 0 1 5 12.5z"/>
					  <path d="M1 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM3.5 1A1.5 1.5 0 0 0 2 2.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0L5 10.486V2.5A1.5 1.5 0 0 0 3.5 1zm5 1a.5.5 0 0 1 .5.5v1.293l.646-.647a.5.5 0 0 1 .708.708L9 5.207v1.927l1.669-.963.495-1.85a.5.5 0 1 1 .966.26l-.237.882 1.12-.646a.5.5 0 0 1 .5.866l-1.12.646.884.237a.5.5 0 1 1-.26.966l-1.848-.495L9.5 8l1.669.963 1.849-.495a.5.5 0 1 1 .258.966l-.883.237 1.12.646a.5.5 0 0 1-.5.866l-1.12-.646.237.883a.5.5 0 1 1-.966.258L10.67 9.83 9 8.866v1.927l1.354 1.353a.5.5 0 0 1-.708.708L9 12.207V13.5a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5z"/>
					</svg>: ${weather.low}<span>&#176;</span></div>
				</div>
			</div>`)
				
				weather = {};
				date = dateCompare;
				maxTemp = data.list[i].main.temp_max;
				lowTemp = data.list[i].main.temp_min;
				periodsOfRain = [];
				mainWordCounter = [0, 0, 0, 0, 0, 0];
			} else {
				if (data.list[i].main.temp_max > maxTemp) {
					maxTemp = data.list[i].main.temp_max;
				}
				if (data.list[i].main.temp_min < lowTemp) {
					lowTemp = data.list[i].main.temp_min;
				}
				if (data.list[i].weather[0].main.includes(`Rain`)) {
					tempTime = data.list[i].dt_txt.split(` `);
					periodsOfRain.push(tempTime[1]);
				}
			}
			if (data.list[i].weather[0].main.includes(mainWordArr[0])) {
				mainWordCounter[0]++;
			} else if (data.list[i].weather[0].main.includes(mainWordArr[1])) {
				mainWordCounter[1]++;
			} else if (data.list[i].weather[0].main.includes(mainWordArr[2])) {
				mainWordCounter[2]++;
			} else if (data.list[i].weather[0].main.includes(mainWordArr[3])) {
				mainWordCounter[3]++;
			} else if (data.list[i].weather[0].main.includes(mainWordArr[4])) {
				mainWordCounter[4]++;
			} else if (data.list[i].weather[0].main.includes(mainWordArr[5])) {
				mainWordCounter[5]++;
			}
		}
		$(`#weatherInput`).append(`<br>`)
		rorCount++;
	});
}