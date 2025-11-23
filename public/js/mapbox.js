/* eslint-disable */

// const locationsData = document.getElementById('map').dataset.locations;

// const locations = JSON.parse(locationsData);

// console.log(locations);
export const displaymap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibW9oYW1lZGFzaHJlZiIsImEiOiJjbWhkaDluYmMwMmdxMm5zOGk4cjhxano3In0.vWXNGwZC9SK6YphWKp_r4g ';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mohamedashref/cmhdhxkxd004h01r412p14sk5',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .setPopup(
        new mapboxgl.Popup({
          offset: 30,
        }).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      )
      .addTo(map);

    bounds.extend(loc.coordinates);
  });
  map.on('load', () => {
    //1)map bound
    map.fitBounds(bounds, {
      padding: {
        top: 100,
        bottom: 150,
        left: 100,
        right: 100,
      },
    });

    // 2)get coordinates for line
    const coordinates = locations.map(loc => loc.coordinates);

    // 3) add source of line
    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      },
    });

    // 4) add layer of line
    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#55c57a',
        'line-width': 3,
      },
    });
  });
};
