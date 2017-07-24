// Do these fuctions trigger on the same event?
window.onload = function () {
    pop_origin_stops();
    get_weather();
};
$(document).ready(function () {
    $('#origin').select2();
    $('#dest').select2();
});


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 53.3438, lng: -6.2546 },
        zoom: 10
    });
}

function showStops() {
    $.getJSON("data/stops.json", function (data) {
        var stops = data;
        var j = Object.keys(stops).length;
        console.log(j);
        for (var i = 0; i <= j; i++) {
            var marker = new google.maps.Marker({
                position: {
                    lat: stops[i]["stop_lat"],
                    lng: stops[i]["stop_lon"]
                },
                map: map,
                title: stops[i]["stop_name"],
                stop_number: stops[i]["stop_id"]
            });
        }
    });
}


function route7Markers() {
    var route7Stops = ['3219', '2040', '2041', '3220', '2043', '2044', '2045', '2045', '2046', '6082', '3205', '3206', '3207', '3208', '3209', '3210', '4981', '3211', '3212', '3213', '3214', '3215', '3216', '3217', '3218', '3219', '3220', '3221', '4982'];

    var route7Arr = [];

    $.getJSON("data/stops.json", function (data) {
        var stops = data;
        console.log("yo!");
        for (var i = 0; i < route7Stops.length; i++) {
            console.log("in the first loop");
            var stop_id = route7Stops[i];
            for (var j = 0; j < Object.keys(stops).length; j++) {
                console.log("in the second loop");
                if (stops[j].stop_id.endsWith(stop_id)) {
                    console.log("in the if");
                    route7Arr.push(stops[i]);
                };
            };
        };

        console.log(route7Arr);

        for (var i = 0; i < route7Arr.length; i++) {
            console.log("in the third loop");
            var marker = new google.maps.Marker({
                position: {
                    lat: route7Arr[i]["stop_lat"],
                    lng: route7Arr[i]["stop_lon"]
                },
                map: map,
                title: route7Arr[i]["stop_name"],
                stop_number: route7Arr[i]["stop_id"]
            });
        };
    });
}


/* PREVIOUSLY IN INDEX.HTML*/

function pop_origin_stops() {
    var origin_drop = $('#origin');
    $.getJSON("http://127.0.0.1:5000/stops", function (data) {
        if ('stops' in data) {
            var stops = data.stops;
            console.log('stops', stops);
            _.forEach(stops, function (data) {
                origin_drop.append($('<option>', {
                    value: data.stop_id,
                    text: data.stop_address + " - Stop No: " + data.stop_id
                }, '</option>'));
            })
        }
    })
}

function pop_destination_stops(origin_id) {
    var destination_drop = $('#dest');
    $.getJSON("http://127.0.0.1:5000/destination_stops/" + origin_id, function (data) {
        if ('stops' in data) {
            var stops = data.stops;
            console.log('stops', stops);
            _.forEach(stops, function (data) {
                destination_drop.append($('<option>', {
                    value: data.stop_id,
                    text: data.stop_address + " - Stop No: " + data.stop_id
                }, '</option>'));
            })
        }
    })
}

function pop_routes(origin_id, destination_id) {
    var routes_drop = $('#route');
    $.getJSON("http://127.0.0.1:5000/possible_routes/" + origin_id + "/" + destination_id, function (data) {
        if ('routes' in data) {
            var routes = data.routes;
            console.log('routes', routes);
            _.forEach(routes, function (data) {
                routes_drop.append($('<option>', {
                    value: data.journey_pattern,
                    text: data.journey_pattern
                }, '</option>'));
            })
        }
    })
}

function demo_model(origin_id, destination_id) {
    var time_p = $('#predicted_time_p');
    $.getJSON("http://127.0.0.1:5000/predict_time/" + origin_id + "/" + destination_id, function (data) {
        if ('time' in data) {
            var time = data.time;
            console.log('time', time[0]);
            time_p.append(
                Math.ceil(time[0] / 60) + " minutes"
            )
        }
    });
}


function remove_options(id, which) {
    var list = document.getElementById(id);
    for (var i = list.length - 1; i >= 0; i--) {
        list.remove(i);
    }
    var option = document.createElement("option");
    if (id === 'dest') {
        option.text = 'Select a destination';
    }
    else {
        option.text = "Select a " + id;
    }
    option.disabled = false;
    list.add(option);
    if (which === 'origin') {
        pop_destination_stops($("#origin").val());
    }
    else if (which === 'dest') {
        pop_routes($("#origin").val(), $("#dest").val());
    }
}

$("#origin").change(function () {
    remove_options('dest', 'origin');
    remove_options('route', 'ignore');
});

$("#dest").change(function () {
    remove_options('route', 'dest');
});

