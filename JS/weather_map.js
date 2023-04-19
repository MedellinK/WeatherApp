import {keys} from './keys.js'

// Immediately Invoked Function Expression

(function () {


    // Makes my map load on screen
    mapboxgl.accessToken = keys.mapbox;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/navigation-night-v1', "width": "50%", // style URL
        center: [-98.495141, 29.4246], // starting position [lng, lat]
        zoom: 10, // starting zoom
    });

    // function "prependLeadingZeroes" appends a "0" before the month number when n <= 9
    function prependLeadingZeroes(n) {
        if (n <= 9) {
            return "0" + n;
        }
        return n;
    }

    const civilianTime = (time) => {
        if (time >= 12) {
            return time - 12
        } else return time
    }

    // function "dateFromStamp" creates and return the current date
    function dateFromTimeStamp(timeStamp) {
        let dateTime = new Date(timeStamp * 1000);
        let year = dateTime.getFullYear();
        let month = prependLeadingZeroes(dateTime.getMonth() + 1); // function "appendedLeadingZeroes" is used to format month number in the date
        let day = dateTime.getDate();
        return `${month}/${day}/${year}`;
    }

    // Global variable that holds the days of the week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // Global variable that holds the days of the week but abbreviated
    const daysOfWeekAbbreviated = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // function "getWeather" creates the contents of the current weather column
    const getWeather = async (long, lat) => {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${keys.openweather}&units=imperial`);
            const data = await response.json();
            console.log(data);
            const time = new Date();
            const weatherDiv = document.querySelector("#weather");
            let sunrise = new Date(data.sys.sunrise * 1000)
            let sunriseMin = sunrise.getMinutes()
            // if (sunriseMin < 10){ sunriseMin = '0' + sunriseMin}
            sunriseMin = sunriseMin < 10 ? '0' + sunriseMin : sunriseMin
            let sunset = new Date(data.sys.sunset * 1000)
            let sunsetMin = sunset.getMinutes()
            // if (sunsetMin < 10) { sunsetMin = '0' + sunsetMin}
            sunsetMin = sunsetMin < 10 ? '0' + sunsetMin : sunsetMin
            weatherDiv.innerHTML = `
      <div class="row justify-center"><h1>${data.name}</h1></div>
      <br>
      <div class="row full-width" id="taco">
        <div class="column full-width">
            <div class="row no-gap justify-center full-width"><h3>${daysOfWeek[time.getDay()]}</h3></div>
            <div class="row no-gap justify-center full-width">${dateFromTimeStamp(data.dt)}</div>
        </div>   
      </div>
      <br>
      <div class="row justify-center"><h1>${Math.round(data.main.temp)}°</h1></div>
      <br>
      <div class="row justify-center"><h2 class="description">${data.weather[0].description}</h2></div>
      <div class="row justify-center">
        <div class="column justify-center shrink" id="weather-img">
            <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" class="forecast-img" alt="picture depicting the state of the weather.">
        </div> 
      </div>
      <div class="row ">High: ${Math.round(data.main.temp_max)}</div>
      <div class="row">Low: ${Math.round(data.main.temp_min)}</div>
      <div class="row">Humidity: ${Math.round(data.main.humidity)}</div>
      <div class="row">Sunrise is at ${sunrise.getHours()}:${sunriseMin} am</div>
      <div class="row">Sunset is at ${civilianTime(sunset.getHours())}:${sunsetMin} pm</div>
      <div class="row">Wind Speed: ${Math.round(data.wind.speed)} mph</div>
      <div class="row">Wind Direction: ${Math.round(data.wind.deg)}°</div>
      <div class="row">Feels Like: ${Math.round(data.main.feels_like)}°</div>
      <div class="row">Clouds: ${Math.round(data.clouds.all)}%</div>
      <div class="row">Country: ${data.sys.country}</div>
        
    `;
        } catch (error) {
            console.error(error);
        }
    };
    // function "getForecast" creates the contents of the forecast cards
    let getForecast = async (long, lat) => {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=imperial&APPID=${keys.openweather}`
        );
        const data = await response.json();
        console.log(data);
        let forecastHTML = "";
        data.list.forEach((forecast, index) => {
            if (index % 8 === 0 && index !== 0) {
                const time = new Date(forecast.dt * 1000);
                forecastHTML += `
        <div class="column align-center justify-center forecast-box">
          <div class="row no-gap day-header justify-center" id="abbr-Day">
            <div class="column justify-center shrink">
            <div class="row justify-center">${daysOfWeekAbbreviated[time.getDay()]}</div>
              <div class="row justify-center date-forecast">${dateFromTimeStamp(forecast.dt)}</div>
            </div>
            <div class="column justify-center shrink" id="forecast-img">
              <img src="https://openweathermap.org/img/w/${forecast.weather[0].icon}.png" class="forecast-img" alt="picture depicting the state of the weather.">
            </div>
          </div>
          <div class="row">Description: ${forecast.weather[0].description}</div>
          <div class="row">High: ${Math.round(forecast.main.temp_max)}</div>
          <div class="row ">Low: ${Math.round(forecast.main.temp_min)}</div>
            <div class="row">Humidity: ${Math.round(forecast.main.humidity)}</div>
          <div class="row" id="facts">.</div>
        </div>
      `;
            }
        });
        document.querySelector("#forecast").innerHTML = forecastHTML;
        return data;
    };
    let newMarker;
    document.querySelector("#setMarkerButton").addEventListener("click", async (event) => {
        event.preventDefault();
        if (newMarker) {
            newMarker.remove();
        }
       let userInput = document.querySelector("#setMarker").value
        let coords = await geocode(userInput, keys.mapbox);
        newMarker = new mapboxgl.Marker()
            .setLngLat(coords)
            .addTo(map);
        map.flyTo({
            center: coords,
            zoom: 8,
            speed: 1,
            curve: 2,
            easing(t) {
                return t;
            }
        });
        console.log(coords)
        await getWeather(coords[0], coords[1]);
        await getForecast(coords[0], coords[1]);
        let moveMarker = async function (e) {
            let coord = e.lngLat;
            newMarker.setLngLat(coord).addTo(map);
            await getWeather(coord.lng, coord.lat);
            await getForecast(coord.lng, coord.lat);
        };
        map.on('click', moveMarker.bind(map));
    });
    (async () => {
        await getWeather(-98.495141, 29.4246)
        await getForecast(-98.495141, 29.4246)
    })()
})();