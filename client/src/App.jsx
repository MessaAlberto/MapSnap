import Map from 'components/Map';
import Navbar from 'components/Navbar/Navbar';
import { authContext } from 'contexts/auth';
import Login from 'pages/Login';
import SignUp from 'pages/SignUp';
import React, { useContext } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import 'style/App.scss';
import { UtilsContext } from './contexts/utilsProvider';

export default function App() {
  const { currentUser } = useContext(authContext);
  const { appRoutes } = useContext(UtilsContext);

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
            <Route path='/protected-route-1' element={<ProtectedRoute1 />} />
            <Route path='/protected-route-2' element={<ProtectedRoute2 />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function AuthRoutes({ redirectTo }) {
  const { currentUser } = useContext(authContext);

  // Redirect to login page if user is not authenticated
  if (!currentUser) {
    return <Navigate to={redirectTo} />;
  }

  return <Outlet />;
}

function OnlyUnauthRoutes({ redirectTo }) {
  const { currentUser } = useContext(authContext);

  // Redirect to home page if user is already authenticated
  if (currentUser) {
    return <Navigate to={redirectTo} />;
  }

  return <Outlet />;
}

// Example components for authenticated routes
function ProtectedRoute1() {
  return <h2>Protected Route 1</h2>;
}

function ProtectedRoute2() {
  return <h2>Protected Route 2</h2>;
}

function NotFound() {
  return <h2>404 Not Found</h2>;
}
