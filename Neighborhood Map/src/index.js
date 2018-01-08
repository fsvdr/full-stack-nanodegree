import url from './app.scss';
import stops from './collections/cover-stops';
import { API_KEY } from './config';
import GoogleMap from './utils/gmap-interface';
import FourSquareClient from './utils/foursquare-interface';

let vm;
let map;
let foursquare;

/************************************************
 * VIEW MODEL
 ***********************************************/

function ViewModel () {
	this.connectionStatusCode = ko.observable(1); // 0 - Connecting, 1 - Established, 2 - Compromised
	this.isUserAtControlCenter = ko.observable(true);
	this.isIntelOpen = ko.observable(false);
	this.query = ko.observable('');
	this.selectedStop = ko.observable(null);
	// Computed stops based on the filter query
	this.stops = ko.computed(() => {
		const query = this.query().toLowerCase().trim();
		return map.filterPlaces(query, stops);
	});


	// Handles view change for movile devices
	this.openControlCenter = () => this.isUserAtControlCenter(true);
	// Informs UI that something went wrong
	this.informCompromisedConnection = () => this.connectionStatusCode(2);
	// Opens the stop intel
	this.toggleIntel = () => this.isIntelOpen(!this.isIntelOpen());
	// Changes currently viewing stop
	this.selectStop = (selection) => {
		const stop = stops.find((s) => s.title === selection.title);

		// Inform UI that a request is being processed (loading)
		this.connectionStatusCode(0);

		map.obtainDetails(stop).then(() => {
			foursquare.getVenueDetails(stop)
				.then(() => {
					this.selectedStop(stop);
					map.populateInfoWindow(stop);

					// Inform UI that the request succeeded
					this.connectionStatusCode(1);
					this.isUserAtControlCenter(false);
				})
				.catch((error) => this.informCompromisedConnection());
		})
		.catch((error) => this.informCompromisedConnection());
	}
}

const informCompromisedConnection = () => vm.informCompromisedConnection();




/************************************************
 * GOOGLE MAP
 ***********************************************/

/**
 * Google Map initialization callback
 */
function initMap() {
	// Initialize API interfaces and save for reference
	map = new GoogleMap('.c-gmap', (msg) => {
		console.log(msg);
		informCompromisedConnection();
	});
	foursquare = new FourSquareClient((msg) => {
		console.log(msg);
		informCompromisedConnection();
	});

	map.initMarkers(stops, () =>{
		vm = new ViewModel();
		// Apply Knockout bindings to app
		ko.applyBindings(vm);
	});
}





// Get `initMap` to the global scope so that it's accessible to the
// Google Maps API script
window.initMap = initMap;

// Load Google Maps JavaScript API script.
// This is most definetly not the best way to do this but this way we ensure
// that the API doesn't load before the `initMap` code.
(function() {
	const script = document.createElement('script');
	script.setAttribute('src', `https://maps.googleapis.com/maps/api/js?libraries=places&key=${API_KEY}&v=3&callback=initMap`);
	script.setAttribute('async', true);
	script.setAttribute('defer', true);
	script.onerror = () => {
		alert('Something went wrong while loading Google Maps. Please try reloading the page');
	};

	document.body.appendChild(script);
})();
