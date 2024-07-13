import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtilsContext } from './utilsProvider';

export const authContext = createContext(null);

export function AuthProvider({ children }) {
  const { apiRoutes, appRoutes } = useContext(UtilsContext);
  const [currentUser, setCurrentUser] = useState(() => {
    console.log('localStorage.getItem(user): ', localStorage.getItem('user'));
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });
  console.log('currentUser: ', currentUser);

  const navigate = useNavigate();

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
          return res.status;
        }
        throw new Error('Failed to login');
      }

      const data = await res.json();
      setCurrentUser(data.user);
      window.location.reload();
      return res.status;
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