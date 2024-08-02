import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UtilsContext } from 'contexts/utilsProvider';
import React from 'react';
import { Link } from 'react-router-dom';

export default function ImagesMenuItem() {
  const { appRoutes } = React.useContext(UtilsContext);

  return (
    <li className="menu-item">
      <Link to={`${appRoutes.MY_PHOTO}`} className="menu-link">
        <div className="menu-icon">
          <FontAwesomeIcon icon={faImage} size="lg" style={{ color: '#ffffff' }} />
        </div>
        <div className="menu-text">See your pics</div>
      </Link>
    </li>
  );
}
