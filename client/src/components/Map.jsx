import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { UtilsContext } from 'contexts/utilsProvider';
import { debounce } from 'lodash';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import { Zoom, defaults as defaultControls } from 'ol/control';
import { getBottomLeft, getTopRight } from 'ol/extent';
import { Tile as TileLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket, mqttPublish, setupSocketConnection } from 'socketManager';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'style/components/Map.scss';

const MapComponent = () => {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const searchTopicRef = useRef('');
  const isSearchRef = useRef(false);
  const [isSearching, setIsSearching] = useState(false);
  const { searchTopic, searchPlace } = useContext(UtilsContext);

  const navigate = useNavigate();

  // Setup MQTT connection only once
  useEffect(() => {
    setupSocketConnection(handleMqttMessage);

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!mapDivRef.current) return;

    const lonLatCoordinates = [11.13, 46.07];

    const map = new Map({
      target: mapDivRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
      ],
      view: new View({
        center: fromLonLat(lonLatCoordinates),
        zoom: 13
      }),
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }).extend([
        new Zoom()
      ])
    });

    mapRef.current = map;

    searchTopicRef.current = searchTopic;

    // Debounce function to handle search request on map move
    const debouncedSendSearchRequest = debounce(() => {
      if (isSearchRef.current) {
        console.log('Search already in progress.');
        return;
      }
      sendSearchRequest();
    }, 300);

    map.on('moveend', debouncedSendSearchRequest);

    return () => {
      map.setTarget(null);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    searchTopicRef.current = searchTopic;
    clearMapImages();
    sendSearchRequest();
  }, [searchTopic]);


  useEffect(() => {
    if (searchPlace) {
      console.log('Search place:', searchPlace);
      geocodeAndCenterMap(searchPlace);
    }
  }, [searchPlace]);

  const sendSearchRequest = () => {
    const currentSearchTopic = searchTopicRef.current;
    if (currentSearchTopic === '') {
      console.log('Search topic cannot be empty');
      return;
    }
    if (!mapRef.current) {
      console.log('Map instance not found');
      return;
    }

    const view = mapRef.current.getView();
    if (!view) {
      console.log('Map view not found');
      return;
    }

    const extent = view.calculateExtent(mapRef.current.getSize());
    const bottomLeft = toLonLat(getBottomLeft(extent));
    const topRight = toLonLat(getTopRight(extent));

    if (bottomLeft.some(coord => isNaN(coord) || !isFinite(coord)) ||
      topRight.some(coord => isNaN(coord) || !isFinite(coord))) {
      console.log('Invalid converted coordinates:', bottomLeft, topRight);
      return;
    }

    setSearchState(true);

    const message = {
      topic: currentSearchTopic,
      bottomLeft: {
        lon: bottomLeft[0],
        lat: bottomLeft[1]
      },
      topRight: {
        lon: topRight[0],
        lat: topRight[1]
      }
    };

    const jsonString = JSON.stringify(message);
    console.log('Sending search request:', jsonString);
    mqttPublish(jsonString);
  };

  const geocodeAndCenterMap = async (place) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json`);

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const center = fromLonLat([parseFloat(lon), parseFloat(lat)]);
        mapRef.current.getView().animate({ center, zoom: 13 });
      } else {
        console.log('No coordinates found for:', place);
      }
    } catch (error) {
      console.error('Error geocoding:', error);
    }
  };

  const addImageToMap = async (lon, lat, topics, imageBase64, id) => {
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

    mapRef.current.addOverlay(overlay);
    overlay.setPosition(fromLonLat([lon, lat]));
  };

  const handleMqttMessage = (data) => {
    setSearchState(false);
    if (Array.isArray(data)) {
      console.log('Received MQTT message:', data);
      data.forEach(item => {
        const { id, lat, lon, topics, imageBase64 } = item;
        addImageToMap(lon, lat, topics, imageBase64, id);
      });
    } else {
      console.error('Received data is not an array:', data);
    }
  };

  const getIconScale = () => {
    if (!mapRef.current) return 0.05;

    const currentZoom = mapRef.current.getView().getZoom();
    let iconScale;
    switch (true) {
      case currentZoom <= 4:
        iconScale = 0.01;
        break;
      case currentZoom <= 6:
        iconScale = 0.02;
        break;
      default:
        iconScale = 0.05;
    }
    return iconScale;
  };

  const setSearchState = (value) => {
    isSearchRef.current = value;
    setIsSearching(value);
  };

  const clearMapImages = () => {
    if (mapRef.current) {
      console.log('Clearing map images');
      const overlays = mapRef.current.getOverlays();

      overlays.clear();
    }
  };



  return (
    <div className="map-container">
      <div className="topic-researched">
        Result for: #{searchTopic}
      </div>
      <div id="map" ref={mapDivRef} className="map"></div>
      <div id='spinner' className={`spinner ${isSearching ? 'visible' : 'hidden'}`}>
        <FontAwesomeIcon icon={faCircleNotch} spin size='xl' style={{ color: '#000000' }} />
      </div>
      <div className="add-photo" onClick={() => navigate('/upload')}>
        Add Your Photo
      </div>
    </div>
  );
};

export default MapComponent;
