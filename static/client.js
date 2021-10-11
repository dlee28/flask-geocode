const SearchForm = document.getElementById('search-form');
const SubmitButton = document.getElementById('submit-button');
const ResetButton = document.getElementById('reset-button');
const StreetInput = document.getElementById('street');
const CityInput = document.getElementById('city');
const StateInput = document.getElementById('state');
var  currentDiv = document.getElementById("current-div");
var futureDiv = document.getElementById("future-div");
var detailDiv = document.getElementById("detail-div");
let arrowDiv = document.getElementById("arrow-div");
let dataVisDiv = document.getElementById("data-vis-div");
let errorDiv = document.getElementById("error-div");
var weatherCode = {
    "0": ["Unknown"],
    "1000": ["Clear", "clear_day.svg"],
    "1001": ["Cloudy", "cloudy.svg"],
    "1100": ["Mostly Clear", "mostly_cloudy.svg"],
    "1101": ["Partly Cloudy", "partly_cloudy_day.svg"],
    "1102": ["Mostly Cloudy", "mostly_cloudy.svg"],
    "2000": ["Fog", "fog.svg"],
    "2100": ["Light Fog", "fog_light.svg"],
    "3000": ["Light Wind", "light_wind.svg"],
    "3001": ["Wind", "wind.svg"],
    "3002": ["Strong Wind", "strong_wing.svg"],
    "4000": ["Drizzle", "drizzle.svg"],
    "4001": ["Rain", "rain.svg"],
    "4200": ["Light Rain", "rain_light.svg"],
    "4201": ["Heavy Rain", "rain_heavy.svg"],
    "5000": ["Snow", "snow.svg"],
    "5001": ["Flurries", "flurries.svg"],
    "5100": ["Light Snow", "snow_light.svg"],
    "5101": ["Heavy Snow", "snow_heavy.svg"],
    "6000": ["Freezing Drizzle", "freezing_drizzle.svg"],
    "6001": ["Freezing Rain", "freezing_rain.svg"],
    "6200": ["Light Freezing Rain", "freezing_rain_light.svg"],
    "6201": ["Heavy Freezing Rain", "freezing_rain_heavy.svg"],
    "7000": ["Ice Pellets", "ice_pellets.svg"],
    "7101": ["Heavy Ice Pellets", "ice_pellets_heavy.svg"],
    "7102": ["Light Ice Pellets", "ice_pellets_light.svg"],
    "8000": ["Thunderstorm", "tstron.svg"]
};
var precipitationType = {
    "0":"N/A",
    "1":"Rain",
    "2":"Snow",
    "3":"Freezing Rain",
    "4":"Ice Pellets"
}

// SubmitButton.addEventListener('click', search, false);
// ResetButton.addEventListener('click', reset, false);

function search() {
    var street = StreetInput.value;
    var city = CityInput.value;
    var state = StateInput.value;

    searchByIp = document.getElementById('search-by-ip').checked;
    displayCurrentDiv(false);
    displayFutureDiv(false);
    displayDetailDiv(false);
    displayArrowDiv(false);
    displayErrorMessage(false);
    console.log(street, city, state);
    if (searchByIp) {
        console.log('searching by ip...');
        getWeatherDataIp("current");
        getWeatherDataIp("1d");
        getWeatherDataIp("1h");
    }
    else {
        if (checkValues(street, city, state)) {
            console.log('searching by text input...');
            address = street + ' ' + city + ' ' + state;
            console.log(address);
            getWeatherDataAddress(address, 'current');
            getWeatherDataAddress(address, '1d');
            getWeatherDataAddress(address, '1h');
        } else {
            console.log("one of input values is missing...")
        }
    }
}

function checkValues(street, city, state) {
    if (street == '' || city == '' || state =='') {
        return false
    } else {
        return true
    }
}

function getWeatherDataIp(timesteps) {
    if (timesteps === '1d'){
        request('/api/search/ip/' + timesteps, 'GET', createWeatherTableCard);
    } else if (timesteps === 'current') {
        request('/api/search/ip/' + timesteps, 'GET', createCurrentWeatherCard);
    }
    console.log('getWeatherDataIp finished...')
}

