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
        center: {
            lat: 53.3438,
            lng: -6.2546
        },
        zoom: 10,
    });
}

function showStops() {
    $.getJSON("data/stops.json", function (stops) {
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


/* PREVIOUSLY IN INDEX.HTML*/

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