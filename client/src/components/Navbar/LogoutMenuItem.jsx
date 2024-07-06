import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { authContext } from 'contexts/auth';
import React, { useContext } from 'react';

export default function LogoutMenuItem() {
  const { logout } = useContext(authContext);

  return (
    <li className="logout-item">
      <div>
        <button id="logout-button" onClick={logout}>
          <FontAwesomeIcon icon={faRightFromBracket} size="lg" style={{ color: '#ffffff' }} />
        </button>
      </div>
    </li>
  );
}
