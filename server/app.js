require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authURL = require('./app/authentication/auth');
const userURL = require('./app/entities/user');



app.use('/auth', authURL);
app.use('/user', userURL);



// default route
app.use((req, res) => {
  res.status(404).send('Not Found');
});



module.exports = app;
