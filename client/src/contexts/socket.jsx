import React, { createContext, useEffect, useState } from 'react';
import { disconnectSocket, setupSocketConnection } from 'socketManager';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = setupSocketConnection();
    setSocket(socketInstance);

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
