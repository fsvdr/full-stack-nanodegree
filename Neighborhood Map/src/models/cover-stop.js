export default class CoverStop {
	constructor(title, category, address) {
		this.title = title;
		this.category = category;
		this.address = address;
		this.location = {};
		this.marker = null;
		this.photos = [];
		this.stories = [];
		this.description = "";
		this.url = "";
		this.phone = "";
		this.hereNow = "";
	}

	setLocation(location) {
		this.location = location;
	}

	setMarker(marker) {
		this.marker = marker;
	}

	showMarkerIn(map) {
		this.marker.setMap(map);
	}

	hideMarker() {
		this.marker.setMap(null);
	}

	setPhotos(urls) {
		this.photos = urls;
	}

	setStories(stories) {
		this.stories = stories;
	}

	setDescription(description) {
		this.description = description;
	}

	setUrl(url) {
		this.url = url;
	}

	setPhone(phone) {
		this.phone = phone
	}

	setHereNow(summary) {
		this.hereNow = summary;
	}
}
