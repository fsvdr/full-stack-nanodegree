export default class CoverStop {
	constructor(title, category, address) {
		this.title = title;
		this.category = category;
		this.address = address;
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

	setPhoto(url) {
		this.photo = url;
	}
}
