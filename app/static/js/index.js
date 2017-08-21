// Do these fuctions trigger on the same event?



$(document).ready(function () {
    pop_origin_stops();
    get_weather();
    pop_origin_stops_rti();
});

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
