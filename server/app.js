require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConfig = require('./database');
const pgp = require('pg-promise')();
const db = pgp(dbConfig);
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const secretToken = process.env.JWT_SECRET_TOKEN;
const secretRefresh = process.env.JWT_SECRET_REFRESH;
const expireToken = process.env.JWT_EXPIRE_TOKEN;
const expireRefresh = process.env.JWT_EXPIRE_REFRESH;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function verifyRefreshToken(req, res, next) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token mancante' });
  }

  try {
    const decoded = jwt.verify(refreshToken, secretRefresh);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token non valido' });
  }
}

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    };

    const user = await db.oneOrNone(query);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    const accessToken = jwt.sign({ _id: user.id }, secretToken, { expiresIn: expireToken });
    const refreshToken = jwt.sign({ _id: user.id }, secretRefresh, { expiresIn: expireRefresh });

    await db.none('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: 1000 * 60 * 15 }); // 15 minutes
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 * 7 }); // 7 days

    res.status(200).json({ user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(500).send('Error logging in');
    console.log('Error logging in:', err);
  }
});

app.post('/auth/logout', async (req, res) => {
  res.clearCookie('accessToken', { httpOnly: true, secure: true });
  res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  res.status(200).send('Logged out');
});

app.post('/auth/token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).send('A refresh token is required');
  }

  try {
    const decoded = jwt.verify(refreshToken, secretRefresh);

    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [decoded._id],
    };

    const user = await db.oneOrNone(query);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).send('Invalid refresh token');
    }

    const accessToken = jwt.sign({ _id: user.id }, secretToken, { expiresIn: expireToken });

    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).send('Invalid refresh token');
    console.error('Error verifying refresh token:', err);
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

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const query = {
      text: 'INSERT INTO users(username, email, password) VALUES($1, $2, $3)',
      values: [username, email, hashPassword],
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
