window.addEventListener('load', function () {
  document.getElementById('results')
    .innerText = 'Drag journey Start and Finish markers to desired locations'
})


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

  var results = document.getElementById('results')
  try {
    results.removeChild(document.getElementById('table'))
  } catch (e) { }
  results.innerText = ''

  results.appendChild(makeTable(routes))
}

function IGNORE_NEEDS_ADAPTING() {
  window.polylines = routes.map(function (x) {
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


function makeTable(routes) {


  // create table and append to body
  var table = document.createElement('table')
  table.setAttribute('id', 'routes-table')

  // set the table header row
  var hRow = table.createTHead().insertRow()
  hRow.insertCell().innerText = 'Board at'
  hRow.insertCell().innerText = 'Deboard at'
  hRow.insertCell().innerText = 'Bus line options'


  // in order to have each route in the table alternate
  // colour to distinguish between them, evenRoute is used
  // to set the row class attribute
  var evenRoute = true
  var rowClass = 'even-route'
  routes.forEach(function (route) {

    evenRoute
      ? rowClass = 'even-route'
      : rowClass = 'odd-route'
    evenRoute = !evenRoute


    route.forEach(function (routeSection) {
      var row = table.insertRow()
      row.setAttribute('class', rowClass)

      row.insertCell().innerText = routeSection.board
      row.insertCell().innerText = routeSection.deboard

      // concatinate all strings in routeSection.busses array
      row.insertCell().innerText =
        routeSection.busses.reduce(function (str, bus) {
          return str + bus + '\t'
        }, '')
    })
  })
  return table
}



