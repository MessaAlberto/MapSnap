import { faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export default function ImagesMenuItem() {
  return (
    <li className="menu-item">
      <div>
        <FontAwesomeIcon icon={faImage} size="lg" style={{ color: '#ffffff' }} />
      </div>
      <div>your pics</div>
    </li>
  );
}
