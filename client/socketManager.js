import io from 'socket.io-client';
import { EXPRESS_SERVER_API } from './constants';

let socket;

export function setupSocketConnection(messageHandler) {
  socket = io(EXPRESS_SERVER_API, { transports: ['websocket'] });

  socket.on('connect', () => {
    console.log('Connected to Express server socket');
  });

  socket.on('mqtt_message', (data) => {
    if (messageHandler) {
      messageHandler(data);
    }
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}

export function mqttPublish(message) {
  if (socket) {
    socket.emit('mqtt_publish', { message });
  }
}
