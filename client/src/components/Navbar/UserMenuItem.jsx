import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UtilsContext } from 'contexts/utilsProvider';
import React from 'react';
import { Link } from 'react-router-dom';

export default function UserMenuItem({ currentUser }) {
  const { appRoutes } = React.useContext(UtilsContext);
  const renderContent = () => {
    if (currentUser) {
      return (
        <>
          <div>
            <FontAwesomeIcon icon={faUser} size='lg' style={{ color: '#ffffff' }} />
          </div>
          <div>{currentUser.username}</div>
        </>
      );
    } else {
      return (
        <>
          <div>
            <FontAwesomeIcon icon={faUser} size='lg' style={{ color: '#ffffff' }} />
          </div>
          <div className='button-group'>
            <Link to={`${appRoutes.LOGIN}`}>
              <button className='login-button'>Login</button>
            </Link>
            <Link to={`${appRoutes.SIGNUP}`}>
              <button className='signup-button'>Sign Up</button>
            </Link>
          </div>
        </>
      );
    }
  };

  return (
    <li className='menu-item'>
      {renderContent()}
    </li>
  );
}
