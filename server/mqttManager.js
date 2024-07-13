require('dotenv').config();
const mqtt = require('mqtt');
const { getFoldersContentsFromS3 } = require('./s3Manager');
const { v4: uuidv4 } = require('uuid');

let mqttClient;
let socketClientMap = {};

function setupMQTTConnection(io) {
  mqttClient = mqtt.connect(`ws://${process.env.MQTT_BROKER_IP}:${process.env.MQTT_BROKER_PORT}`);

  mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    setupSocketIO(io);
  });

  mqttClient.on('message', async (topic, message) => {
    console.log(`MQTT message received on topic: ${topic}`);

    let topicParts = topic.split('/');
    let socketId = topicParts[0];
    let topicName = topicParts[1];

    if (topicName === 'image_data' && socketClientMap[socketId]) {
      try {
        const data = JSON.parse(message.toString());
        const imageDataList = data.imageDataList;
        const requestId = data.requestId;
        console.log('Received image data:', imageDataList);

        const cachedImages = socketClientMap[socketId].images || {};
        const idsToFetch = imageDataList.filter(data => !cachedImages[data.id]).map(data => data.id);

        if (idsToFetch.length > 0) {
          const imageBase64Data = await getFoldersContentsFromS3(idsToFetch);
          console.log('S3 contents retrieved:' , idsToFetch);

          imageBase64Data.forEach(imageData => {
            cachedImages[imageData.id] = imageData.imageBase64;
          });

          socketClientMap[socketId].images = cachedImages;
          const combinedData = imageDataList.map(data => ({
            ...data,
            imageBase64: cachedImages[data.id] || null,
          }));

          // If the request is still valid, send the data to the client
          const lastRequestId = socketClientMap[socketId].lastRequestId;
          if (lastRequestId === requestId) {
            console.log('Sending image data to client');
            io.to(socketId).emit('mqtt_message', combinedData);
          } else {
            console.log('Request is outdated, discarding data');
          }
        } else {
          console.log('Using cached images');
          const cachedData = imageDataList.map(data => ({
            ...data,
            imageBase64: cachedImages[data.id] || null,
          }));
          io.to(socketId).emit('mqtt_message', cachedData);
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

      console.log('Received search request on topic:', parsedData.topic);

      const requestId = uuidv4();
      socketClientMap[socket.id].lastRequestId = requestId;

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
        requestId,
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


module.exports = {
  setupMQTTConnection
};
