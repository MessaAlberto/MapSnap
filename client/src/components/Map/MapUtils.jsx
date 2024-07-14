import axios from 'axios';
import { getBottomLeft, getTopRight } from 'ol/extent';
import { fromLonLat, toLonLat } from 'ol/proj';
import { mqttPublish } from 'socketManager';

export const sendSearchRequest = (map, searchTopic) => {
  const view = map.getView();
  if (!view) return;

  const extent = view.calculateExtent(map.getSize());
  const bottomLeft = toLonLat(getBottomLeft(extent));
  const topRight = toLonLat(getTopRight(extent));

  const message = {
    topic: searchTopic,
    bottomLeft: { lon: bottomLeft[0], lat: bottomLeft[1] },
    topRight: { lon: topRight[0], lat: topRight[1] },
  };

  mqttPublish(JSON.stringify(message));
};

export const geocodeAndCenterMap = async (place, map) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json`);
    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      const center = fromLonLat([parseFloat(lon), parseFloat(lat)]);
      map.getView().animate({ center, zoom: 13 });
    }
  } catch (error) {
    console.error('Error geocoding:', error);
  }
};

export const clearMapImages = (map) => {
  if (map) {
    console.log('Clearing map images');
    map.getOverlays().clear();
  }
};
