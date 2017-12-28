import url from './app.scss';
import stops from './collections/cover-stops';
import GoogleMap from './utils/gmap-interface';
import FourSquareClient from './utils/foursquare-interface';

let map;
let foursquare;

/**
 * Google Map initialization callback
 */
function initMap() {
	// Initialize API interfaces and save for reference
	map = new GoogleMap('.c-gmap', (msg) => console.log(msg));
	foursquare = new FourSquareClient((msg) => console.log(msg));

	map.initMarkers(stops, () =>{
		// Apply Knockout bindings to app
		ko.applyBindings(new ViewModel());
	});
}


/**
 * ViewModel definition
 * This is the * in MV* which handles the communication betwen model and view
 */
function ViewModel () {
	this.connectionStatusCode = ko.observable(1); // 0 - Connecting, 1 - Established, 2 - Compromised
	this.isUserAtControlCenter = ko.observable(true);
	this.isIntelOpen = ko.observable(false);
	this.query = ko.observable('');
	this.filterInput = document.querySelector('.js-filter');
	this.selectedStop = ko.observable(null);

	// Computed stops based on the filter query
	this.stops = ko.computed(() => {
		const query = this.query().toLowerCase().trim();
		return map.filterPlaces(query, stops);
	});

	// Updates the query observable
	this.filterStops = () => {
		this.query(this.filterInput.value);
	}

	// Handles view change for movile devices
	this.openControlCenter = () => {
		this.isUserAtControlCenter(true);
	}

	// Informs UI that something went wrong
	this.informCompromisedConnection = () => {
		this.connectionStatusCode(2);
	}

	// Changes currently viewing stop
	this.selectStop = (selection) => {
		const stop = stops.find((s) => s.title === selection.title);

		this.connectionStatusCode(0);

		foursquare.getVenueDetails(stop)
			.then(() => {
				this.selectedStop(stop);
				map.populateInfoWindow(stop);

				this.connectionStatusCode(1);
				this.isUserAtControlCenter(false);
			})
			.catch((error) => this.informCompromisedConnection());
	}

	// Opens the stop intel
	this.toggleIntel = () => {
		const prev = this.isIntelOpen();
		this.isIntelOpen(!prev);
	}
}

// Get `initMap` to the global scope so that it's accessible to the
// Google Maps API script
window.initMap = initMap;
