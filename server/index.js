require('dotenv').config();
const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { db } = require('./database');
const { setupMQTTConnection } = require('./mqttManager');
const { testS3Connection } = require('./s3Manager');

// Test S3 connection
testS3Connection();

// Setup MQTT server connection
setupMQTTConnection(io);

// Connect to the database
db.query('SELECT NOW()')
  .then(data => {
    console.log('Connected to database. Current timestamp:', data[0].now);
  })
  .catch(error => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  });

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});