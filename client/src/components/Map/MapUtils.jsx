import axios from 'axios';
import { getBottomLeft, getTopRight } from 'ol/extent';
import { fromLonLat, toLonLat } from 'ol/proj';
import { mapSearchRequest } from 'socketManager';

const getMapExtentCoorinates = (map) => {
  const view = map.getView();
  if (!view) return;

  const extent = view.calculateExtent(map.getSize());
  return {
    bottomLeft: toLonLat(getBottomLeft(extent)),
    topRight: toLonLat(getTopRight(extent)),
  };
};

export const sendSearchRequest = (map, searchTopic) => {
  console.log('Sending search request:', searchTopic);
  const { bottomLeft, topRight } = getMapExtentCoorinates(map);

  const message = {
    topic: searchTopic,
    bottomLeft: { lon: bottomLeft[0], lat: bottomLeft[1] },
    topRight: { lon: topRight[0], lat: topRight[1] },
  };

  mapSearchRequest(JSON.stringify(message));
};

export const sendRandomSearchRequest = (map) => {
  const { bottomLeft, topRight } = getMapExtentCoorinates(map);

  const message = {
    randomResearch: true,
    bottomLeft: { lon: bottomLeft[0], lat: bottomLeft[1] },
    topRight: { lon: topRight[0], lat: topRight[1] },
  };

  mapSearchRequest(JSON.stringify(message));
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