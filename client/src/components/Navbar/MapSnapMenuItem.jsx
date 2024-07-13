import { UtilsContext } from 'contexts/utilsProvider';
import React from 'react';
import { Link } from 'react-router-dom';

export default function MapSnapMenuItem() {
  const { appRoutes } = React.useContext(UtilsContext);
  return (
    <li className="home-item">
      <Link id='map-snap' to={appRoutes.HOME}>
      {/* <Link id='map-snap' to={appRoutes.MAP_SNAP}> */}
        <span>Map</span>
        <span>Snap</span>
      </Link>
    </li>
  );
}