function getWeatherDataAddress(address, timesteps) {
    if (timesteps === '1d'){
        request('/api/search/address/' + address + '/' + timesteps, 'GET', createWeatherTableCard);
    } else if (timesteps === 'current') {
        request('/api/search/address/' + address + '/' + timesteps, 'GET', createCurrentWeatherCard);
    } else if (timesteps === '1h') {
        request('/api/search/address/' + address + '/' + timesteps, 'GET', createHourlyDataVis);
    }
    console.log('getWeatherDataAddress finished...')
}

function request(url, reqType, writeFunc) {
    const xmlReq = new XMLHttpRequest();
    xmlReq.open(reqType, url, true);
    xmlReq.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 404) {
            displayErrorMessage(true);
        }
        if (this.readyState === 4 && this.status === 500) {
            displayErrorMessage(true);
        }
        if (this.readyState === 4 && this.status === 200) {
            writeFunc(JSON.parse(this.responseText));
            // createWeatherTableCard(JSON.parse(this.responseText));
        }
    };
    xmlReq.send();
}

function createWeatherTableCard(weatherJson) {
    console.log(weatherJson);
    displayFutureDiv(false);
    futureDiv.innerHTML = "";

    var futureTable = document.createElement("table");
    futureTable.id = "future-table";

    // var colIds = ["col-date", "col-status", "col-temp-high", "col-temp-low", "col-windspeed"];
    var topRow = futureTable.insertRow(0);
    topRow.id = "head-row";
    var colDate = topRow.insertCell(0);
    colDate.id = "col-date";
    colDate.innerHTML = "Date";
    var colStatus = topRow.insertCell(1);
    colStatus.id = "col-status";
    colStatus.innerHTML = "Status";
    var colTempHigh = topRow.insertCell(2);
    colTempHigh.innerHTML = "Temp High";
    var colTempLow = topRow.insertCell(3);
    colTempLow.innerHTML = "Temp Low";
    var colWindSpeed = topRow.insertCell(4);
    colWindSpeed.innerHTML = "Wind Speed";
    
    var i = 1;
    for (let day in weatherJson) {
        // var day = "day" + String(i);
        // if (weatherJson.hasOwnProperty(day)) {
        console.log(day);
        var dayRow = futureTable.insertRow(i);
        dayRow.id = "weather-row"
        var colDate = dayRow.insertCell(0);
        colDate.id = "col-date";
        var lstDate = formatDate(weatherJson[day]["sunriseTime"]);
        // console.log(lstDate);
        colDate.innerHTML = lstDate[0] + ", " + lstDate[1] + " " + lstDate[2] + " " + lstDate[3];
        
        var colStatus = dayRow.insertCell(1);
        colStatus.id = "col-status";
        var statusImg = document.createElement("img");
        statusImg.id = "weather-symbol-img";
        statusImg.src = "/static/Images/Weather Symbols for Weather Codes/" + weatherCode[weatherJson[day]["weatherCode"]][1];
        var statusDesc = document.createElement("p");
        statusDesc.id = "weather-symbol-description";
        statusDesc.textContent = weatherCode[weatherJson[day]["weatherCode"]][0]
        colStatus.appendChild(statusImg);
        colStatus.appendChild(statusDesc);
        
        var colTempHigh = dayRow.insertCell(2);
        colTempHigh.innerHTML = weatherJson[day]["temperatureMax"];

        var colTempLow = dayRow.insertCell(3);
        colTempLow.innerHTML = weatherJson[day]["temperatureMin"];

        var colWindSpeed = dayRow.insertCell(4);
        colWindSpeed.innerHTML = weatherJson[day]["windSpeed"];
        // console.log(weatherJson[day]);
        
        dayRow.onclick = function() {
            createFutureDateCard(weatherJson[day]);
            createArrowDiv();
            createDataVis(weatherJson);
        }
        dayRow.href = "#detail-div";

        i++;
    }
    futureDiv.appendChild(futureTable);
        
    displayFutureDiv(true);
}

