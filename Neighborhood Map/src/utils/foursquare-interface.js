import { CLIENT_ID, CLIENT_SECRET } from '../config';

/**
 * Class definition fot FourSquare API interface.
 *
 * This allows to use the API in a much cleaner, abstract manner with the
 * actual app code not knowing about the implementation of it.
 */
class FourSquareClient {
	/**
	 * @param  {Function} reportErrorOccurrence An error reporter function
	 */
	constructor(reportErrorOccurrence) {
		this.id = CLIENT_ID;
		this.secret = CLIENT_SECRET;
		this.reportErrorOccurrence = reportErrorOccurrence;
	}

	/**
	 * Handles place details obtation.
	 *
	 * Venue search is required to obtain an id to use for the details
	 * request. Resolves when the place details have been setup.
	 * @access public
	 * @param  {CoverStop} place Representation of the cover stop
	 * @return {Promise}       Promise for the details request
	 */
	getVenueDetails(place) {
		return new Promise((resolve, reject) => {
			// Get venue id before obtaining the details
			this.getPlaceId(place).then((id) => {
				this.getDetails(id, place).then(() => {
					resolve();
				});
			})
			.catch((error) => {
				this.reportErrorOccurrence('Venue Details Failed');
				reject();
			});
		});
	}

	/**
	 * Handles the venue search request.
	 *
	 * Resolves when the venue id has been found
	 * @access private
	 * @param  {CoverStop} place Representation of the cover stop
	 * @return {Promise}       Promise for the venue search request
	 */
	getPlaceId(place) {
		return new Promise((resolve, reject) => {
			// Include all the information available so that the request
			// can return a much precise match
			let params = new URLSearchParams();
			params.append('client_id', this.id);
			params.append('client_secret', this.secret);
			params.append('ll', `${place.location.lat},${place.location.lng}`);
			params.append('name', place.title);
			params.append('intent', 'match');
			params.append('address', place.address);
			// FourSquare API requires a version parameter to determine which version
			// of the API is supported by the app
			params.append('v', '20171227');

			fetch(`https://api.foursquare.com/v2/venues/search?${params.toString()}`)
				.then((response) => response.json())
				.then((json) => resolve(json.response.venues[0].id))
				.catch((error) => {
					this.reportErrorOccurrence('Search Venue Request Failed');
					reject();
				});
		});
	}

	/**
	 * Handles the venue details request.
	 *
	 * Resolves when the details have been set to the place object
	 * @access private
	 * @param  {String} id    The venue's id from the search request
	 * @param  {CoverStop} place Representation of the cover stop
	 * @return {Promise}       Promise for the venue details request
	 */
	getDetails(id, place) {
		return new Promise((resolve, reject) => {
			let params = new URLSearchParams();
			params.append('client_id', this.id);
			params.append('client_secret', this.secret);
			params.append('v', '20171227');

			fetch(`https://api.foursquare.com/v2/venues/${id}?${params.toString()}`)
				.then((response) => response.json())
				.then((json) => {
					const venue = json.response.venue;
					if (venue.description) place.setDescription(venue.description);
					if (venue.url) place.setUrl(venue.url);
					if (venue.contact.formattedPhone) place.setPhone(venue.contact.telephone);
					if (venue.hereNow.summary) place.setHereNow(venue.hereNow.summary);

					resolve();
				})
				.catch((error) => {
					this.reportErrorOccurrence('Venue Details Request Failed');
					reject();
				});
		});
	}
}

export default FourSquareClient;
