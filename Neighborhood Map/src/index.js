import url from './app.scss';
import stops from './collections/cover-stops';
import { GMapUtilities } from './utils/gmap-utilities';

let map;

/**
 * Google Map initialization callback
 * @return null
 */
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

	// Initialize map info window, bounds and geocoder objects
	const infoWindow = new google.maps.InfoWindow();
	const bounds = new google.maps.LatLngBounds();
	const geocoder = new google.maps.Geocoder();

	// Use geocoder to get each stop's coordinates and set marker on map
	stops.forEach((stop) => {
		GMapUtilities.initMarker(stop, map, geocoder, bounds);
	});
}


/**
 * ViewModel definition
 * This is the * in MV* which handles the communication betwen model and view
 * @constructor
 */
function ViewModel () {
	this.connectionStatusCode = ko.observable(1); // 0 - Connecting, 1 - Established, 2 - Compromised
	this.isUserAtControlCenter = ko.observable(false);
	this.isIntelOpen = ko.observable(false);
	this.query = ko.observable('');
	this.filterInput = document.querySelector('.js-filter');

	// Computed value of filtered cover stops.
	this.stops = ko.computed(() => {
		const query = this.query().toLowerCase().trim();

		if (query !== '') {
			// Return matches and display the markers
			const filteredStops =  stops.filter((s) => {
				// Match query by stop title, category or address
				if (s.title.toLowerCase().includes(query) || s.category.toLowerCase().includes(query) || s.address.toLowerCase().includes(query)) {
					if (s.marker) s.showMarkerIn(map);
					return true;
				} else {
					if (s.marker) s.hideMarker();
					return false;
				}
			});

			return filteredStops;

		} else {
			// Return and show all stops
			stops.forEach((s) => {
				if (s.marker) s.showMarkerIn(map);
			});

			return stops;
		}
	});


	this.filterStops = () => {
		this.query(this.filterInput.value);
	}

	this.toggleIntel = () => {
			const prev = this.isIntelOpen();
			this.isIntelOpen(!prev);
		}
}

// Get `initMap` to the global scope so that it's accessible to the
// Google Maps API script
window.initMap = initMap;

// Apply Knockout bindings to app
ko.applyBindings(new ViewModel());