function createArrowDiv() {
    console.log("creating arrow-div...");
    displayArrowDiv(false);
    arrowDiv.innerHTML = "";

    let heading = document.createElement("h1");
    heading.id = "charts-header";
    heading.textContent = "Weather Charts";
    arrowDiv.appendChild(heading);

    let linkImageDiv = document.createElement("div");
    linkImageDiv.id = "link-image";
    linkImageDiv.onclick = changeArrowPicture;
    linkImageDiv.name = "data-vis";
    let arrowLink = document.createElement("a");
    arrowLink.href = "#arrow-down-up";
    arrowLink.id = "arrow-link";
    let arrowImage = document.createElement("img");
    arrowImage.src = "/static/Images/point-down-512.png";
    arrowImage.alt = "arrow";
    arrowImage.id = "arrow-down-up";

    arrowLink.appendChild(arrowImage);
    linkImageDiv.appendChild(arrowLink);
    arrowDiv.appendChild(linkImageDiv)

    displayArrowDiv(true);
    console.log("done arrow-div...");
}

function changeArrowPicture() {
    console.log("changeArrowPicture called...");
    if (document.getElementById("arrow-down-up").src.includes("point-down-512.png")) {
        document.getElementById("arrow-down-up").src = "/static/Images/point-up-512.png";
        document.getElementById("arrow-link").href = "#arrow-down-up";
        displayDataVisDiv(true);
        console.log("image should be changed");
    } else {
        document.getElementById("arrow-down-up").src = "/static/Images/point-down-512.png";
        document.getElementById("arrow-link").href = "#detail-div";
        displayDataVisDiv(false);
    }
}

function createFutureDateCard(dayDetail) {
    console.log("creating createFutureDateCard...");
    console.log(dayDetail);
    displayFutureDiv(false);
    displayCurrentDiv(false);
    displayDetailDiv(false);
    detailDiv.innerHTML = "";

    var heading = document.createElement("h1");
    heading.id = "deatail-header";
    heading.textContent = "Daily Weather Details";
    detailDiv.appendChild(heading);

    var detailCard = document.createElement("div");
    detailCard.id = "detail-card";

    var dayWeatherTemp = document.createElement("div");
    dayWeatherTemp.id = "day-weather-temp";
    var infoText = document.createElement("p");
    infoText.id = "detail-info-text";
    var lstDate = formatDate(dayDetail["sunriseTime"]);
    infoText.textContent = lstDate[0] + ", " + lstDate[1] + " " + lstDate[2] + " " + lstDate[3];
    dayWeatherTemp.appendChild(infoText);
    var weatherText = document.createElement("p");
    weatherText.id = "detail-info-text";
    weatherText.textContent = weatherCode[dayDetail["weatherCode"]][0];
    dayWeatherTemp.appendChild(weatherText);
    var tempHighLowText = document.createElement("p");
    tempHighLowText.id = "temp-high-low-text";
    tempHighLowText.innerHTML = dayDetail["temperatureMin"] + "&deg;F/" + dayDetail["temperatureMax"] + "&deg;F";
    dayWeatherTemp.appendChild(tempHighLowText);
    detailCard.appendChild(dayWeatherTemp);

    var alignImage = document.createElement("div");
    alignImage.id = "align-image";
    var detailWeatherSymbol = document.createElement("img");
    detailWeatherSymbol.id = "detail-weather-symbol";
    detailWeatherSymbol.src = "/static/Images/Weather Symbols for Weather Codes/" + weatherCode[dayDetail["weatherCode"]][1];
    alignImage.appendChild(detailWeatherSymbol);
    detailCard.appendChild(alignImage);

    var bottomInfo = document.createElement("div");
    bottomInfo.id = "bottom-info";
    var precip = document.createElement("p");
    precip.innerHTML = "Precipitation: <b>" + precipitationType[dayDetail["precipitationType"]] + "</b>";
    bottomInfo.appendChild(precip);
    var chaceRain = document.createElement("p");
    chaceRain.innerHTML = "Chance of Rain: <b>" + dayDetail["precipitationProbability"] + "%</b>";
    bottomInfo.appendChild(chaceRain);
    var windSpeed = document.createElement("p");
    windSpeed.innerHTML = "Wind Speed: <b>" + dayDetail["windSpeed"] + " mph</b>";
    bottomInfo.appendChild(windSpeed);
    var humidity = document.createElement("p");
    humidity.innerHTML = "Humidity: <b>" + dayDetail["humidity"] + "%</b>";
    bottomInfo.appendChild(humidity);
    var visibility = document.createElement("p");
    visibility.innerHTML = "Visibility: <b>" + dayDetail["visibility"] + " mi</b>"
    bottomInfo.appendChild(visibility);
    var sunRiseSet = document.createElement("p");
    risesetFormatted = formatSunsetSunrise(dayDetail["sunriseTime"], dayDetail["sunsetTime"]);
    sunRiseSet.innerHTML = "Sunrise/Sunset: <b>" + risesetFormatted  + "</b>";
    bottomInfo.appendChild(sunRiseSet);
    detailCard.appendChild(bottomInfo);

    detailDiv.appendChild(detailCard);
    displayDetailDiv(true);
}

