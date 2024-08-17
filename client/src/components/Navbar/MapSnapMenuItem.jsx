import { UtilsContext } from 'contexts/utilsProvider';
import React from 'react';
import { Link } from 'react-router-dom';

export default function MapSnapMenuItem({ isExpanded, setIsExpanded }) {
  const { appRoutes } = React.useContext(UtilsContext);

  const handleClick = (e) => {
    if (!isExpanded) {
      e.preventDefault();
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <li className="home-item">
      <Link id='map-snap' to={appRoutes.HOME} onClick={handleClick}>
        <span>Map</span>
        <span>Snap</span>
      </Link>
    </li>
  );
}
