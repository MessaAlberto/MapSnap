require('dotenv').config();
const mqtt = require('mqtt');
const { handleImageData } = require('./socketManager');
const { v4: uuidv4 } = require('uuid');

let mqttClient;
const pendingRequests = new Map();
let uploadStatusMap = new Map();
let deleteStatusMap = new Map();

function setupMQTTConnection() {
  mqttClient = mqtt.connect(`ws://${process.env.MQTT_BROKER_IP}:${process.env.MQTT_BROKER_PORT}`,
    {
      username: process.env.MQTT_BROKER_USER,
      password: process.env.MQTT_BROKER_PASS,
    }
  );

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('uploadConfirm');
    mqttClient.subscribe('deleteConfirm');
  });

  mqttClient.on('message', async (topic, message) => {
    console.log(`MQTT message received on topic: ${topic}`, message.toString());

    if (topic === 'uploadConfirm') {
      handleUploadConfirm(message);
    } else if (topic === 'deleteConfirm') {
      handleDeleteConfirm(message);
    }

    if (topic.includes('/images_data')) {
      handleImageData(topic, message);
    }

    const parsedMessage = JSON.parse(message.toString());

    if (topic.includes('/user/response') && pendingRequests.has(parsedMessage.requestId)) {
      const { resolve, reject, timer } = pendingRequests.get(parsedMessage.requestId);
      clearTimeout(timer);
      resolve(parsedMessage);
      pendingRequests.delete(parsedMessage.requestId);
    }
  });

  mqttClient.on('close', () => {
    console.log('MQTT client closed');
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT error:', err);
  });

  return mqttClient;
}

function handleUploadConfirm(message) {
  const { requestId, status, imageId } = JSON.parse(message.toString());
  if (uploadStatusMap.has(requestId)) {
    const { resolve, reject } = uploadStatusMap.get(requestId);
    if (status === 'good') {
      resolve({ status: 'Upload successful', imageId });
    } else {
      reject('Upload failed');
    }
    uploadStatusMap.delete(requestId);
  } else {
    console.log('Request ID not found:', requestId);
  }
}

function handleDeleteConfirm(message) {
  const { requestId, status, resultMessage } = JSON.parse(message.toString());
  if (deleteStatusMap.has(requestId)) {
    const { resolve, reject } = deleteStatusMap.get(requestId);
    if (status === 'success') {
      resolve({ status: 'Deletion successful' });
    } else {
      reject(resultMessage || 'Deletion failed');
    }
    deleteStatusMap.delete(requestId);
  } else {
    console.log('Request ID not found:', requestId);
  }
}

function publish(topic, payload) {
  return new Promise((resolve, reject) => {
    console.log(`Publishing to topic: ${topic}`);
    console.log('Payload:', payload);
    mqttClient.publish(topic, JSON.stringify(payload), (err) => {
      if (err) {
        return reject('Error publishing to MQTT');
      }
      resolve();
    });
  });
}

function mqttRequest(topic, message, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const requestId = uuidv4();
    message.requestId = requestId;

    const timer = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error('Request timeout'));
      }
    }, timeout);

    pendingRequests.set(requestId, { resolve, reject, timer });

    publish(topic, message).catch(err => {
      clearTimeout(timer);
      pendingRequests.delete(requestId);
      reject(err);
    });
  });
}

function uploadPhotoMQTT(payload) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    payload.requestId = id;
    uploadStatusMap.set(id, { resolve, reject });

    publish('uploadPhoto', payload).catch(err => {
      uploadStatusMap.delete(id);
      reject(err);
    });

    setTimeout(() => {
      if (uploadStatusMap.has(id)) {
        uploadStatusMap.delete(id);
        reject('Upload confirmation not received in time');
      }
    }, 10000); // Timeout after 10 seconds
  });

}

function removePhotoFromMQTT(imageId, userId) {
  return new Promise((resolve, reject) => {
    const requestId = uuidv4();
    deleteStatusMap.set(requestId, { resolve, reject });

    publish('deletePhoto', { imageId, userId, requestId }).catch(err => {
      deleteStatusMap.delete(requestId);
      reject(err);
    });

    setTimeout(() => {
      if (deleteStatusMap.has(requestId)) {
        deleteStatusMap.delete(requestId);
        reject('Delete confirmation not received in time');
      }
    }, 10000); // Timeout after 10 seconds
  });
}

function getImaByOwnerId(userId, socketId) {
  return publish(socketId + '/find_images', { userId });
}


module.exports = {
  getImaByOwnerId,
  uploadPhotoMQTT,
  setupMQTTConnection,
  removePhotoFromMQTT,
  publish,
  mqttRequest,
};
