const e = require('express');
const { getFoldersContentsFromS3 } = require('./s3Manager');

const socketClientMap = {};
let io = null;
let mqttClient = null;

function setupSocketIO(ioTosetUP, mqttClientToSetUP) {
  io = ioTosetUP;
  mqttClient = mqttClientToSetUP;

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socketClientMap[socket.id] = { images: {} };
    console.log('Active socket IDs:', Object.keys(socketClientMap));

    mqttClient.publish('userConnected', JSON.stringify({ id: socket.id }));
    mqttClient.subscribe(`${socket.id}/images_data`);
    mqttClient.subscribe(`${socket.id}/user/response`);

    socket.on('map_search_request', async (data) => {
      findImagesOnMap(socket, data);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);

      mqttClient.publish('userDisconnected', JSON.stringify({ id: socket.id }));
      mqttClient.unsubscribe(socket.id + '/images_data');
      mqttClient.unsubscribe(socket.id + '/user');
      delete socketClientMap[socket.id];
      console.log('Active socket IDs:', Object.keys(socketClientMap));
    });
  });
}

function findImagesOnMap(socket, data) {
  const parsedData = JSON.parse(data.message);
  const bottomLeft = [parsedData.bottomLeft.lon, parsedData.bottomLeft.lat];
  const topRight = [parsedData.topRight.lon, parsedData.topRight.lat];
  const randomResearch = parsedData.randomResearch;

  let request = {};
  if (randomResearch) {
    console.log('Random search request: ', randomResearch);
    request = {
      randomResearch: true,
      bottomLeft: {
        lon: bottomLeft[0],
        lat: bottomLeft[1]
      },
      topRight: {
        lon: topRight[0],
        lat: topRight[1]
      },
    };
  } else {
    console.log('Search request: ', parsedData.topic);
    const topic = parsedData.topic.toLowerCase();
    socketClientMap[socket.id].lastTopic = topic.toLowerCase();

    // const expandedCoordinates = expandCoordinates(bottomLeft, topRight);
    // const request = {
    //   topic: topic,
    //   bottomLeft: {
    //     lon: expandedCoordinates.bottomLeft[0],
    //     lat: expandedCoordinates.bottomLeft[1]
    //   },
    //   topRight: {
    //     lon: expandedCoordinates.topRight[0],
    //     lat: expandedCoordinates.topRight[1]
    //   },
    // };

    request = {
      topic: topic,
      bottomLeft: {
        lon: bottomLeft[0],
        lat: bottomLeft[1]
      },
      topRight: {
        lon: topRight[0],
        lat: topRight[1]
      },
    };
  }

  const jsonString = JSON.stringify(request);
  console.log('MQTT publish, on topic:', socket.id + '/find_images');
  mqttClient.publish(`${socket.id}/find_images`, jsonString);
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

async function handleImageData(topic, message) {
  let topicParts = topic.split('/');
  let socketId = topicParts[0];
  let data = JSON.parse(message.toString());

  if (!topicParts[1] === 'images_data' || !socketClientMap[socketId]) {
    console.error('Invalid images_data topic:', topic);
    return;
  }

  try {
    let imageDataList = data.imageDataList;
    let emitEvent = '';

    if (data.searchedForMap || data.searchedForRandom) {
      emitEvent = 'map_images';
    } else {
      emitEvent = 'images_data';
    }
    console.log('Emit event:', emitEvent);

    if (imageDataList.length === 0) {
      console.log('No image data found');
      io.to(socketId).emit(emitEvent, []);
      return;
    }

    const cachedImages = socketClientMap[socketId].images || {};
    const completeCachedData = [];
    const idsToFetch = [];

    imageDataList.forEach(data => {
      const cachedImage = cachedImages[data.imageId];
      if (cachedImage) {
        if (cachedImage.imageBase64) {
          completeCachedData.push({
            ...data,
            imageBase64: cachedImage.imageBase64
          });
        }
      } else {
        idsToFetch.push(data.imageId);
      }
    });

    if (completeCachedData.length > 0) {
      console.log('Sending cached images:', completeCachedData.length);
      if (data.searchedForMap) {
        const lastTopic = socketClientMap[socketId].lastTopic;
        const filteredCachedData = completeCachedData.filter(data =>
          data.topics.some(topic => topic.includes(lastTopic))
        );
        io.to(socketId).emit(emitEvent, filteredCachedData);
        console.log('imagesId:', filteredCachedData.map(data => data = data.imageId));
      } else {
        io.to(socketId).emit(emitEvent, completeCachedData);
        console.log('imagesId:', completeCachedData.map(data => data = data.imageId));
      }
    }

    if (idsToFetch.length > 0) {
      await getFoldersContentsFromS3(idsToFetch, (imageData) => {
        cachedImages[imageData.id] = {
          ...cachedImages[imageData.id],
          imageBase64: imageData.imageBase64
        };

        const updatedData = imageDataList
          .filter(data => data.imageId === imageData.id)
          .map(data => ({
            ...data,
            imageBase64: imageData.imageBase64
          }));

        if (data.searchedForMap) {
          const lastTopic = socketClientMap[socketId].lastTopic;
          const filteredData = updatedData.filter(data =>
            data.topics.some(topic => topic.includes(lastTopic))
          );
          io.to(socketId).emit(emitEvent, filteredData);
          console.log('imagesId filtered:', filteredData.map(data => data = data.imageId));
        } else {
          io.to(socketId).emit(emitEvent, updatedData);
          console.log('imagesId updated:', updatedData.map(data => data = data.imageId));
        }

        // const combinedData = imageDataList.map(data => ({
        //   ...data,
        //   imageBase64: cachedImages[data.imageId]?.imageBase64 || null,
        //   owner_username: cachedImages[data.imageId]?.owner_username || null
        // }));

        // const emitEvent = data.searchedForMap ? 'map_images' : 'images_data';
        // if (data.searchedForMap) {
        //   const lastTopic = socketClientMap[socketId].lastTopic;
        //   const filteredData = combinedData.filter(data =>
        //     data.topics.some(topic => topic.includes(lastTopic))
        //   io.to(socketId).emit(emitEvent, filteredData);
        // } else {
        //   io.to(socketId).emit(emitEvent, combinedData);
        // }
      });

      socketClientMap[socketId].images = cachedImages;
    }
  } catch (error) {
    console.error('Error processing images_data message:', error);
  }
}


module.exports = {
  socketClientMap,
  setupSocketIO,
  handleImageData,
};
