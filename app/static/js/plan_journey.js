/**
 * plan_journey.js
 * 
 * Allows the users to plan journeys from origin to destination, showing if and 
 * where they need to change busses.
 * 
 * Makes a POST HTTP request to the endpoint "$(window.serverUrl)/get_routes"
 */



/** 
 * Objects representing bus journeys.
 * Each BusJourney has >= 1 JourneySections (a single trip on a single bus)
 * Each JourneySection has >= 1 LineOption (multiple lines may get you from stop x to stop y)
*/

function LineOption(line, stops, colour) {
  this.line = line
  this.stops = stops
  this.colour = colour

  this.draw = function () {
    if (typeof this.polyline !== 'undefined') {
      this.unDraw()
    }

    this.polyline = new google.maps.Polyline({
      path: this.stops.map(x => new google.maps.LatLng(x.lat, x.lng)),
      strokeColor: this.colour,
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: window.map
    })
  }

  this.unDraw = function () {
    if (typeof this.polyline !== 'undefined') {
      this.polyline.setVisible(false)
      this.polyline.setMap(null)
    }
  }
}

function JourneySection(origin, destination, lineOptions) {
  this.origin = origin
  this.destination = destination
  this.lineOptions = lineOptions

  this.draw = function () {
    this.lineOptions.forEach(x => { x.draw() })
  }
  this.unDraw = function () {
    this.lineOptions.forEach(x => { x.unDraw() })
  }
}

function BusJourney(journeySections) {
  this.journeySections = journeySections

  this.draw = function () {
    this.journeySections.forEach(x => { x.draw() })
  }
  this.unDraw = function () {
    this.journeySections.forEach(x => { x.unDraw() })
  }
}


/**
 * Map init. 
 */
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


/**
 * Event handler for when a marker drag event ends
 */
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


/**
 * Sends a POST request to the endpoint of the server URL.
 * Expects to send and receive JSON.
 * If request response is successful, calls the callback function, with the
 * parsed JSON object as an argument
*/
function postToEndpoint(endpoint, body, callback) {
  var xhr = new XMLHttpRequest()

  xhr.onreadystatechange = () => {
    if (xhr.readyState !== 4) { return }

    if (xhr.status === 200) {
      callback(JSON.parse(xhr.responseText))
    } else {
      throw 'Connection Error: ' + endpoint + ' : ' + xhr.status
    }
  }

  xhr.open('POST', window.serverUrl + endpoint, true)
  xhr.setRequestHeader('Content-Type', 'Application/json')
  xhr.send(body)
}


/** 
 * Generate a random colour!
*/
function randomColour() {
  var chars = '0123456789ABCDEF'.split('')
  var randomChar = () => chars[Math.floor(Math.random() * 17)]

  var str = '#'
  for (var i = 0; i < 6; i++) {
    str += randomChar()
  }
  return str
}


/**
 *  Parses a response from the "get_routes" server endpoint
 *  Returns an array of BusJourney objects 
 */
function parseJourneyResponse(fullJourneys) {
  return fullJourneys.map(fullJourney =>

    new BusJourney(
      fullJourney.map(journeySection => {

        var lineOptions = journeySection.map(lineOption =>
          new LineOption(lineOption.line, lineOption.stops, randomColour())
        )
        var origin = lineOptions[0].stops[0]
        var destination = lineOptions[0].stops[lineOptions[0].stops.length - 1]

        return new JourneySection(origin, destination, lineOptions)
      })
    )
  )
}


/** 
 * Used as the callback function to the postToEndpoint function.
 * Displays the results on the page
*/
function displayResults(fullJourneys) {
  if (typeof window.busJourneys !== 'undefined') {
    window.busJourneys.forEach(x => { x.unDraw() })
    window.busJourneys = null
  }

  window.busJourneys = parseJourneyResponse(fullJourneys)
  window.busJourneys.forEach(x => x.draw())

  drawResultsTable(window.busJourneys)
}


/**
 * Expects an array of BusJourney objects.
 * Draws a table representing the results and appends it to the
 * <div id="results" /> element on the page.
 */
function drawResultsTable(busJourneys) {
  document.getElementById('results').innerHTML = ''
  var table = document.createElement('table')

  // Create the table header row
  var th = document.createElement('thead')

  var rowHeads = ['Origin Stop ID', 'Destination Stop ID', 'Line Options']
  rowHeads.forEach(x => {
    var td = document.createElement('td')
    td.innerText = x
    th.appendChild(td)
  })

  table.appendChild(th)

  // Add a row for each bus journey to the table
  busJourneys.forEach(bj => {
    var row = document.createElement('tr')

    bj.journeySections.forEach(js => {

      var td = document.createElement('td')
      td.innerText = js.origin.id
      row.appendChild(td)

      td = document.createElement('td')
      td.innerText = js.destination.id
      row.appendChild(td)

      js.lineOptions.forEach(lo => {
        td = document.createElement('td')
        td.innerText = lo.line
        row.appendChild(td)
      })
    })
    table.appendChild(row)
  })

  document.getElementById('results').appendChild(table)
}


