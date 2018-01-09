/**
 * Class definition for Google Maps API interface.
 *
 * This allows to use the API in a much cleaner, abstract maner with the
 * actual app code not knowing about the implementation of it.
 */
class GoogleMap {
	/**
	 * @param  {String} el                    Query selector for the element where the map should be placed
	 * @param  {Function} reportErrorOccurrence An error reporter function
	 */
	constructor(el, reportErrorOccurrence) {
		this.map = new google.maps.Map(document.querySelector(el), {
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

		this.infoWindow = new google.maps.InfoWindow();
		this.bounds = new google.maps.LatLngBounds();
		this.geocoder = new google.maps.Geocoder();
		this.placesService = new google.maps.places.PlacesService(this.map);
		this.reportErrorOccurrence = null || reportErrorOccurrence;
	}

	/**
	 * Handles map markers creation for the given places.
	 *
	 * Geolocation and place search are steps required for the markers to be
	 * placed.
	 * @access public
	 * @param  {Array}   places   Array of the places to create markers for
	 * @param  {Function} onMarkerClick Callback for click event on marker
	 * @param  {Function} callback Completion callback
	 */
	initMarkers(places, onMarkerClick, callback) {
		// Geocode places location
		let pendingRequests = [];
		places.forEach((p) => pendingRequests.push(this.geocode(p, onMarkerClick)));

		// Wait for all place's locations to be geocoded before
		// obtaining their details
		Promise.all(pendingRequests)
			.then(() => {
				callback();
			})
			.catch((error) => {
				this.reportErrorOccurrence('Something went wrong while geocoding.');
				callback();
			});
	}

	/**
	 * Handles place location geocoding.
	 *
	 * Resolves once place has been set with the location requested,
	 * the marker has been created and placed and the map bounds have been
	 *  adjusted to the marker's position
	 * @access private
	 * @param  {CoverStop} place Representation of the cover stop
	 * @param  {Function} onMarkerClick Callback for click event on marker
	 * @return {Promise}       Promise for the geocode request
	 */
	geocode(place, onMarkerClick) {
		return new Promise((resolve, reject) => {
			this.geocoder.geocode({address: place.address}, (results, status) => {
				if (status == google.maps.GeocoderStatus.OK) {
					const location = results[0].geometry.location;
					place.setLocation({lat: location.lat(), lng: location.lng()});

					const marker = new google.maps.Marker({
						map: this.mapmap,
						position: place.location,
						title: place.title,
					});

					marker.addListener('click', () => {
						onMarkerClick(marker);
					});
					// Place marker in map since all relevant information is
					// now available
					place.setMarker(marker);
					place.showMarkerIn(this.map);

					this.bounds.extend(place.location);
					this.map.fitBounds(this.bounds);

					resolve();
				} else {
					this.reportErrorOccurrence('Geocoding Request Failed');
					reject();
				}
			});
		});
	}

	/**
	 * Handles place details request.
	 *
	 * Resolves once place has been set with the details found
	 * @access private
	 * @param  {CoverStop} place Representation of the cover stop
	 * @return {Promise}       Promise for the place details request
	 */
	obtainDetails(place) {
		// In order to get the place details, we first need to find
		// the place's id
		return new Promise((resolve, reject) => {
			this.getPlaceId(place).then((id) => {
				this.placesService.getDetails({placeId: id}, (results, status) => {
					if (status === google.maps.places.PlacesServiceStatus.OK) {
						const reviews = results.reviews.slice(0, 3).map((r) => r.text);
						const photos = results.photos.slice(0, 3).map((p) => p.getUrl({maxHeight: 400, maxWidth: 600}));

						place.setStories(reviews);
						place.setPhotos(photos);
						resolve();
					} else {
						this.reportErrorOccurrence(`Place Details Request Failed with status: ${status}`);
						reject();
					}
				});
			});
		});
	}

	/**
	 * Handles place search request
	 *
	 * Resolves once the place id has been found
	 * @access private
	 * @param  {CoverStop} place Representation of the cover stop
	 * @return {Promise}       Promise for the place search request
	 */
	getPlaceId(place) {
		return new Promise((resolve, reject) => {
			this.placesService.textSearch(
				// Use `textSearch` as we're looking for specific places,
				// not places nearby, using the geocoded location we
				// add accuracy to the request
				{query: place.title, location: place.location},
				(results, status) => {
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						resolve(results[0].place_id);
					} else {
						this.reportErrorOccurrence(`Place Search Request Failed with status: ${status}`);
						reject();
					}
				}
			);
		})
	}

	/**
	 * Populates InfoWindow with the place details.
	 *
	 * App specific implementation, the content is adecuated to the cover stop
	 * class properties.
	 * @access public
	 * @param  {CoverStop} place Representation of the cover stop
	 */
	populateInfoWindow(place) {
		// Check to make sure the infowindow is not already opened on this marker
		if (this.infoWindow.marker !== place.marker) {
			this.bounceMarker(place.marker);
			this.infoWindow.marker = place.marker;

			let content = '<h1 class="o-gmarker-title">' + place.title + '</h1>';
			if (place.url) content += '<a href="' + place.url + '" class="o-gmarker-link">' + place.url + '</a>';
			if (place.phone) content += '<a href="tel: ' + place.phone + '" class="o-gmarker-link"> ' + place.phone + '</a>';
			if (place.description) content += '<p class="o-gmarker-description">' + place.description + '</p>';
			if (place.hereNow) content += '<span class="o-gmarker-details">' + place.hereNow + '</span>';
			this.infoWindow.setContent(content);

			this.infoWindow.open(this.map, place.marker);

			this.map.panTo(place.marker.getPosition());

			// Make sure the marker property is cleared if the infowindow is closed
			this.infoWindow.addListener('closeclick', () => {
				this.infoWindow.setMarker = null;
			});
		}
	}

	/**
	 * Handles marker animation when selected
	 * @param  {Marker} marker Google Maps Marker object
	 */
	bounceMarker(marker) {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(() => marker.setAnimation(null), 2100);
	}

	/**
	 * Handles place marker and list filtration based on `query`.
	 *
	 * For the places list, returns an array of filtered places while for the
	 * markers, it access the marker object associated with the matched places
	 * @access public
	 * @param  {String} query  User provided query for filtration
	 * @param  {Array}   places   Array of the places to create markers for
	 * @return {Array}        Array of places that match `query`
	 */
	filterPlaces(query, places) {
		if (query !== '') {
			return places.filter((p) => {
				const title = p.title.toLowerCase().trim();
				const category = p.category.toLowerCase().trim();
				const address = p.address.toLowerCase().trim();

				// Match query by place title, category or address
				if (title.includes(query) || category.includes(query) || address.includes(query)) {
					if (p.marker) p.showMarker();
					return true;
				} else {
					// Hide non-matching places
					if (p.marker) p.hideMarker();
					return false;
				}
			});
		} else {
			places.forEach((p) => p.showMarker());
			return places;
		}
	}

}

export default GoogleMap;
