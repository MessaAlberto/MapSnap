import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import { Zoom, defaults as defaultControls } from 'ol/control';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Icon, Style } from 'ol/style';
import React, { useEffect, useRef } from 'react';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'style/components/Map.scss';

const MapComponent = ({ id_user }) => {
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const lonLatCoordinates = [11.13, 46.07];

    // Initialize the vector source
    vectorSourceRef.current = new VectorSource();

    // Initialize the map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new VectorLayer({
          source: vectorSourceRef.current
        })
      ],
      view: new View({
        center: fromLonLat(lonLatCoordinates),
        zoom: 13
      }),
      controls: defaultControls({ zoom: false, rotate: false, attribution: false }).extend([
        new Zoom()
      ])
    });

    // Handle moveend event
    map.on('moveend', () => {
      console.log('Map moved');
    });

    return () => {
      map.setTarget(null);
    };
  }, []);

  const addFeatureToMap = (lon, lat, imaBase64) => {
    const iconFeature = new Feature({
      geometry: new Point(fromLonLat([lon, lat]))
    });

    const iconStyle = new Style({
      image: new Icon({
        src: `data:image/jpeg;base64,${imaBase64}`,
        scale: getIconScale()
      })
    });

    iconFeature.setStyle(iconStyle);

    vectorSourceRef.current.addFeature(iconFeature);
  };

  const getIconScale = () => {
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

  return (
    <div className="map-container">
      <div id="map" ref={mapRef} className="map"></div>
    </div>
  );
};

export default MapComponent;
