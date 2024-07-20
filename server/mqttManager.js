require('dotenv').config();
const mqtt = require('mqtt');
const { getFoldersContentsFromS3 } = require('./s3Manager');
const { getUsernameById } = require('./database');
const { v4: uuidv4 } = require('uuid');

let mqttClient;
let socketClientMap = {};
let uploadStatusMap = new Map();
let deleteStatusMap = new Map();

function setupMQTTConnection(io) {
  mqttClient = mqtt.connect(`ws://${process.env.MQTT_BROKER_IP}:${process.env.MQTT_BROKER_PORT}`);

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('uploadConfirm');
    mqttClient.subscribe('deleteConfirm');
    setupSocketIO(io);
  });

  mqttClient.on('message', async (topic, message) => {
    console.log(`MQTT message received on topic: ${topic}`);

    if (topic === 'uploadConfirm') {
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

    if (topic === 'deleteConfirm') {
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

    let topicParts = topic.split('/');
    let socketId = topicParts[0];
    let topicName = topicParts[1];

    if (topicName === 'image_data' && socketClientMap[socketId]) {
      try {
        const data = JSON.parse(message.toString());
        let imageDataList = data.imageDataList;
        if (imageDataList.length === 0) {
          console.log('No image data found');
          io.to(socketId).emit('mqtt_message', []);
          return;
        }

        const cachedImages = socketClientMap[socketId].images || {};
        const completeCachedData = [];
        const idsToFetch = [];

        imageDataList.forEach(data => {
          const cachedImage = cachedImages[data.imageId];
          if (cachedImage) {
            if (cachedImage.owner_username && cachedImage.imageBase64) {
              completeCachedData.push({
                ...data,
                imageBase64: cachedImage.imageBase64,
                owner_username: cachedImage.owner_username
              });
            }
          } else {
            idsToFetch.push(data.imageId);
          }
        });

        if (completeCachedData.length > 0) {
          console.log('Sending cached images:', completeCachedData.length);
          const lastTopic = socketClientMap[socketId].lastTopic;
          const filteredCachedData = completeCachedData.filter(data => data.topics.includes(lastTopic));
          io.to(socketId).emit('mqtt_message', filteredCachedData);
        }

        if (idsToFetch.length > 0) {
          const [imageBase64Data, userPromises] = await Promise.all([
            getFoldersContentsFromS3(idsToFetch),
            Promise.all(idsToFetch.map(async (imageId) => {
              const data = imageDataList.find(data => data.imageId === imageId);
              if (!cachedImages[imageId]?.owner_username) {
                const owner_username = await getUsernameById(data.ownerId);
                cachedImages[imageId] = {
                  ...cachedImages[imageId],
                  owner_username
                };
              }
              return data;
            }))
          ]);

          imageBase64Data.forEach(imageData => {
            cachedImages[imageData.id] = {
              ...cachedImages[imageData.id],
              imageBase64: imageData.imageBase64
            };
          });

          const lastTopic = socketClientMap[socketId].lastTopic;
          const filteredDataList = imageDataList.filter(data => data.topics.includes(lastTopic));

          const combinedData = filteredDataList.map(data => ({
            ...data,
            imageBase64: cachedImages[data.imageId]?.imageBase64 || null,
            owner_username: cachedImages[data.imageId]?.owner_username || null
          }));

          socketClientMap[socketId].images = cachedImages;
          console.log('Sending image data:', combinedData.length);
          io.to(socketId).emit('mqtt_message', combinedData);
        }
      } catch (error) {
        console.error('Error processing image_data message:', error);
      }
    }
  });

  mqttClient.on('close', () => {
    console.log('MQTT client closed');
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT error:', err);
  });
}

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    mqttClient.publish('userConnected', JSON.stringify({ id: socket.id }));
    mqttClient.subscribe(socket.id + '/image_data');

    socketClientMap[socket.id] = { images: {} };

    socket.on('mqtt_publish', (data) => {
      const parsedData = JSON.parse(data.message);
      const bottomLeft = [parsedData.bottomLeft.lon, parsedData.bottomLeft.lat];
      const topRight = [parsedData.topRight.lon, parsedData.topRight.lat];
      const topic = parsedData.topic;

      console.log('Received search request on topic:', parsedData.topic);
      socketClientMap[socket.id].lastTopic = topic;

      // Expand the search area
      const expandedCoordinates = expandCoordinates(bottomLeft, topRight);
      const request = {
        topic: parsedData.topic,
        bottomLeft: {
          lon: expandedCoordinates.bottomLeft[0],
          lat: expandedCoordinates.bottomLeft[1]
        },
        topRight: {
          lon: expandedCoordinates.topRight[0],
          lat: expandedCoordinates.topRight[1]
        },
      };

      const jsonString = JSON.stringify(request);
      console.log('MQTT publish, on topic:', socket.id + '/find_images');
      mqttClient.publish(`${socket.id}/find_images`, jsonString);
    });


    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);

      mqttClient.publish('userDisconnected', JSON.stringify({ id: socket.id }));
      mqttClient.unsubscribe(socket.id + '/image_data');
      delete socketClientMap[socket.id];
      console.log('Active socket IDs:', Object.keys(socketClientMap));
    });
  });
}

function expandCoordinates(bottomLeft, topRight) {
  const [bottomLeftLon, bottomLeftLat] = bottomLeft;
  const [topRightLon, topRightLat] = topRight;

  const width = topRightLon - bottomLeftLon;
  const height = topRightLat - bottomLeftLat;

  return {
    bottomLeft: [bottomLeftLon - 2 * width, bottomLeftLat - 2 * height],
    topRight: [topRightLon + 2 * width, topRightLat + 2 * height]
  };
}

function uploadPhotoMQTT(payload) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    payload.requestId = id;
    uploadStatusMap.set(id, { resolve, reject });

    mqttClient.publish('uploadPhoto', JSON.stringify(payload), (err) => {
      if (err) {
        uploadStatusMap.delete(id);
        return reject('Error publishing to MQTT');
      }

      // Set a timeout to handle cases where the confirmation is not received
      setTimeout(() => {
        if (uploadStatusMap.has(id)) {
          uploadStatusMap.delete(id);
          reject('Upload confirmation not received in time');
        }
      }, 10000); // Timeout after 10 seconds
    });
  });
}

function removePhotoFromMQTT(imageId) {
  return new Promise((resolve, reject) => {
    const requestId = uuidv4();
    deleteStatusMap.set(requestId, { resolve, reject });

    mqttClient.publish('deletePhoto', JSON.stringify({ imageId, requestId }), (err) => {
      if (err) {
        deleteStatusMap.delete(requestId);
        return reject('Error publishing to MQTT');
      }

      // Set a timeout to handle cases where the confirmation is not received
      setTimeout(() => {
        if (deleteStatusMap.has(requestId)) {
          deleteStatusMap.delete(requestId);
          reject('Delete confirmation not received in time');
        }
      }, 10000); // Timeout after 10 seconds
    });
  });
}



module.exports = {
  uploadPhotoMQTT,
  setupMQTTConnection,
  removePhotoFromMQTT,
};
