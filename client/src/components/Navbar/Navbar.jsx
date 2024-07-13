import { faHashtag, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { authContext } from 'contexts/auth';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { useContext } from 'react';
import 'style/components/Navbar.scss';
import ImagesMenuItem from './ImagesMenuItem';
import InputMenuItem from './InputMenuItem';
import LogoutMenuItem from './LogoutMenuItem';
import MapSnapMenuItem from './MapSnapMenuItem';
import UserMenuItem from './UserMenuItem';

export default function Navbar() {
  const { setSearchTopic, setSearchPlace } = useContext(UtilsContext);

  return (
    <authContext.Consumer>
      {({ currentUser }) => (
        <nav className="navbar">
          <ul>
            <MapSnapMenuItem />
            <UserMenuItem currentUser={currentUser} />
            <InputMenuItem
              icon={faLocationDot}
              placeholder="Places..."
              onSearchRequest={(inputValue) => {
                setSearchPlace(inputValue);
                console.log('Search requested with input:', inputValue);
              }}
            />
            <InputMenuItem
              icon={faHashtag}
              placeholder="Topics..."
              onSearchRequest={(inputValue) => {
                setSearchTopic(inputValue);
                console.log('Topic search requested with input:', inputValue);
              }}
            />
            <ImagesMenuItem currentUser={currentUser} />
          </ul>
          <ul className="logout">
            <LogoutMenuItem />
          </ul>
        </nav>
      )}
    </authContext.Consumer>
  );
}
