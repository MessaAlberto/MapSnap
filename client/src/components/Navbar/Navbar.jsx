import { faHashtag, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { authContext } from 'contexts/auth';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import 'style/components/Navbar.scss';
import ImagesMenuItem from './ImagesMenuItem';
import InputMenuItem from './InputMenuItem';
import LogoutMenuItem from './LogoutMenuItem';
import MapSnapMenuItem from './MapSnapMenuItem';
import UserMenuItem from './UserMenuItem';


export default function Navbar() {
  const { currentUser } = useContext(authContext);
  const { searchTopic, setSearchTopic, searchPlace, setSearchPlace } = useContext(UtilsContext);
  const { pathname } = useLocation();

  const excludedPages = ['/login', '/signup', '/upload-photo', '/my-photo'];
  const showInputMenuItems = !excludedPages.includes(pathname);
  const showImagesMenuItem = !excludedPages.slice(0, 2).includes(pathname) && currentUser;

  return (
    <nav className="navbar">
      <ul>
        <MapSnapMenuItem />
        <UserMenuItem currentUser={currentUser} />
        {showInputMenuItems && (
          <>
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
          </>
        )}
        {showImagesMenuItem && (
          <ImagesMenuItem currentUser={currentUser} />
        )}
      </ul>
      {currentUser && (
        <ul className="logout">
          <LogoutMenuItem />
        </ul>
      )}
    </nav>
  );
}
