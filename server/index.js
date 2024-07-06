require('dotenv').config();
const http = require('http');
const app = require('./app');
const database = require('./database');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Avvio del server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Esempio di query al database
database.query('SELECT NOW()', [])
  .then(res => console.log(res.rows))
  .catch(err => console.error('Error executing query', err.stack));
