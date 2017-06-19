var map;
function initMap() {
    var myLatLng = {lat: 53.3438, lng: -6.2546};
    
    map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    zoom: 12
});
}

function showStops() {
    $.getJSON("/data/stops.json", function(data) {
        var stops = data;
        var j = Object.keys(stops).length;
        console.log(j);
        for (var i = 0; i<=j; i++) {
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

function showRoute(origin, dest) {
    $.getJSON("/data/stops.json", function(data) {
        var stops = data;
        for (var i = 0; i < Object.keys(stops).length; i++) {
            if (stops[i].stop_id.endsWith(origin)) {
                var originStop = stops[i];
                break;
            }
        };
        for (var i = 0; i < Object.keys(stops).length; i++) { 
            if (stops[i].stop_id.endsWith(dest)) {
                var destStop = stops[i];
                break;
            }
        };
        // display origin and destination markers on map
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


function predictTime(route, origin, dest, day, time) {
    predictedTravelTime = "Predictions Coming Soon!";
}

function travelTime() {
    var results = document.getElementById("preferences");
    var route = document.getElementById("route").value;
    var origin = document.getElementById("origin").value;
    var dest = document.getElementById("dest").value;
    var day = document.getElementById("day").value;
    var time = document.getElementById("time").value;
    console.log(route, origin, dest, day, time);
    
    predictedTime = predictTime(route, origin, dest, day, time);
    
    var weather_img = 'images/weather_example.png';
    var i, out = "";
    out += "<div class='row'><div class='col-md-4'><h4>Weather Goes Here</h4><p>Weather Glyphicon Example <span class='glyphicon glyphicon-cloud'></span></p><p>Example Weather ICons</p><img src='" + weather_img + "'></div><div class='col-md-4'><h4>Estimated Travel Time</h4><p>" + predictedTravelTime + "</p></div><div class='col-md-4'><h4>Advanced Preferences</h4><div class='radio'><label><input type='radio' name='optradio'>Fastest Route</label></div><div class='radio'><label><input type='radio' name='optradio'>Fewest Changeovers</label></div><div class='radio'><label><input type='radio' name='optradio'>Cheapest Route</label></div></div></div></div>";
    document.getElementById("results").innerHTML = out;
    
    showRoute(origin, dest);
}