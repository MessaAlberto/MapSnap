import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UtilsContext } from 'contexts/utilsProvider';
import { debounce } from 'lodash';
import Map from 'ol/Map';
import View from 'ol/View';
import { Zoom, defaults as defaultControls } from 'ol/control';
import { Tile as TileLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket, setupSocketConnection } from 'socketManager';
import { clearMapImages, geocodeAndCenterMap, sendSearchRequest } from './MapUtils';
import { addMarker } from './Marker';

import 'style/components/Map.scss';

const MapComponent = () => {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const searchTopicRef = useRef('');
  const isSearchRef = useRef(false);
  const [isSearching, setIsSearching] = useState(false);
  const { searchTopic, searchPlace, appRoutes } = useContext(UtilsContext);
  const navigate = useNavigate();

  // Setup MQTT connection only once
  useEffect(() => {
    setupSocketConnection(handleMqttMessage);
    return () => disconnectSocket();
  }, []);

  useEffect(() => {
    if (!mapDivRef.current) return;

    const initialCoordinates = [11.13, 46.07];

    const map = new Map({
      target: mapDivRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat(initialCoordinates),
        zoom: 13,
      }),
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }).extend([
        new Zoom()
      ])
    });

    mapRef.current = map;
    searchTopicRef.current = searchTopic;

    const debouncedSendSearchRequest = debounce(() => {
      setIsSearching(true);
      if (isSearchRef.current) return;
      sendSearchRequest(mapRef.current, searchTopicRef.current);
    }, 300);

    map.on('moveend', debouncedSendSearchRequest);

    return () => {
      map.setTarget(null);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    setIsSearching(true);
    searchTopicRef.current = searchTopic;
    clearMapImages(mapRef.current);
    sendSearchRequest(mapRef.current, searchTopic);
  }, [searchTopic]);

  useEffect(() => {
    if (searchPlace) {
      geocodeAndCenterMap(searchPlace, mapRef.current);
    }
  }, [searchPlace]);

  const handleMqttMessage = (data) => {
    setIsSearching(false);
    if (Array.isArray(data)) {
      data.forEach(item => {
        const { id, lat, lon, topics, imageBase64 } = item;
        addMarker(mapRef.current, lon, lat, topics, imageBase64);
      });
    }
  };

  return (
    <div className="map-container">
      {searchTopic && <div className="topic-researched">Result for: #{searchTopic}</div>}
      <div id="map" ref={mapDivRef} className="map"></div>
      <div id='spinner' className={`spinner ${isSearching ? 'visible' : 'hidden'}`}>
        <FontAwesomeIcon icon={faCircleNotch} spin size='xl' style={{ color: '#000000' }} />
      </div>
      <div className="add-photo" onClick={() => navigate(appRoutes.UPLOAD_PHOTO)}>
        Add Your Photo
      </div>
    </div>
  );
};

export default MapComponent;