function formatSunsetSunrise (sunRise, sunSet) {
    // console.log(sunRise);
    // console.log(sunSet);
    var rise = new Date(sunRise).getHours();
    var set = new Date(sunSet).getHours();
    var riseMorningNight = "AM";
    var setMorningNight = "AM";
    // console.log(rise.getHours());
    // console.log(set.getHours());
    if (rise > 12) {
        rise = rise % 12;
        riseMorningNight = "PM";
    }
    if (set > 12) {
        set = set % 12;
        setMorningNight = "PM";
    }
    
    return String(rise) + riseMorningNight + "/" + String(set) + setMorningNight

}

function formatDate(date) {
    // const regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
    var day = new Date(date);
    optionDay = {weekday:"long"};
    optionMonth = {month:"short"};
    optionDate = {day:"2-digit"};
    optionYr = {year:"numeric"};
    // console.log(day);
    // console.log(new Intl.DateTimeFormat("en-US", optionYr).format(day));
    // console.log(new Intl.DateTimeFormat("en-US", optionMonth).format(day));
    // console.log(new Intl.DateTimeFormat("en-US", optionDate).format(day));
    // console.log(new Intl.DateTimeFormat("en-US", optionDay).format(day));
    var yr = new Intl.DateTimeFormat("en-US", optionYr).format(day);
    var mon = new Intl.DateTimeFormat("en-US", optionMonth).format(day);
    var date = new Intl.DateTimeFormat("en-US", optionDate).format(day);
    var strDay = new Intl.DateTimeFormat("en-US", optionDay).format(day);
    return [strDay, date, mon, yr]
}

