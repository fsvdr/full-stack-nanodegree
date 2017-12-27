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
	* @param {InfoWindow} infoWindow  [Google Maps InfoWindow instance]
	* @param {PlacesService} placesService  [Google Maps PlacesService instance]
	*/
function setStopMarker(stop, map, bounds, infoWindow, placesService) {

	// Obtain place reference through Google Maps Places API
	placesService.textSearch({query: stop.title, location: stop.location}, (results, status) => {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			const marker = new google.maps.Marker({
				map: map,
				position: stop.location,
				title: stop.title,
				animation: google.maps.Animation.DROP,
				id: results[0].place_id
			});

			marker.addListener('click', function () {
				populateInfoWindow(this, stop, infoWindow, map);
			});

			stop.setMarker(marker);
			stop.showMarkerIn(map);
			bounds.extend(stop.location);
			map.fitBounds(bounds);
		}
	});
}

/************************************************
 * PUBLIC API METHODS
 ************************************************/

/**
 * Handles geocoder and marker logic for the given cover stop
 * @param {CoverStop} stop [Cover stop]
 * @param {Map} map  [Google Maps Map instance]
 * @param  {Geocoder} geocoder [Google Maps Geocoder instance]
 * @param {InfoWindow} infoWindow  [Google Maps InfoWindow instance]
 * @param {PlacesService} placesService  [Google Maps PlacesService instance]
 * @return
 */
function setupMarker(stop, map, geocoder, bounds, infoWindow, placesService) {
	geocodeAddress(geocoder, stop, () => {
		setStopMarker(stop, map, bounds, infoWindow, placesService);
	})
}

/**
 * Populates the infowindow with the marker's information
 * @param  {Marker} marker     Google Maps Marker instance
 * @param  {InfoWindow} infoWindow Google Maps InfoWindow instance
 */
function populateInfoWindow(marker, stop, infoWindow, map) {
	// Check to make sure the infowindow is not already opened on this marker
	if (infoWindow.marker != marker) {
		infoWindow.marker = marker;

		let content = '<h1 class="o-gmarker-title">' + marker.title + '</h1>';
		if (stop.url) content += '<a href="' + stop.url + '" class="o-gmarker-link">' + stop.url + '</a>';
		if (stop.phone) content += '<a href="tel: ' + stop.phone + '" class="o-gmarker-link"> ' + stop.phone + '</a>';
		if (stop.description) content += '<p class="o-gmarker-description">' + stop.description + '</p>';
		if (stop.hereNow) content += '<span class="o-gmarker-details">' + stop.hereNow + '</span>';
		infoWindow.setContent(content);

		infoWindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed
		infoWindow.addListener('closeclick', () => {
			infoWindow.setMarker = null;
		});
	}
}

function getStopDetails(stop, placesService, resolve, reject) {
	placesService.getDetails({placeId: stop.marker.id}, (results, status) => {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			const stories = results.reviews.slice(0, 3).map((r) => r.text);
			const photos = results.photos.slice(0, 3).map((p) => p.getUrl({maxHeight: 400, maxWidth: 600}));

			stop.setStories(stories);
			stop.setPhotos(photos);
			resolve();
		} else {
			reject();
		}
	});
}




/************************************************
 * PUBLIC API
 * @type {Object}
 ************************************************/
export const GMapUtilities = {
	initMarker: setupMarker,
	populateInfoWindow: populateInfoWindow,
	getStopDetails: getStopDetails
}
