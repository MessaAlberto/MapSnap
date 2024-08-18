import io from 'socket.io-client';
import { EXPRESS_SERVER_API } from './constants';

let socket;
const eventHandlers = {};

export function setupSocketConnection() {
  socket = io(EXPRESS_SERVER_API, { transports: ['websocket'] });

  socket.on('connect', () => {
    console.log('Connected to Express server socket: ', socket.id);
  });

  Object.keys(eventHandlers).forEach((event) => {
    socket.on(event, eventHandlers[event]);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log('Disconnecting socket');
    socket.disconnect();
    socket = null;
  }
}


export function registerEventHandler(event, handler) {
  if (!socket) {
    console.error('registerEventHandler: Socket not initialized. Call setupSocketConnection first.');
    return;
  }
  
  if (!eventHandlers[event]) {
    eventHandlers[event] = handler;
    socket.on(event, handler);
  }
}

export function unregisterEventHandler(event) {
  if (!socket) {
    console.error('unregisterEventHandler: Socket not initialized. Call setupSocketConnection first.');
    return;
  }

  if (eventHandlers[event]) {
    socket.off(event, eventHandlers[event]);
    delete eventHandlers[event];
  }
}


export function mapSearchRequest(message) {
  if (socket) {
    socket.emit('map_search_request', { message });
  } else {
    console.error('mapSearchRequest: Socket not initialized. Call setupSocketConnection first.');
  }
}
