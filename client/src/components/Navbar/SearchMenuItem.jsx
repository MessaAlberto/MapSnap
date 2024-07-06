import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export default function SearchMenuItem() {
  return (
    <li className="menu-item">
      <div>
        <FontAwesomeIcon icon={faMagnifyingGlass} size="lg" style={{ color: '#ffffff' }} />
      </div>
      <div>
        <input type="text" placeholder="Places..." className="search-input" />
      </div>
    </li>
  );
}
