import dotenv from 'dotenv';
import io from 'socket.io-client';

dotenv.config();

const BASE_URL = 'https://demo.mapsnap.online';
const LAT_START = parseFloat(process.env.LAT_START) - 1;
const LAT_END = parseFloat(process.env.LAT_END) + 1;
const LNG_START = parseFloat(process.env.LNG_START) - 1;
const LNG_END = parseFloat(process.env.LNG_END) + 1;

const DISCONNECT_TIMEOUT = 1000000;
const EXPECTED_IMAGES = 10;
const TOPICS_PER_CLIENT = 5;
let clientsCompleted = 0;
const clients = [];
let randomResearch = true;

const topics = process.env.TOPICS.split(',');

// Function to choose 5 random topics
const chooseRandomTopics = () => {
  const shuffledTopics = topics.sort(() => 0.5 - Math.random());
  return shuffledTopics.slice(0, 5);
};

const sendMapSearchRequest = (socket) => {
  const message = {
    randomResearch: true,
    bottomLeft: { lon: LNG_START, lat: LAT_START },
    topRight: { lon: LNG_END, lat: LAT_END },
  };

  socket.emit('map_search_request', { message: JSON.stringify(message) });
  // console.log(`Client ${socket.id} sent map search request: `, message);
  console.log(`Client ${socket.id} sent map search request`);
};

const sendTopicSearchRequest = (socket, topic) => {
  const message = {
    topic: topic,
    bottomLeft: { lon: LNG_START, lat: LAT_START },
    topRight: { lon: LNG_END, lat: LAT_END },
  };

  socket.emit('map_search_request', { message: JSON.stringify(message) });
  console.log(`Client ${socket.id} sent topic search request for topic: ${topic}`);
};

const performTopicSearches = (socket, topics) => {
  topics.forEach((topic, index) => {
    setTimeout(() => {
      socket.lastTopicSearch = topic;
      socket.imageCount = 0;
      // console.log(`Client ${socket.id} performing topic search for topic: ${socket.lastTopicSearch}`);
      sendTopicSearchRequest(socket, topic);
    }, index * 5000);
  });
};

const createClient = (index, totalClients) => {
  const socket = io(BASE_URL, { transports: ['websocket'] });
  let imageCount = 0;
  let disconnectTimeout;

  socket.on('connect', () => {
    console.log(`Client ${index + 1} connected with socket ID: ${socket.id}`);
    setTimeout(() => {
      sendMapSearchRequest(socket);
    }, 1000);

    disconnectTimeout = setTimeout(() => {
      if (imageCount < EXPECTED_IMAGES) {
        console.log(`Client ${index + 1} did not receive all images in time. Disconnecting...`);
        socket.disconnect();
      }
    }, DISCONNECT_TIMEOUT);
  });

  socket.on('map_images', (data) => {
    if (randomResearch) {
      imageCount += 1;
      // console.log(`Client ${socket.id} received image ${imageCount}`);

      if (imageCount === EXPECTED_IMAGES) {
        clearTimeout(disconnectTimeout);
        // console.log(`Client ${socket.id} has received all ${EXPECTED_IMAGES} images.`);

        clientsCompleted += 1;
        console.log(`Client ${index + 1} completed. Total completed: ${clientsCompleted}/${totalClients}\n`);

        if (clientsCompleted === totalClients) {
          console.log('\n\n############################################################\n\nAll clients have successfully completed their random research!\n\n############################################################\n\n');
          randomResearch = false;
          clientsCompleted = 0;
          clients.forEach((clientSocket) => {
            const selectedTopics = chooseRandomTopics();
            console.log(`Client ${clientSocket.id} selected topics:`, selectedTopics);
            performTopicSearches(clientSocket, selectedTopics);
          });
        }
      }
    } else {
      data.forEach(image => {
        // console.log(`Topics for image ${image.imageId}:`, image.topics);
        // console.log(`Client ${socket.id} last topic search: ${socket.lastTopicSearch}`);
        if (image.topics.includes(socket.lastTopicSearch)) {
          socket.imageCount = (socket.imageCount || 0) + 1;
          // console.log(`Client ${socket.id} received image for topic ${socket.lastTopicSearch}: ${socket.imageCount}`);

          if (socket.imageCount === EXPECTED_IMAGES) {
            socket.imageCount = 0;
            socket.clientTopicsCompleted = (socket.clientTopicsCompleted || 0) + 1;
            console.log(`Client ${socket.id} has received all images for topic ${socket.lastTopicSearch}`);
            console.log(`Client ${socket.id} has completed ${socket.clientTopicsCompleted}/${TOPICS_PER_CLIENT} topics\n`);
            socket.lastTopicSearch = null;

            if (socket.clientTopicsCompleted === TOPICS_PER_CLIENT) {
              clearTimeout(disconnectTimeout);
              // console.log(`Client ${socket.id} has received all images for topic ${socket.lastTopicSearch}`);

              clientsCompleted += 1;
              console.log(`Client ${index + 1} completed. Total completed: ${clientsCompleted}/${totalClients}\n`);

              if (clientsCompleted === totalClients) {
                console.log('\n\n############################################################\n\nAll clients have successfully completed their topic research!\n\n############################################################\n\n');

                clients.forEach((clientSocket) => {
                  clientSocket.disconnect();
                });
              }
            }
          }
        }
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client ${index + 1} disconnected`);
    clearTimeout(disconnectTimeout);
  });

  socket.on('error', (error) => {
    console.error(`Client ${index + 1} encountered an error:`, error);
  });

  return socket;
};

const createClients = (numClients) => {
  for (let i = 0; i < numClients; i++) {
    const client = createClient(i, numClients);
    clients.push(client); // Store the client socket
  }
};

createClients(10);