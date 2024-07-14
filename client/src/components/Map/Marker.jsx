import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';

export const addMarker = (map, lon, lat, topics, imageBase64) => {
  const markerElement = document.createElement('div');
  markerElement.className = 'marker';

  const img = document.createElement('img');
  img.src = `data:image/jpeg;base64,${imageBase64}`;
  img.className = 'marker-image';

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
};
