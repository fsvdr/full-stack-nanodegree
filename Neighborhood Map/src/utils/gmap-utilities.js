/************************************************
 * PRIVATE API METHODS
 ************************************************/

/**
	* Use Google Maps Geocoder API to find the stop's location (lat, lng)
	* based on it's address.
	* @param  {Geocoder} geocoder [Google Maps Geocoder instance]
	* @param  {CoverStop} stop     [Cover stop]
	* @return {null}
	*/
function geocodeAddress(geocoder, stop, callback) {
	geocoder.geocode({address: stop.address}, (results, status) => {
		if (status == google.maps.GeocoderStatus.OK) {
			const location = results[0].geometry.location;
			stop.setLocation({lat: location.lat(), lng: location.lng()});
			callback();
		} else {
			console.error('Geocoder Request Failed.');
		}
	});
}

/**
	* Creates a Google Map Marker instance for the stop's location
	* @param {CoverStop} stop [Cover stop]
	* @param {Map} map  [Google Maps Map instance]
	* @param {LatLngBounds} bounds  [Google Maps LatLngBounds instance]
	*/
function setStopMarker(stop, map, bounds) {
	const marker = new google.maps.Marker({
		map: map,
		position: stop.location,
		title: stop.title,
		animation: google.maps.Animation.DROP,
		id: stop.title.toLowerCase().replace(' ', '-')
	});

	stop.setMarker(marker);
	stop.showMarkerIn(map);
	bounds.extend(stop.location);
	map.fitBounds(bounds);
}

/************************************************
 * PUBLIC API METHODS
 ************************************************/

/**
 * Handles geocoder and marker logic for the given cover stop
 * @param {CoverStop} stop [Cover stop]
 * @param {Map} map  [Google Maps Map instance]
 * @param  {Geocoder} geocoder [Google Maps Geocoder instance]
 * @return
 */
function setupMarker(stop, map, geocoder, bounds) {
	geocodeAddress(geocoder, stop, () => {
		setStopMarker(stop, map, bounds);
	})
}





/************************************************
 * PUBLIC API
 * @type {Object}
 ************************************************/
export const GMapUtilities = {
	initMarker: setupMarker
}
