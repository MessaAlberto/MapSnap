import { faCircleNotch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddPhotoButton from 'components/AddPhotoButton';
import Popup from 'components/Popup';
import { authContext } from 'contexts/auth';
import { SocketContext } from 'contexts/socket';
import { UtilsContext } from 'contexts/utilsProvider';
import { debounce } from 'lodash';
import Map from 'ol/Map';
import View from 'ol/View';
import { Zoom, defaults as defaultControls } from 'ol/control';
import { Tile as TileLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { OSM } from 'ol/source';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerEventHandler, unregisterEventHandler } from 'socketManager';
import 'style/components/Map.scss';
import { geocodeAndCenterMap, sendRandomSearchRequest, sendSearchRequest } from './MapUtils';
import { addMarker, checkOverlayOverlap, clearMapImages } from './Marker';


const MapComponent = () => {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const searchTopicRef = useRef('');
  const [isSearching, setIsSearching] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [noPhotosMessage, setNoPhotosMessage] = useState('');
  const { searchTopic, setSearchTopic, searchPlace, setSearchPlace, searchTimestamp, appRoutes } = useContext(UtilsContext);
  const { currentUser } = useContext(authContext);
  const socket = useContext(SocketContext);
  const location = useLocation();
  const navigate = useNavigate();

  const refreshMap = () => {
    clearMapImages(mapRef.current);
    sendSearchRequest(mapRef.current, searchTopic);
  };

  const handleMarkerClick = (data) => {
    console.log('Marker clicked:', data);
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

    clearMapImages(mapRef.current);

    const debouncedSendSearchRequest = debounce(() => {
      if (searchTopicRef.current === '') {
        setIsSearching(false);
        return;
      }
      console.log('Sending search request');
      setIsSearching(true);
      sendSearchRequest(mapRef.current, searchTopicRef.current);
    }, 300);

    map.on('moveend', () => {
      debouncedSendSearchRequest();
      checkOverlayOverlap(map);
    });

    if (location.state && location.state.photo) {
      const { photo } = location.state;
      const coordinates = fromLonLat([photo.lon, photo.lat]);
      map.getView().animate({ center: coordinates, zoom: 15 });

      addMarker(map, photo.imageId, photo.lon, photo.lat, photo.owner_username, photo.topics, photo.imageBase64, handleMarkerClick);
      navigate(location.pathname, { replace: true });;
    }

    return () => {
      map.setTarget(null);
      mapRef.current = null;
      setSearchTopic('');
      searchTopicRef.current = '';
      setIsSearching(false);
      setPopupData(null);
      setNoPhotosMessage('');
    };
  }, []);

  useEffect(() => {
    searchTopicRef.current = searchTopic;
    if (searchTopicRef.current === '') {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    refreshMap();
  }, [searchTopic, searchTimestamp]);

  useEffect(() => {
    if (searchPlace) {
      geocodeAndCenterMap(searchPlace, mapRef.current);
      setSearchPlace('');
    }
  }, [searchPlace, searchTimestamp]);

  const handleMqttMessage = (data) => {
    setIsSearching(false);
    if (Array.isArray(data)) {
      if (data.length === 0) {
        setNoPhotosMessage('No photos found');
        setTimeout(() => setNoPhotosMessage(''), 1000);
        return;
      }

      data.forEach(item => {
        const { imageId, lat, lon, owner_username, topics, imageBase64 } = item;
        addMarker(mapRef.current, imageId, lon, lat, owner_username, topics, imageBase64, handleMarkerClick);
      });
    }
  };

  const closePopup = () => {
    setPopupData(null);
  };

  const clearSearchTopic = () => {
    setSearchTopic('');
    clearMapImages(mapRef.current);
  };

  const handleRandomSearchClick = () => {
    console.log('Random search request');
    setIsSearching(true);
    clearMapImages(mapRef.current);
    sendRandomSearchRequest(mapRef.current);
  };

  return (
    <div className="map-container">
      {searchTopic ? (
        <div className="topic-researched">
          Result for: #{searchTopic}
          <button className="clear-topic-button" onClick={clearSearchTopic}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ) : (
        <div className="random-research-container">
          <span>Random Research</span>
          <button onClick={handleRandomSearchClick} className="toggle-button">
            Send
          </button>
        </div>
      )}
      <div id="map" ref={mapDivRef} className="map"></div>
      <div id='spinner' className={`spinner ${isSearching ? 'visible' : 'hidden'}`}>
        <FontAwesomeIcon icon={faCircleNotch} spin size='xl' style={{ color: '#000000' }} />
      </div>
      <AddPhotoButton returnTo={appRoutes.HOME} />
      {popupData &&
        <Popup
          data={popupData}
          onClose={closePopup}
          currentUser={currentUser}
          onDeleteSuccess={refreshMap}
        />
      }

      {noPhotosMessage && <div className="no-photos-message">{noPhotosMessage}</div>}
    </div>
  );
};

export default MapComponent;
