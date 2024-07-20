import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';

const markerMap = new Map();

export const addMarker = (map, id, lon, lat, owner_username, topics, imageBase64) => {
  if (markerMap.has(id)) {
    return;
  }

  const markerElement = document.createElement('div');
  markerElement.className = 'marker';

  const img = document.createElement('img');
  img.src = `data:image/jpeg;base64,${imageBase64}`;
  img.className = 'marker-image';

  img.onerror = () => {
    console.error('Error loading image for marker with ID:', id, 'and topics:', topics);

    console.error('Image Base64 Data:', imageBase64);
  };

  const topicContainer = document.createElement('div');
  topicContainer.className = 'marker-topics';
  topicContainer.innerText = topics.map(topic => `#${topic}`).join(' ');

  markerElement.appendChild(img);
  markerElement.appendChild(topicContainer);

  const overlay = new Overlay({
    element: markerElement,
    positioning: 'bottom-center',
    stopEvent: false,
  });

  map.addOverlay(overlay);
  overlay.setPosition(fromLonLat([lon, lat]));
  markerMap.set(id, overlay);
};

export const clearMapImages = (map) => {
  if (map) {
    console.log('Clearing map images');
    map.getOverlays().clear();
    markerMap.clear();
  }
};

export { markerMap };
