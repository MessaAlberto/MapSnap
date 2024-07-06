import { authContext } from 'contexts/auth';
import React from 'react';
import 'style/components/Navbar.scss';
import ImagesMenuItem from './ImagesMenuItem';
import LogoutMenuItem from './LogoutMenuItem';
import MapSnapMenuItem from './MapSnapMenuItem';
import SearchMenuItem from './SearchMenuItem';
import TopicsMenuItem from './TopicsMenuItem';
import UserMenuItem from './UserMenuItem';

export default function Navbar() {
  return (
    <authContext.Consumer>
      {({ currentUser }) => (
        <nav className="navbar">
          <ul>
            <MapSnapMenuItem /> {/* Add the new component here */}
            <UserMenuItem currentUser={currentUser} />
            <SearchMenuItem currentUser={currentUser} />
            <TopicsMenuItem currentUser={currentUser} />
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