function createCurrentWeatherCard(currentJson) {
    console.log('createCurrentWeatherCard starting...');
    displayCurrentDiv(false);
    currentDiv.innerHTML = "";
    // creating header
    var locationHeader = document.createElement("h2");
    locationHeader.id = "location-header";
    locationHeader.textContent = currentJson["formatted_address"];
    currentDiv.appendChild(locationHeader);

    // adding div picture-temp
    var pictureTempDiv = document.createElement("div");
    pictureTempDiv.id = "picture-temp";
    var weatherCodeImg = document.createElement("img");
    weatherCodeImg.id = "weather-img";
    descriptionImagePath = weatherCode[currentJson["weatherCode"]];
    weatherCodeImg.src = "static/Images/Weather Symbols for Weather Codes/" + descriptionImagePath[1];
    var degreeNumP = document.createElement("p");
    degreeNumP.id = "degree-num";
    degreeNumP.innerHTML = currentJson["temperature"] + "&deg";
    pictureTempDiv.appendChild(weatherCodeImg);
    pictureTempDiv.appendChild(degreeNumP);
    currentDiv.appendChild(pictureTempDiv);

    // adding weather-description
    var weatherDescriptionP = document.createElement("p");
    weatherDescriptionP.id = "weather-description";
    weatherDescriptionP.textContent = descriptionImagePath[0];
    currentDiv.appendChild(weatherDescriptionP);

    // adding break
    var br = document.createElement("br");
    currentDiv.appendChild(br);

    // adding table
    var description = ["Humidity", "Pressure", "Wind Speed", "Visbility", "Cloud Cover", "UV Level"]
    var currentTable = document.createElement("table");
    currentTable.id = "current-table";
    var descriptionRow = currentTable.insertRow(0);
    for (let i = 0; i < description.length; i++) {
        descriptionRow.insertCell(i).innerHTML = description[i];
        // console.log(description[i]);
    }
    var pictureRow = currentTable.insertRow(1);
    pictureRow.insertCell(0).innerHTML = "<img src=\"static/Images/humidity.png\" alt=\"humidity\" id=\"weather-description-img\">";
    pictureRow.insertCell(1).innerHTML = "<img src=\"static/Images/Pressure.png\" alt=\"Pressure\" id=\"weather-description-img\">";
    pictureRow.insertCell(2).innerHTML = "<img src=\"static/Images/Wind_Speed.png\" alt=\"Wind_Speed\" id=\"weather-description-img\">";
    pictureRow.insertCell(3).innerHTML = "<img src=\"static/Images/Visibility.png\" alt=\"Visibility\" id=\"weather-description-img\">";
    pictureRow.insertCell(4).innerHTML = "<img src=\"static/Images/Cloud_Cover.png\" alt=\"Cloud_Cover\" id=\"weather-description-img\">"; 
    pictureRow.insertCell(5).innerHTML = "<img src=\"static/Images/UV_Level.png\" alt=\"UV_Level\" id=\"weather-description-img\">";

    description = ["humidity", "pressureSeaLevel", "windSpeed", "visibility", "cloudCover", "uvIndex"];
    var valueRow = currentTable.insertRow(2);
    valueRow.insertCell(0).innerHTML = currentJson[description[0]] + "%";
    valueRow.insertCell(1).innerHTML = currentJson[description[1]] + "inHg";
    valueRow.insertCell(2).innerHTML = currentJson[description[2]] + "mph";
    valueRow.insertCell(3).innerHTML = currentJson[description[3]] + "mi";
    valueRow.insertCell(4).innerHTML = currentJson[description[4]] + "%";
    valueRow.insertCell(5).innerHTML = currentJson[description[5]]

    currentDiv.appendChild(currentTable);

    displayCurrentDiv(true);

    console.log("createCurrentWeatherCard finished...");
}

function createDataVis(weatherJson) {
    console.log("createDataVis called...");
    console.log(weatherJson);
    displayDataVisDiv(false);

    let data = createDataHighLowVis(weatherJson);

    Highcharts.chart('high-low-graph', {

        chart: {
          type: 'arearange',
          zoomType: 'x',
          scrollablePlotArea: {
            minWidth: 600,
            scrollPositionX: 1
          }
        },
  
        title: {
          text: 'Temperature Ranges (Min, Max)'
        },
  
        xAxis: {
          type: 'datetime',
          accessibility: {
            rangeDescription: 'Range: Current date to next 15 days'
          }
        },
  
        yAxis: {
          title: {
            text: null
          }
        },
  
        tooltip: {
          crosshairs: true,
          shared: true,
          valueSuffix: '°F',
          xDateFormat: '%A, %b %e'
        },
  
        legend: {
          enabled: false
        },
  
        series: [{
          name: 'Temperatures',
          fillColor: {
            linearGradient: [0, 0, 0, 300],
            stops: [
                [0, Highcharts.getOptions().colors[3]],
                [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(.3).get('rgba')]
            ]
          },
          data: data,
            marker: {
            fillColor: Highcharts.getOptions().colors[0],
            lineWidth: 2,
            lineColor: Highcharts.getOptions().colors[0]
        },
        color: Highcharts.getOptions().colors[3]
        }]
  
      });

      console.log("createDataVis finshed...");
}

