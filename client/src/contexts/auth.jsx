import { UtilsContext } from 'contexts/utilsProvider';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const authContext = createContext(null);

export function AuthProvider({ children }) {
  const { apiRoutes, appRoutes } = useContext(UtilsContext);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token is valid on component mount
    async function checkAuth() {
      try {
        const res = await fetch(apiRoutes.CHECK_AUTH, {
          method: 'GET',
          credentials: 'include', // Ensure cookies are sent
        });

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

    checkAuth();
  }, [navigate]);


  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  async function login(user) {
    try {
      const res = await fetch(apiRoutes.LOGIN, {
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
      window.location.reload();
      return res;
    } catch (error) {
      console.error('Error during login:', error.message);
      throw error;
    }
  }


  async function register(user) {
    try {
      const res = await fetch(apiRoutes.REGISTER, {
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
    setCurrentUser(null);
    try {
      const res = await fetch(apiRoutes.LOGOUT, {
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
      const res = await fetch(`${apiRoutes.CHECK_USERNAME}/${username}`);
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