import url from './app.scss';

const stops = [
	{
		title: 'Roadhouse',
		category: 'Restaurant',
		address: 'Snorrabraut 56, 101 Reykjavík, Iceland',
		location: {lat: 64.14074459999999, lng: -21.9196381}
	},
	{
		title: 'Skaftafell',
		category: 'Outdoors',
		address: 'Skaftafell, Reykjavík, Iceland',
		location: {lat: 64.070414, lng: -16.9751755}
	},
	{
		title: 'Cafe Paris',
		category: 'Restaurant',
		address: 'Austurstræti 14, 101 Reykjavík, Iceland',
		location: {lat: 64.14754359999999, lng: -21.9387947}
	},
	{
		title: 'Goðafoss',
		category: 'Outdoors',
		address: 'Goðafoss Waterfall, Iceland',
		location: {lat: 65.6827782, lng: -17.5501918}
	},
	{
		title: 'Te & Kaffi',
		category: 'Restaurant',
		address: 'Hafnarstræti 91, Akureyri, Iceland',
		location: {lat: 65.68046580000001, lng: -18.0893121}
	},
	{
		title: 'Gullfoss Falls',
		category: 'Outdoors',
		address: 'Gullfoss Falls, Iceland',
		location: {lat: 64.3270716, lng: -20.1199478}
	}
];


// Declare references that will be used across the map logic
let map;
let markers = [];

function initMap() {
	// Initialize map and save for reference
	map = new google.maps.Map(document.querySelector('.c-gmap'), {
		center: {lat: 64.500586, lng: -21.362976},
    zoom: 7,
		mapTypeControl: false,
		scaleControl: false,
		rotateControl: false,
		fullscreenControl: false,
		streetViewControl: false,
		zoomControl: true,
		 zoomControlOptions: {
			 position: google.maps.ControlPosition.TOP_RIGHT
		 }
  });

	// Initialize map bounds and info window
	const infoWindow = new google.maps.InfoWindow();
	const bounds = new google.maps.LatLngBounds();

	// Get stop's data to create marker
	stops.forEach((s, index) => {
		const position = s.location;
		const title = s.title;

		const marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: index
		});

		markers.push(marker);
		marker.addListener('click', function() {
			populateInfoWindow(this, infoWindow);
		});

		// Use newly created marker's position to extends the map's boundries
		bounds.extend(markers[index].position);
	});
}

// Helper function
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		infowindow.setContent('<h1>' + marker.title + '</h1><span>' + marker.position.lat() + ', ' + marker.position.lng() + '</span>');
		infowindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick',function(){
		infowindow.setMarker = null;
		});
	}
};

// Get `initMap` to the global scope so that it's accessible to the
// Google Maps API script
window.initMap = initMap;

function CoverStopsViewModel () {
	this.connectionStatusCode = ko.observable(1); // 0 - Connecting, 1 - Established, 2 - Compromised
	this.isUserAtControlCenter = ko.observable(true);
	this.isIntelOpen = ko.observable(false);
	this.stops = stops;

	this.toggleIntel = () => {
		const prev = this.isIntelOpen();
		this.isIntelOpen(!prev);
	}
}

ko.applyBindings(new CoverStopsViewModel());