function createHourlyDataVis(hourJson) {
    console.log("createHourlyDataVis starting ... ");
    console.log(hourJson);
    let humidity = [];
    let winds = [];
    let temperatures = [];
    let pressures = [];

    for (let hourData in hourJson["hourInfo"]) {
        // var current = hourJson[hourData];
        let fromIdx = hourJson["hourInfo"][hourData]["startTimeIndex"];
        let toIdx = hourJson["hours"].length - 1
        if (fromIdx < hourJson["hours"].length - 1) {
            toIdx = fromIdx + 1
        }
        var from = Date.parse(hourJson["hours"][fromIdx]);
        var to = Date.parse(hourJson["hours"][toIdx]);

        temperatures.push({
            x: from,
            y: parseInt(hourJson["hourInfo"][hourData]["temperature"], 10),
            to: to
        });

        humidity.push({
            x: from,
            y: parseInt(hourJson["hourInfo"][hourData]["humidity"]),
        });

        if (fromIdx % 2 ===0) {
            winds.push({
                x: from,
                value: parseFloat(hourJson["hourInfo"][hourData]["windSpeed"]),
                direction: parseFloat(hourJson["hourInfo"][hourData]["windDirection"])
            });
        }

        pressures.push({
            x: from,
            y: parseInt(hourJson["hourInfo"][hourData]["pressureSeaLevel"])
        })
    }

    Highcharts.chart('hourly-graph', {
        chart: {
            renderTo: 'hourly-graph',
            marginBottom: 70,
            marginRight: 40,
            marginTop: 50,
            plotBorderWidth: 1,
            height: 310,
            alignTicks: false,
            scrollablePlotArea: {
                minWidth: 720
            }
        },

        defs: {
            patterns: [{
                id: 'precipitation-error',
                path: {
                    d: [
                        'M', 3.3, 0, 'L', -6.7, 10,
                        'M', 6.7, 0, 'L', -3.3, 10,
                        'M', 10, 0, 'L', 0, 10,
                        'M', 13.3, 0, 'L', 3.3, 10,
                        'M', 16.7, 0, 'L', 6.7, 10
                    ].join(' '),
                    stroke: '#68CFE8',
                    strokeWidth: 1
                }
            }]
        },

        title: {
            text: "Hourly Weather (For Next 5 Days)",
            align: 'center',
            style: {
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
            }
        },

        credits: {
            text: 'Forecast',
            position: {
                x: -40
            }
        },

        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat:
                '<small>{point.x:%A, %b %e, %H:%M}</small><br>'
        },

        xAxis: [{ // Bottom X axis
            type: 'datetime',
            tickInterval: 2 * 36e5, // two hours
            minorTickInterval: 36e5, // one hour
            tickLength: 0,
            gridLineWidth: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
            startOnTick: false,
            endOnTick: false,
            minPadding: 0,
            maxPadding: 0,
            offset: 30,
            showLastLabel: true,
            labels: {
                format: '{value:%H}'
            },
            crosshair: true
        }, { // Top X axis
            linkedTo: 0,
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                format: '{value:<span style="font-size: 12px; font-weight: bold">%a</span> %b %e}',
                align: 'left',
                x: 3,
                y: -5
            },
            opposite: true,
            tickLength: 20,
            gridLineWidth: 1
        }],

        yAxis: [{ // temperature axis
            title: {
                text: null
            },
            labels: {
                format: '{value}°',
                style: {
                    fontSize: '10px'
                },
                x: -3
            },
            plotLines: [{ // zero plane
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2
            }],
            maxPadding: 0.3,
            minRange: 8,
            tickInterval: 1,
            gridLineColor: 'rgba(128, 128, 128, 0.1)'

        }, { // precipitation axis
            title: {
                text: null
            },
            labels: {
                enabled: false
            },
            gridLineWidth: 0,
            tickLength: 0,
            minRange: 10,
            min: 0

        }, { // Air pressure
            allowDecimals: false,
            title: { // Title on top of axis
                text: 'inHg',
                offset: 0,
                align: 'high',
                rotation: 0,
                style: {
                    fontSize: '10px',
                    color: Highcharts.getOptions().colors[3]
                },
                textAlign: 'left',
                x: 3
            },
            labels: {
                style: {
                    fontSize: '8px',
                    color: Highcharts.getOptions().colors[3]
                },
                y: 2,
                x: 3
            },
            gridLineWidth: 0,
            opposite: true,
            showLastLabel: false
        }],

        legend: {
            enabled: false
        },

        plotOptions: {
            series: {
                pointPlacement: 'between'
            }
        },


        series: [{
            name: 'Temperature',
            data: temperatures,
            type: 'spline',
            marker: {
                enabled: false,
                states: {
                    hover: {
                        enabled: true
                    }
                }
            },
            tooltip: {
                valueSuffix: ' °F'
            },
            zIndex: 1,
            color: '#FF3333',
            negativeColor: '#FF3333'
        }, 
        {
            name: 'Humidity',
            data: humidity,
            type: 'column',
            color: '#48AFE8',
            yAxis: 1,
            groupPadding: 0,
            pointPadding: 0,
            grouping: false,
            dataLabels: {
                formatter: function () {
                    if (this.y > 0) {
                        return this.y;
                    }
                },
                style: {
                    fontSize: '8px',
                    color: 'gray'
                }
            },
            tooltip: {
                valueSuffix: ' %'
            }
        }, {
            name: 'Air pressure',
            color: Highcharts.getOptions().colors[3],
            data: pressures,
            marker: {
                enabled: false
            },
            shadow: false,
            tooltip: {
                valueSuffix: ' inHg'
            },
            dashStyle: 'shortdot',
            yAxis: 2
        }, {
            name: 'Wind',
            type: 'windbarb',
            id: 'windbarbs',
            color: Highcharts.getOptions().colors[1],
            lineWidth: 1.5,
            data: winds,
            vectorLength: 18,
            yOffset: -15,
            tooltip: {
                valueSuffix: ' mph'
            }
        }]
    });

    console.log(temperatures);
    console.log("createHourlyDataVis ending... ");
}


