require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const { authenticateToken } = require('./app/middleware');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authURL = require('./app/authentication/auth');
const userURL = require('./app/entities/user');
const photoURL = require('./app/entities/photo');

app.use('/auth', authURL);
app.use('/user', userURL);
app.use('/photo', authenticateToken, photoURL);

// Uncomment the following lines to serve frontend as static files
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// Default route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

// default route
app.use((req, res) => {
  res.status(404).send('Not Found');
});



module.exports = app;
