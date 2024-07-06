const express = require('express');
const cors = require('cors');
const dbConfig = require('./database');
const pgp = require('pg-promise')();
const db = pgp(dbConfig);
const bcrypt = require('bcrypt');
require('dotenv').config();
const saltRounds = 10;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const query = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email],
    };

    const user = await db.oneOrNone(query);

    if (!user) {
      return res.status(401).send('Invalid credentials');
    }

    const hashPassword = await bcrypt.compare(password + user.salt, user.password);

    if (hashPassword !== user.password) {
      return res.status(401).send('Invalid credentials');
    }

    res.status(200).send('Login successful');
  } catch (err) {
    res.status(500).send('Error logging in');
    console.log('Error logging in:', err);
  }
});


app.post('/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(422).send('Email is not valid or already taken');
  }

  if (!username || !email || !password) {
    return res.status(400).send('Missing fields');
  }

  try {
    const checkquery = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email],
    };

    const existingUser = await db.oneOrNone(checkquery);

    if (existingUser) {
      return res.status(422).send('Email is not valid or already taken');
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashPassword = await bcrypt.hash(password, salt);
    const query = {
      text: 'INSERT INTO users(username, email, password, salt) VALUES($1, $2, $3, $4)',
      values: [username, email, hashPassword, salt],
    };

    await db.none(query);

    res.status(201).send('User created');
  } catch (err) {
    res.status(500).send('Error registering user');
    console.log('Error registering user:', err);
  }
});

app.get('/users/username/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    };

    const result = await db.query(query);

    if (result && result.length > 0) {
      res.status(200).send('Username exists');
    } else {
      res.status(404).send('Username does not exist');
    }
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).send('Error checking username');
  }
});

// default route
app.use((req, res) => {
  res.status(404).send('Not Found');
});



module.exports = app;
