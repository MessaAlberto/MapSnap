require('dotenv').config();
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { db } = require('./database');
const { setupMQTTConnection } = require('./mqttManager');
const { setupSocketIO } = require('./socketManager');

// Initialize and start server
async function startServer() {
  try {
    // Test S3 connection
    await require('./s3Manager').testS3Connection();

    // Connect to the database
    const data = await db.query('SELECT NOW()');
    console.log('Connected to database. Current timestamp:', data[0].now);

    // Setup MQTT server connection
    const client = await setupMQTTConnection();

    // Setup Socket.IO
    setupSocketIO(io, client);

    // Start the server
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
}

startServer();
