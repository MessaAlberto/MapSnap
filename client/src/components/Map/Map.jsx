import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Popup from 'components/Popup';
import { authContext } from 'contexts/auth';
import SocketContext from 'contexts/socket';
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
import { registerEventHandler, unregisterEventHandler } from 'socketManager';
import 'style/components/Map.scss';
import { geocodeAndCenterMap, sendSearchRequest } from './MapUtils';
import { addMarker, checkOverlayOverlap, clearMapImages } from './Marker';


const MapComponent = () => {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const searchTopicRef = useRef('');
  const [isSearching, setIsSearching] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const { searchTopic, searchPlace, appRoutes } = useContext(UtilsContext);
  const { currentUser } = useContext(authContext);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const handleMarkerClick = (data) => {
    setPopupData(data);
  };

  useEffect(() => {
    if (socket) {
      registerEventHandler('map_images', handleMqttMessage);

      return () => {
        unregisterEventHandler('map_images');
      };
    }
  }, [socket]);

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
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }).extend([new Zoom()])
    });

    mapRef.current = map;
    searchTopicRef.current = searchTopic;

    const debouncedSendSearchRequest = debounce(() => {
      if (searchTopicRef.current === '') {
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      sendSearchRequest(mapRef.current, searchTopicRef.current);
    }, 300);

    map.on('moveend', () => {
      debouncedSendSearchRequest();
      checkOverlayOverlap(map);
    });

    return () => {
      map.setTarget(null);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    searchTopicRef.current = searchTopic;
    if (searchTopicRef.current === '') {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
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
        const { imageId, lat, lon, owner_username, topics, imageBase64 } = item;
        addMarker(mapRef.current, imageId, lon, lat, owner_username, topics, imageBase64, handleMarkerClick);
      });
    }
  };

  const closePopup = () => {
    setPopupData(null);
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
      {popupData && <Popup data={popupData} onClose={closePopup} currentUser={currentUser} />}
    </div>
  );
};

export default MapComponent;
