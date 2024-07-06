import { faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export default function TopicsMenuItem() {
  return (
    <li className="menu-item">
      <div>
        <FontAwesomeIcon icon={faHashtag} size="lg" style={{ color: '#ffffff' }} />
      </div>
      <div>
        <input type="text" placeholder="Topics..." className="topics-input" />
      </div>
    </li>
  );
}
