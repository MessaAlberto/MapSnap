import Map from 'components/Map/Map';
import Navbar from 'components/Navbar/Navbar';
import { authContext } from 'contexts/auth';
import Login from 'pages/Login';
import NotFound from 'pages/NotFound';
import SignUp from 'pages/SignUp';
import UploadPhoto from 'pages/UploadPhoto';
import React, { useContext } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import 'style/App.scss';
import { UtilsContext } from './contexts/utilsProvider';

const App = () => {
  const { currentUser } = useContext(authContext);
  const { appRoutes } = useContext(UtilsContext);

  const AuthRoutes = ({ redirectTo }) => {
    // Redirect to login page if user is not authenticated
    if (!currentUser) {
      return <Navigate to={redirectTo + '?mustBeAuthenticated=true'} />;
    }
    return <Outlet />;
  }

  const OnlyUnauthRoutes = ({ redirectTo }) => {
    // Redirect to home page if user is already authenticated
    if (currentUser) {
      return <Navigate to={redirectTo} />;
    }
    return <Outlet />;
  }

  return (
    <div className='app'>
      <Navbar />
      <div className='content'>
        <Routes>
          {/* Public routes */}
          <Route path={`${appRoutes.HOME}`} element={<Map />} />

          {/* Routes accessible only when the user IS NOT logged in */}
          <Route element={<OnlyUnauthRoutes redirectTo={`${appRoutes.HOME}`} />}>
            <Route path={`${appRoutes.LOGIN}`} element={<Login />} />
            <Route path={`${appRoutes.SIGNUP}`} element={<SignUp />} />
          </Route>

          {/* Routes accessible only when the user IS logged in */}
          <Route element={<AuthRoutes redirectTo={`${appRoutes.LOGIN}`} />}>
            {/* Add your authenticated routes here */}
            <Route path={`${appRoutes.UPLOAD_PHOTO}`} element={<UploadPhoto />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;