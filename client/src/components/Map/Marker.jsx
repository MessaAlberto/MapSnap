import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj';

const markerMap = new Map();
const clusterOverlayMap = new Map();
const clusterMarkersMap = new Map();


export const checkOverlayOverlap = (map) => {
  const overlays = Array.from(document.querySelectorAll('.marker'));
  const overlappedMarkers = new Map();

  Array.from(document.querySelectorAll('.cluster')).forEach(cluster => cluster.remove());

  overlays.forEach((marker, i) => {
    for (let j = i + 1; j < overlays.length; j++) {
      if (areElementsOverlapping(marker, overlays[j])) {
        overlappedMarkers.set(marker, [...(overlappedMarkers.get(marker) || []), overlays[j]]);
        overlappedMarkers.set(overlays[j], [...(overlappedMarkers.get(overlays[j]) || []), marker]);
      }
    }
  });

  overlays.forEach(marker => marker.style.visibility = overlappedMarkers.has(marker) ? 'hidden' : 'visible');
  overlappedMarkers.forEach((_, marker) => createCluster(map, marker));
};

const areElementsOverlapping = (el1, el2) => {
  const rect1 = el1.getBoundingClientRect();
  const rect2 = el2.getBoundingClientRect();
  return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
};

const createCluster = (map, marker) => {
  const clusterElement = document.createElement('div');
  clusterElement.className = 'cluster';
  clusterElement.innerText = 1;

  const clusterId = `cluster-${marker.getAttribute('data-id')}`;
  clusterElement.setAttribute('data-id', clusterId);

  const markerOverlay = markerMap.get(marker.getAttribute('data-id'));
  const overlay = new Overlay({
    element: clusterElement,
    positioning: 'center-center',
    stopEvent: false,
  });

  overlay.setPosition(markerOverlay.getPosition());
  map.addOverlay(overlay);
  clusterOverlayMap.set(clusterId, overlay);
  clusterMarkersMap.set(clusterId, [marker]);

  checkClusterOverlap();
};

const checkClusterOverlap = () => {
  const clusters = Array.from(document.querySelectorAll('.cluster'));

  clusters.forEach((cluster, i) => {
    for (let j = i + 1; j < clusters.length; j++) {
      const otherCluster = clusters[j];
      if (areElementsOverlapping(cluster, otherCluster)) {
        const newCount = parseInt(cluster.innerText) + parseInt(otherCluster.innerText);
        const clusterOverlay1 = clusterOverlayMap.get(cluster.getAttribute('data-id'));
        const clusterOverlay2 = clusterOverlayMap.get(otherCluster.getAttribute('data-id'));

        const newPosition = [
          (clusterOverlay1.getPosition()[0] + clusterOverlay2.getPosition()[0]) / 2,
          (clusterOverlay1.getPosition()[1] + clusterOverlay2.getPosition()[1]) / 2,
        ];

        cluster.innerText = newCount;
        clusterOverlay1.setPosition(newPosition);

        otherCluster.remove();
        clusterOverlayMap.delete(otherCluster.getAttribute('data-id'));
        clusterMarkersMap.delete(otherCluster.getAttribute('data-id'));
      }
    }
  });
};

export const addMarker = (map, id, lon, lat, owner_username, topics, imageBase64, onClick) => {
  if (markerMap.has(id)) {
    console.log('Marker with ID:', id, 'already exists');
    console.log('Marker map:', markerMap);
    return;
  }

  const markerElement = document.createElement('div');
  markerElement.className = 'marker';
  markerElement.setAttribute('data-id', id);

  const contentContainer = document.createElement('div');
  contentContainer.className = 'marker-content';

  const usernameElement = document.createElement('div');
  usernameElement.className = 'marker-username';
  usernameElement.innerText = `ph: ${owner_username}`;
  contentContainer.appendChild(usernameElement);

  const img = document.createElement('img');
  img.src = `data:image/jpeg;base64,${imageBase64}`;
  img.className = 'marker-image';
  img.onerror = () => console.error('Error loading image for marker with ID:', id, 'and topics:', topics);

  const topicContainer = document.createElement('div');
  topicContainer.className = 'marker-topics';
  topicContainer.innerText = topics.map(topic => `#${topic}`).join(' ');

  contentContainer.append(img, topicContainer);
  markerElement.appendChild(contentContainer);

  const overlay = new Overlay({
    element: markerElement,
    positioning: 'bottom-center',
    stopEvent: false,
  });

  map.addOverlay(overlay);
  overlay.setPosition(fromLonLat([lon, lat]));
  markerMap.set(id, overlay);
  console.log('Marker map:', markerMap);

  markerElement.addEventListener('click', () => onClick({ imageId: id, owner_username, topics, imageBase64 }));

  checkOverlayOverlap(map);
};

export const clearMapImages = (map) => {
  if (map) {
    console.log('Clearing map images');
    map.getOverlays().clear();
    markerMap.clear();
    clusterOverlayMap.clear();
    clusterMarkersMap.clear();
  }
};

export { markerMap };