function createDataHighLowVis(weatherJson) {
    const regex = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
    let ans = [];
    for (let day in weatherJson) {
        var forUTC = weatherJson[day]["sunriseTime"].match(regex)[0].split("-");
        var low = weatherJson[day]["temperatureMin"];
        var high = weatherJson[day]["temperatureMax"];
        console.log(typeof(high));
        ans.push([Date.UTC(parseInt(forUTC[0]),parseInt(forUTC[1])-1,parseInt(forUTC[2])), low, high]);
    }
    return ans
}

function displayDataVisDiv (isDisplay) {
    if (isDisplay) {
        dataVisDiv.style.display = "block";
    } else {
        dataVisDiv.style.display = "none";
    }
}
function displayArrowDiv (isDisplay) {
    if (isDisplay) {
        arrowDiv.style.display = "block";
    } else {
        arrowDiv.style.display = "none";
    }
}

function displayDetailDiv (isDisplay) {
    if (isDisplay) {
        detailDiv.style.display = "block";
    } else {
        detailDiv.style.display = "none";
    }
}

function displayFutureDiv (isDisplay) {
    if (isDisplay) {
        futureDiv.style.display = "block";
    } else {
        futureDiv.style.display = "none";
    }
}

function displayCurrentDiv(isDisplay) {
    if (isDisplay) {
        currentDiv.style.display = "block";
    } else {
        currentDiv.style.display = "none";
    }
}

function displayErrorMessage(isDisplay) {
    if (isDisplay) {
        errorDiv.style.display = "block";
    } else {
        errorDiv.style.display = "none";
    }
}

function resetForm() {
    StateInput.value = '';
    StreetInput.value = '';
    CityInput.value = '';
    StateInput.disabled = false;
    StreetInput.disabled = false;
    CityInput.disabled = false;
    document.getElementById('search-by-ip').checked = false;
    displayCurrentDiv(false);
    displayFutureDiv(false);
    displayDetailDiv(false);
    displayArrowDiv(false);
    displayDataVisDiv(false);
    displayErrorMessage(false);
}

function disableText() {
    checkBox = document.getElementById('search-by-ip').checked;
    if (checkBox) {
        StateInput.disabled = true;
        StateInput.value = '';
        StreetInput.disabled = true;
        StreetInput.value = '';
        CityInput.disabled = true;
        CityInput.value = '';
    }
    else {
        StateInput.disabled = false;
        StreetInput.disabled = false;
        CityInput.disabled = false;
        console.log('text should be required');
    }
}