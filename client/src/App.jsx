import InfoPopup from 'components/InfoPopup/InfoPopup';
import Map from 'components/Map/Map';
import Navbar from 'components/Navbar/Navbar';
import { authContext } from 'contexts/auth';
import { UtilsContext } from 'contexts/utilsProvider';
import Login from 'pages/Login';
import MyPhoto from 'pages/MyPhoto';
import NotFound from 'pages/NotFound';
import SignUp from 'pages/SignUp';
import UploadPhoto from 'pages/UploadPhoto';
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import 'style/App.scss';

const App = () => {
  const { currentUser } = useContext(authContext);
  const { appRoutes } = useContext(UtilsContext);
  const { pathname } = useLocation();
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false);

  const handleTogglePopup = () => {
    setIsInfoPopupOpen(!isInfoPopupOpen);
  };

  useEffect(() => {
    setIsInfoPopupOpen(false);
  }, [pathname]);

  return (
    <div className='app'>
      <Navbar onInfoClick={handleTogglePopup} />
      <div className='content'>
        <Routes>
          {/* Public routes */}
          <Route path={`${appRoutes.HOME}`} element={<Map />} />

          {/* Unauthenticated routes */}
          <Route path={`${appRoutes.LOGIN}`} element={currentUser ? <Navigate to={`${appRoutes.HOME}`} /> : <Login />} />
          <Route path={`${appRoutes.SIGNUP}`} element={currentUser ? <Navigate to={`${appRoutes.HOME}`} /> : <SignUp />} />

          {/* Authenticated routes */}
          <Route path={`${appRoutes.UPLOAD_PHOTO}`} element={currentUser ? <UploadPhoto /> : <Navigate to={`${appRoutes.LOGIN}`} />} />
          <Route path={`${appRoutes.MY_PHOTO}`} element={currentUser ? <MyPhoto /> : <Navigate to={`${appRoutes.LOGIN}`} />} />

          {/* Catch-all route for 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
      {isInfoPopupOpen && <InfoPopup pathname={pathname} onClose={handleTogglePopup} />}
    </div>
  );
}

export default App;