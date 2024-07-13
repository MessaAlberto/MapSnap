import React, { createContext, useState } from 'react';
import { API_ROUTES, APP_ROUTES } from '../../constants';

export const UtilsContext = createContext();

export const UtilsProvider = ({ children }) => {
  const [searchTopic, setSearchTopic] = useState('');
  const [searchPlace, setSearchPlace] = useState('');

  return (
    <UtilsContext.Provider value={{
      apiRoutes: API_ROUTES,
      appRoutes: APP_ROUTES,
      searchTopic,
      setSearchTopic,
      searchPlace,
      setSearchPlace
    }}>
      {children}
    </UtilsContext.Provider>
  );
};
