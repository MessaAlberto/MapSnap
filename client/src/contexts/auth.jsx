import sha256 from 'crypto-js/sha256';
import React, { createContext, useEffect, useState } from 'react';
import { API_ROUTES, APP_ROUTES } from '../../constants';

export const authContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  console.log(currentUser);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(currentUser));
    setCurrentUser(null);
  }, [currentUser]);

  async function login(user) {
    try {
      const res = await fetch(API_ROUTES.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
  
      if (!res.ok) {
        throw new Error('Failed to login');
      }
  
      const data = await res.json();
      setCurrentUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Error during login:', error.message);
      throw error;
    }
  }
  

  async function register(user) {
    try {
      const hashPassword = sha256(user.password).toString();
      user.password = hashPassword;
      const res = await fetch(API_ROUTES.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.status === 422) {
        return res;
      } else if (res.status === 201) {
        return res;
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
    //localStorage.clear();
    useNavigate(appRoutes.HOME);
  }

  async function uniqueUsername(username) {
    try {
      const res = await fetch(`${API_ROUTES.CHECK_USERNAME}/${username}`);
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
      apiRoutes: API_ROUTES,
      appRoutes: APP_ROUTES,
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