let startingZoom = 3;
mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v11', // style URL
	center: [-97.4574899293861, 39.289328773319056], // starting position [lng, lat]
	zoom: startingZoom, // starting zoom
	projection: 'globe' // display the map as a 3D globe
});
map.on('style.load', () => {
	map.setFog({}); // Set the default atmosphere style
});

const myToken = mapboxToken;

let markersArry =[];


let currentMarker = {};


function getCenter(){
	let center = map.getCenter();
	geocode(center,myToken).then(function() {
		let marker = new mapboxgl.Marker()
			.setLngLat(center)
			.addTo(map)
		currentMarker = marker;
		markersArry.push(marker);
	});
	return center;
}

$(`#PlaceCenter`).click(function(){
	
	getWeather(getCenter());
	getArea(getCenter());
})

$(`#zoomOut`).click(function(){
	map.setZoom(startingZoom -= 1);
});
$(`#zoomIn`).click(function(){
	map.setZoom(startingZoom += 1);
});
$(`#submit`).click(function(){
	let input = $(`#textInput`).val();
	geocode(input,myToken).then(function(result){
		map.jumpTo({center: result});
		map.setZoom(17);
	});
});
$(`#markerRemove`).click(function(){
		markersArry.forEach(function(index) {
			index.remove();
			markersArry = [];
			$( "#weatherInput" ).replaceWith( `<div class="container" id="weatherInput"></div>` );
			rorCount = 0;
		});
	}
);
$(document).keyup(function(event){
	if (event.keyCode === 13) {let input = $(`#textInput`).val();
		geocode(input,myToken).then(function(result){
			map.jumpTo({center: result});
			map.setZoom(17);
		});
	}});








let rorCount = 0;
function getArea(center){
	$.get("http://api.openweathermap.org/geo/1.0/reverse?", {
		APPID: weatherMapKey,
		lat: center.lat,
		lon: center.lng,
	}).done(function (data) {
		console.log(data);
		$(`#weatherInput`).append(`<div class=" row text-center text-wrap  m-1 p-1 justify-content-center " style="font-size: 30px"><div class="col-auto border bg-info ">${data[0].name}, ${data[0].state}</div></div><div class="row d-flex justify-content-around wrap-nowrap mt-2" id="${rorCount}"></div>`);
	})
	
}
function getWeather(center){
	let weather = {};
	$.get("http://api.openweathermap.org/data/2.5/forecast?", {
		APPID: weatherMapKey,
		lat:    center.lat,
		lon:    center.lng,
		units: 'imperial'
	}).done(function (data) {
		let maxTemp = 0;
		let lowTemp = 0;
		let date = ``;
		let periodsOfRain = [];
		let mainWordCounter = [0,0,0,0,0,0];
		let mainWordArr = [`Clear`,`Cloud`,`Snow`,`Rain`,`Drizzle`,`Thunderstorms`]
		let tempTime = ``;
		for (let i = 0; i < data.list.length; i++) {
			let temp = data.list[i].dt_txt.split(` `);
			let dateCompare = temp[0];
			if (i === 0) {
				date = dateCompare;
				maxTemp = data.list[i].main.temp_max;
				lowTemp = data.list[i].main.temp_min;
			}
			if (dateCompare !== date || i === (data.list.length-1) ) {
				
				weather.date = date.slice(5);
				weather.max = maxTemp;
				weather.low = lowTemp;
				weather.rainPeriods = periodsOfRain;
				const max = Math.max(...mainWordCounter);
				const index = mainWordCounter.indexOf(max);
				let word = mainWordArr[index];
				if (index === 0){
					word = word + ` Sky's`;
				}
				else if (index === 1 || index === 3){
					word = word + `y`
				}
				if (mainWordCounter[3] >= 2 && !mainWordArr[3] && !mainWordArr[4] && !mainWordArr[5]){
					weather.main = word + ` with periods of rain`;
				}
				else {
					weather.main = word;
				}
				
				$(`#${rorCount}`).append(`<div class="col-auto g-1 rounded-top bg-light text-center">
<div class="row p-1 border-bottom m-0">
<div>${weather.date}</div>
</div>
<div class="row p-1 border-bottom m-auto">
<div>H: ${weather.max}<span>&#176;</span></div>
</div>
<div class="row p-1 border-bottom m-auto">
<div>L: ${weather.low}<span>&#176;</span></div>
</div>
<div class="row p-1">
<div>${weather.main}</div>
</div>
</div>`)
				
				weather = {};
				date = dateCompare;
				maxTemp = data.list[i].main.temp_max;
				lowTemp = data.list[i].main.temp_min;
				periodsOfRain = [];
				mainWordCounter = [0,0,0,0,0,0];
			}
			else {
				if(data.list[i].main.temp_max > maxTemp){
					maxTemp = data.list[i].main.temp_max;
				}
				if(data.list[i].main.temp_min < lowTemp){
					lowTemp = data.list[i].main.temp_min;
				}
				if (data.list[i].weather[0].main.includes(`Rain`)){
					tempTime = data.list[i].dt_txt.split(` `);
					periodsOfRain.push(tempTime[1]);
				}
			}
			if (data.list[i].weather[0].main.includes(mainWordArr[0])){
				mainWordCounter[0] ++;
			}
			else if (data.list[i].weather[0].main.includes(mainWordArr[1])){
				mainWordCounter[1] ++;
			}
			else if (data.list[i].weather[0].main.includes(mainWordArr[2])){
				mainWordCounter[2] ++;
			}
			else if (data.list[i].weather[0].main.includes(mainWordArr[3])){
				mainWordCounter[3] ++;
			}
			else if (data.list[i].weather[0].main.includes(mainWordArr[4])){
				mainWordCounter[4] ++;
			}
			else if (data.list[i].weather[0].main.includes(mainWordArr[5])){
				mainWordCounter[5] ++;
			}
		}
		$(`#weatherInput`).append(`<br>`)
		rorCount++;
	});
}