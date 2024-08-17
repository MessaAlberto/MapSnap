import { SocketContext } from 'contexts/socket';
import { UtilsContext } from 'contexts/utilsProvider';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const authContext = createContext(null);

export function AuthProvider({ children }) {
  const { apiRoutes, appRoutes, fetchWithSocketId } = useContext(UtilsContext);
  const { socketReady } = useContext(SocketContext);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token is valid on component mount
    async function checkAuth() {
      try {
        console.log('Make auth request:', localStorage.getItem('socketId'));
        const res = await fetchWithSocketId(apiRoutes.CHECK_AUTH, {
          method: 'GET',
          headers: { 'x-socket-id': localStorage.getItem('socketId') },
          credentials: 'include', // Ensure cookies are sent
        });

        console.log('Auth response:', res);
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          if (localStorage.getItem('user')) {
            alert('Your session has expired. Please log in again.');
            navigate(appRoutes.LOGIN);
          }
          localStorage.removeItem('user');
          setCurrentUser(null);
          console.error('Failed to check authentication:', res.status);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        logout(); // Error occurred, force logout
      }
    }

    if (socketReady)
      checkAuth();
    
    return () => {
    };
  }, [navigate, socketReady]);


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  async function login(user) {
    try {
      const res = await fetchWithSocketId(apiRoutes.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        if (res.status === 401) {
          return res;
        }
        throw new Error('Failed to login');
      }

      const data = await res.json();
      setCurrentUser(data.user);
      return res;
    } catch (error) {
      console.error('Error during login:', error.message);
      throw error;
    }
  }


  async function register(user) {
    try {
      const res = await fetchWithSocketId(apiRoutes.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.status === 422) {
        return res;
      } else if (res.status === 201) {
        navigate(appRoutes.LOGIN + '?success=true');
        return;
      } else {
        throw new Error('Error registering user');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  async function logout() {
    console.log('currentUser:', currentUser);
    setCurrentUser(null);
    console.log('currentUser:', currentUser);
    try {
      const res = await fetchWithSocketId(apiRoutes.LOGOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Failed to logout');
      }
      alert('You have been logged out');
      window.location.reload();
    } catch (error) {
      console.error('Error during logout:', error.message);
      throw error;
    }
  }

  async function uniqueUsername(username) {
    try {
      const res = await fetchWithSocketId(`${apiRoutes.CHECK_USERNAME}/${username}`);
      if (res.status === 404) {
        return true;
      } else if (res.status === 200) {
        return false;
      } else {
        throw new Error('Error checking username');
      }
    } catch (error) {
      console.error('Error checking username:', error);
    }
  };

  return (
    <authContext.Provider value={{
      currentUser,
      login,
      register,
      logout,
      uniqueUsername
    }}>
      {children}
    </authContext.Provider>
  );
}