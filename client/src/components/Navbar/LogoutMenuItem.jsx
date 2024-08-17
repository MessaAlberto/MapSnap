import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { authContext } from 'contexts/auth';
import React, { useContext } from 'react';

export default function LogoutMenuItem({ isExpanded, setIsExpanded }) {
  const { logout } = useContext(authContext);

  const handleClick = () => {
    if (isExpanded) {
      logout();
    } else {
      setIsExpanded(false);
    }
  };

  return (
    <li className="logout-item" onClick={handleClick}>
      <div>
        <button id="logout-button">
          <FontAwesomeIcon icon={faRightFromBracket} size="lg" style={{ color: '#ffffff' }} />
        </button>
      </div>
    </li>
  );
}
