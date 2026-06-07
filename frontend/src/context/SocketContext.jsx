import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketUrl =
      process.env.REACT_APP_SOCKET_URL ||
      (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

    const socketClient = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(socketClient);

    socketClient.on('connect', () => console.log('Socket connected'));
    socketClient.on('disconnect', () => console.log('Socket disconnected'));

    return () => {
      socketClient.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
