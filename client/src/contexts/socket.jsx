import React, { createContext, useEffect, useState } from 'react';
import { disconnectSocket, setupSocketConnection } from 'socketManager';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  useEffect(() => {
    const socketInstance = setupSocketConnection();

    // Ascolta l'evento di connessione
    const handleConnect = () => {
      console.log('Connected to Express server socket: ', socketInstance.id);
      localStorage.setItem('socketId', socketInstance.id);
      setSocket(socketInstance);
      setSocketReady(true);
    };

    socketInstance.on('connect', handleConnect);

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Express server socket');
      setSocketReady(false);
      setSocket(null);
      localStorage.removeItem('socketId');
    });

    // Cleanup function
    return () => {
      socketInstance.off('connect', handleConnect);
      disconnectSocket();
      setSocket(null);
      setSocketReady(false);
      localStorage.removeItem('socketId');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketReady }}>
      {children}
    </SocketContext.Provider>
  );
};