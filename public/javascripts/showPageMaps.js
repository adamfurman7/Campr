mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 9, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ offset: 25 }).setHTML(
			`<h5 class="card-title">${campground.title}</h5><p class="card-text">${campground.location}</p>`
		)
	)
	.addTo(map);
