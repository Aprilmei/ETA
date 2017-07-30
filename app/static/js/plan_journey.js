function initMap() {
    window.map = new google.maps.Map(
        document.getElementById('map'), {
            zoom: 12,
            center: {
                lat: 53.346348,
                lng: -6.263098
            }
        }
    )

    window.originMarker = new google.maps.Marker({
        position: {
            lat: 53.346348,
            lng: -6.263098
        },
        map: window.map,
        label: "O",
        draggable: true
    })

    window.destinationMarker = new google.maps.Marker({
        position: {
            lat: 53.344196,
            lng: -6.257776
        },
        map: window.map,
        label: "D",
        draggable: true
    })

    window.destinationMarker.addListener('dragend', handleDragEnd)
    window.originMarker.addListener('dragend', handleDragEnd)

    new google.maps.InfoWindow({
        content: "Drag to origin"
    }).open(window.map, window.originMarker)

    new google.maps.InfoWindow({
        content: "Drag to destination"
    }).open(window.map, window.destinationMarker)
}

function handleDragEnd(event) {
    // clear existing route lines on map if they exist
    if (typeof window.polylines !== 'undefined') {
        window.polylines.forEach(x => x.setMap(null))
        window.polylines = []
    }

    var origin = {
        lat: window.originMarker.getPosition().lat(),
        lng: window.originMarker.getPosition().lng()
    }

    var destination = {
        lat: window.destinationMarker.getPosition().lat(),
        lng: window.destinationMarker.getPosition().lng()
    }

    getRoutes(origin, destination)
}

function getRoutes(origin, destination) {
    var xhr = new XMLHttpRequest()

    xhr.onreadystatechange = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
            displayRoutes(JSON.parse(xhr.responseText))
        }
    }

    xhr.open('POST', window.serverUrl + "get_routes", true)
    xhr.setRequestHeader('Content-Type', 'Application/json')

    xhr.send(JSON.stringify({
        origin: origin,
        destination: destination
    }))
}


function displayRoutes(routes) {
    console.log(routes)
}

function IGNORED_CODE() {
    window.polylines = journeys.map(function (x) {
        return new google.maps.Polyline({
            path: [
                new google.maps.LatLng(
                    x.board.coords[0],
                    x.board.coords[1]
                ),
                new google.maps.LatLng(
                    x.deboard.coords[0],
                    x.deboard.coords[1]
                )
            ],

            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 1,
            map: window.map
        })
    })
}