function get_weather() {
    var xmlhttp = new XMLHttpRequest();
    var url = "http://api.openweathermap.org/data/2.5/forecast?id=7778677&APPID=4cd167bc85dff937818ea9a5eb6fa550&units=metric";

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var weather_json = JSON.parse(xmlhttp.responseText);
            apply_weather(weather_json);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function apply_weather(data) {
    weather_list = data.list;
    console.log('list', weather_list);
}



//    function predictTime(route, origin, dest, day, time) {
//    predictedTravelTime = "Predictions Coming Soon!";
//}

function travelTime() {
    //    var results = document.getElementById("preferences");
    var route = document.getElementById("route").value;
    var origin = document.getElementById("origin").value;
    var dest = document.getElementById("dest").value;
    var date_time = document.getElementById('date_time_selector').value;
    var date_split = date_time.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/);
    var timestamp = (new Date(date_split[1], date_split[2], date_split[3], date_split[4], date_split[5], '00').getTime() / 1000) - 2664000;
    var day = date_time.slice(0, 10);
    var time = date_time.slice(11);
    var weather_at_time = weather_list[0];
    for (var x = 1; x < weather_list.length; x++) {
        if (Math.abs(parseInt(weather_list[x]['dt']) - parseInt(timestamp)) < Math.abs(parseInt(weather_at_time['dt']) - parseInt(timestamp))) {
            weather_at_time = weather_list[x];
        }
    }
    //    console.log("Weather at time:", weather_at_time);
    //    console.log(route, origin, dest, day, time);

    var weather_img = 'images/weather_example.png';
    var i, out = "";
    out += "<div class='row'><div class='col-md-4'><h4>Predicted Weather at " + date_time + "</h4><p>Temperature: " + weather_at_time['main']['temp'] + "&#8451<p>Description: " + weather_at_time['weather'][0]['main'] + "</p><img src = \"http://openweathermap.org/img/w/" + weather_at_time['weather'][0]['icon'] + ".png\"</img>" + "</div><div class='col-md-4'><h4>Estimated Travel Time</h4><p id='predicted_time_p'></p></div><div class='col-md-4'><h4>Advanced Preferences</h4><div class='radio'><label><input type='radio' name='optradio'>Fastest Route</label></div><div class='radio'><label><input type='radio' name='optradio'>Fewest Changeovers</label></div><div class='radio'><label><input type='radio' name='optradio'>Cheapest Route</label></div></div></div></div>";
    document.getElementById("results").innerHTML = out;

    showRoute(origin, dest);
    demo_model(origin, dest);
}


function showRoute(origin, dest) {
    $.getJSON("data/stops.json", function (data) {
        var stops = data;
        for (var i = 0; i < Object.keys(stops).length; i++) {
            if (stops[i].stop_id.endsWith(origin)) {
                var originStop = stops[i];
                break; // short circuit for efficiency
            }
        }
        for (var i = 0; i < Object.keys(stops).length; i++) {
            if (stops[i].stop_id.endsWith(dest)) {
                var destStop = stops[i];
                break; // short circuit for efficiency
            }
        }
        // display origin and destination markers on map - 2017 stops
        var marker = new google.maps.Marker({
            position: {
                lat: originStop["stop_lat"],
                lng: originStop["stop_lon"]
            },
            map: map,
            title: originStop["stop_name"],
            stop_number: originStop["stop_id"]
        });
        var marker = new google.maps.Marker({
            position: {
                lat: destStop["stop_lat"],
                lng: destStop["stop_lon"]
            },
            map: map,
            title: destStop["stop_name"],
            stop_number: destStop["stop_id"]
        });
    });
}




//    function time_picker(){
//    var hour_list = document.getElementById('hour');
//    var minute_list = document.getElementById('minute');
//
//    for (var i = 0; i <= 24; i++){
//        hour_list.options[hour_list.options.length] = new Option(i, i);
//        }
//
//    for (var i = 0; i <= 55; i += 5){
//        minute_list.options[minute_list.options.length] = new Option(i, i);
//        }
//


// function showRoute(origin, dest) {
//     $.getJSON("data/stops.json", function(data) {
//         var stops = data;
//         for (var i = 0; i < Object.keys(stops).length; i++) {
//             if (stops[i].stop_id.endsWith(origin)) {
//                 var originStop = stops[i];
//                 break; // short circuit for efficiency
//             }
//         };
//         for (var i = 0; i < Object.keys(stops).length; i++) {
//             if (stops[i].stop_id.endsWith(dest)) {
//                 var destStop = stops[i];
//                 break; // short circuit for efficiency
//             }
//         };
//         // display origin and destination markers on map - 2017 stops
//         var marker = new google.maps.Marker({
//             position: {
//                 lat: originStop["stop_lat"],
//                 lng: originStop["stop_lon"]
//             },
//             map: map,
//             title: originStop["stop_name"],
//             stop_number: originStop["stop_id"]
//         });
//         var marker = new google.maps.Marker({
//             position: {
//                 lat: destStop["stop_lat"],
//                 lng: destStop["stop_lon"]
//             },
//             map: map,
//             title: destStop["stop_name"],
//             stop_number: destStop["stop_id"]
//         });
//
//     });
//
//
// }


//route7Markers();


// function predictTime(route, origin, dest, day, time) {
//     predictedTravelTime = "Predictions Coming Soon!";
// }
//
// function travelTime() {
//     var results = document.getElementById("preferences");
//     var route = document.getElementById("route").value;
//     var origin = document.getElementById("origin").value;
//     var dest = document.getElementById("dest").value;
//     var day = document.getElementById("day").value;
//     var time = document.getElementById("time").value;
//     console.log(route, origin, dest, day, time);
//
//     predictedTime = predictTime(route, origin, dest, day, time);
//
//     var weather_img = 'images/weather_example.png';
//     var i, out = "";
//     out += "<div class='row'><div class='col-md-4'><h4>Weather Goes Here</h4><p>Weather Glyphicon Example <span class='glyphicon glyphicon-cloud'></span></p><p>Example Weather ICons</p><img src='" + weather_img + "'></div><div class='col-md-4'><h4>Estimated Travel Time</h4><p>" + predictedTravelTime + "</p></div><div class='col-md-4'><h4>Advanced Preferences</h4><div class='radio'><label><input type='radio' name='optradio'>Fastest Route</label></div><div class='radio'><label><input type='radio' name='optradio'>Fewest Changeovers</label></div><div class='radio'><label><input type='radio' name='optradio'>Cheapest Route</label></div></div></div></div>";
//     document.getElementById("results").innerHTML = out;
//
//     showRoute(origin, dest);
// }