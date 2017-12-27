const CLIENT_ID = "Q5351MWUZ2PSBTPC55H40EFUB3EFA1WBMOOYSJA25AYDOPLD";
const CLIENT_SECRET = "BVAIPXFN0CJ5TQJOAQOY4JJH2J553IALPKITCZ0CTADTSNJ0";

function getPlaceId(place, resolve, reject) {

	let params = new URLSearchParams();
	params.append('client_id', CLIENT_ID);
	params.append('client_secret', CLIENT_SECRET);
	params.append('ll', `${place.location.lat},${place.location.lng}`);
	params.append('name', place.title);
	params.append('intent', 'match');
	params.append('address', place.address);
	params.append('v', '20171226');

	fetch(`https://api.foursquare.com/v2/venues/search?${params.toString()}`)
		.then((response) => response.json())
		.then((json) => resolve(json.response.venues[0].id))
		.catch((error) => {
			reject();
			console.error(error)
		});
}

function getDetails(id, place, resolve, reject) {

	let params = new URLSearchParams();
	params.append('client_id', CLIENT_ID);
	params.append('client_secret', CLIENT_SECRET);
	params.append('v', '20171226');

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
			reject();
			console.error(error)
		});
}

function getPlaceDetails(place, resolve, reject) {
	getPlaceId(place, (id) => {
		getDetails(id, place, resolve, reject)
	}, reject)
}

export const FourSquareUtilities = {
	getPlaceDetails: getPlaceDetails
}
