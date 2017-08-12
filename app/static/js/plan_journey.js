window.polylines = []
window._fullJourneys = []

function drawResultsTable() {
  document.getElementById('results').innerText = ''

  window._fullJourneys.forEach(fullJourney => {
    var div = document.createElement('div')

    fullJourney.forEach(journeySection => {

      journeySection.forEach(line => {
        div.innerText += line.stops[0].id + ' -> '
        div.innerText += line.line + ' -> '
        div.innerText += line.stops[line.stops.length - 1].id + ' '
      })
    })
    document.getElementById('results').appendChild(div)
  })

  var groupedFullJourneys = window._fullJourneys.map(fullJourney =>
    groupJourneyLinesByOriginDestination(fullJourney))
  console.log(groupedFullJourneys)
}


function groupJourneyLinesByOriginDestination(fullJourney) {
  console.log(fullJourney)
  return fullJourney.reduce((acc, journeySection) => {
    journeySection.forEach(line => {
      var firstStop = line.stops[0].id
      var lastStop = line.stops[line.stops.length - 1].id

      if (typeof acc[firstStop] === 'undefined') {
        acc[firstStop] = {}
      }
      if (typeof acc[firstStop][lastStop] === 'undefined') {
        acc[firstStop][lastStop] = []
      }
      acc[firstStop][lastStop].push(line.line)
    })
    return acc
  }, {})
}


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
    label: "S",
    draggable: true
  })
  window.destinationMarker = new google.maps.Marker({
    position: {
      lat: 53.344196,
      lng: -6.257776
    },
    map: window.map,
    label: "F",
    draggable: true
  })
  window.destinationMarker.addListener('dragend', handleDragEnd)
  window.originMarker.addListener('dragend', handleDragEnd)
}

function handleDragEnd(event) {
  var origin = {
    lat: window.originMarker.getPosition().lat(),
    lng: window.originMarker.getPosition().lng()
  }
  var destination = {
    lat: window.destinationMarker.getPosition().lat(),
    lng: window.destinationMarker.getPosition().lng()
  }
  postToEndpoint(
    'get_routes',
    JSON.stringify({
      origin: origin,
      destination: destination
    }),
    displayResults
  )
}


function postToEndpoint(endpoint, body, callback) {
  var xhr = new XMLHttpRequest()

  xhr.onreadystatechange = () => {
    if (xhr.status === 200 && xhr.readyState === 4) {
      callback(JSON.parse(xhr.responseText))
    }
  }
  xhr.open('POST', window.serverUrl + endpoint, true)
  xhr.setRequestHeader('Content-Type', 'Application/json')
  xhr.send(body)
}

function randomColour() {
  var chars = '0123456789ABCDEF'.split('')
  var randomChar = () => chars[Math.floor(Math.random() * 17)]

  var str = '#'
  for (var i = 0; i < 6; i++) {
    str += randomChar()
  }
  return str
}

function displayResults(fullJourneys) {
  window._fullJourneys = fullJourneys

  try {
    window.polylines.forEach(x => x.setVisible(false))
    window.polylines.forEach(x => x.setMap(null))
  } catch (e) { }
  window.polylines = []

  fullJourneys.forEach(fullJourney => {
    fullJourney.forEach(journeySection => {
      journeySection.forEach(line => {
        var pl = new google.maps.Polyline({
          path: line.stops.map(x => new google.maps.LatLng(x.lat, x.lng)),
          strokeColor: randomColour(),
          strokeOpacity: 1.0,
          strokeWeight: 3,
          map: window.map
        })
        window.polylines.push(pl)
      })
    })
  })
  drawResultsTable()
}