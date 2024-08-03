require('dotenv').config();
const mqtt = require('mqtt');
const { handleImageData } = require('./socketManager');
const { v4: uuidv4 } = require('uuid');

let mqttClient;
let uploadStatusMap = new Map();
let deleteStatusMap = new Map();

function getImaByOwnerId(userId, socketId) {
  return publish(socketId + '/find_images', { userId });
}

function setupMQTTConnection() {
  mqttClient = mqtt.connect(`ws://${process.env.MQTT_BROKER_IP}:${process.env.MQTT_BROKER_PORT}`);

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('uploadConfirm');
    mqttClient.subscribe('deleteConfirm');
  });

  mqttClient.on('message', async (topic, message) => {
    console.log(`MQTT message received on topic: ${topic}`);

    if (topic === 'uploadConfirm') {
      handleUploadConfirm(message);
    } else if (topic === 'deleteConfirm') {
      handleDeleteConfirm(message);
    }

    if (topic.includes('/images_data')) {
      handleImageData(topic, message);
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
    mqttClient.publish(topic, JSON.stringify(payload), (err) => {
      if (err) {
        return reject('Error publishing to MQTT');
      }
      resolve();
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



module.exports = {
  getImaByOwnerId,
  uploadPhotoMQTT,
  setupMQTTConnection,
  removePhotoFromMQTT,
};
