import { faHashtag, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { authContext } from 'contexts/auth';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import 'style/components/Navbar.scss';
import PopupInfoButton from '../InfoPopup/PopupInfoButton';
import ImagesMenuItem from './ImagesMenuItem';
import InputMenuItem from './InputMenuItem';
import LogoutMenuItem from './LogoutMenuItem';
import MapSnapMenuItem from './MapSnapMenuItem';
import UserMenuItem from './UserMenuItem';

export default function Navbar({ onInfoClick }) {
  const { currentUser } = useContext(authContext);
  const { appRoutes } = useContext(UtilsContext);
  const { searchTopic, setSearchTopic, searchPlace, setSearchPlace, setSearchTimestamp } = useContext(UtilsContext);
  const { pathname } = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const excludedPages = [appRoutes.LOGIN, appRoutes.SIGNUP, appRoutes.UPLOAD_PHOTO, appRoutes.MY_PHOTO];
  const showInputMenuItems = !excludedPages.includes(pathname);
  const showImagesMenuItem = !excludedPages.slice(0, 2).includes(pathname);

  const handleMouseEnter = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleLinkClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      e.preventDefault();
    }
  };

  const handleSearchRequest = (setter) => (inputValue) => {
    setIsExpanded(false);
    setter(inputValue);
    setSearchTimestamp(Date.now());
  };

  const handleInfoClick = () => {
    onInfoClick();
    setIsExpanded(false);
  };

  return (
    <nav
      className={`navbar ${isExpanded ? 'navbar-expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleLinkClick}
    >
      <ul>
        <MapSnapMenuItem isExpanded={isExpanded} setIsExpanded={setIsExpanded}/>
        <UserMenuItem currentUser={currentUser} />
        {showInputMenuItems && (
          <>
            <InputMenuItem
              icon={faLocationDot}
              placeholder="Places..."
              onSearchRequest={handleSearchRequest(setSearchPlace)}
            />
            <InputMenuItem
              icon={faHashtag}
              placeholder="Topics..."
              onSearchRequest={handleSearchRequest(setSearchTopic)}
            />
          </>
        )}
        {showImagesMenuItem && <ImagesMenuItem isExpanded={isExpanded} setIsExpanded={setIsExpanded} />}
        <PopupInfoButton isExpanded={isExpanded} onInfoClick={handleInfoClick}  />
      </ul>
      {currentUser && (
        <ul className="logout">
          <LogoutMenuItem isExpanded={isExpanded} setIsExpanded={setIsExpanded}/>
        </ul>
      )}
    </nav>
  );
}
