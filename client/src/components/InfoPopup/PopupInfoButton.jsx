import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const PopupInfoButton = ({ isExpanded, onInfoClick }) => {

  function handleClick() {
    if (isExpanded) {
      onInfoClick();
    }
  };

  return (
    <li className="menu-item" onClick={handleClick}>
      <div className="menu-icon">
        <FontAwesomeIcon icon={faCircleInfo} size="lg" style={{ color: '#ffffff' }} />
      </div>
      <div className="menu-text">Info</div>
    </li>
  );
};

export default PopupInfoButton;
