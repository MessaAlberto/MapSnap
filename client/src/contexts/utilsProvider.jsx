import React, { createContext, useState } from 'react';
import { API_ROUTES, APP_ROUTES } from '../../constants';

export const UtilsContext = createContext();

export async function fetchWithSocketId(url, options = {}) {
  const socketId = localStorage.getItem('socketId');
  const headers = {
    ...options.headers,
    'x-socket-id': socketId || '',
  };

  const response = await fetch(url, { ...options, headers });
  return response;
}


export const UtilsProvider = ({ children }) => {
  const [searchTopic, setSearchTopic] = useState('');
  const [searchPlace, setSearchPlace] = useState('');
  const [searchTimestamp, setSearchTimestamp] = useState(Date.now());

  return (
    <UtilsContext.Provider value={{
      apiRoutes: API_ROUTES,
      appRoutes: APP_ROUTES,
      searchTopic,
      setSearchTopic,
      searchPlace,
      setSearchPlace,
      searchTimestamp,
      setSearchTimestamp,
      fetchWithSocketId,
    }}>
      {children}
    </UtilsContext.Provider>
  );
};
