import url from './app.scss';

let map;

function initMap() {
	map = new google.maps.Map(document.querySelector('.c-gmap'), {
		center: {lat: -34.397, lng: 150.644},
    zoom: 8,
		mapTypeControl: false,
		scaleControl: false,
		rotateControl: false,
		fullscreenControl: false,
		streetViewControl: false,
		zoomControl: false
  });
}

// Get `initMap` to the global scope so that it's accessible to the
// Google Maps API script
window.initMap = initMap;
