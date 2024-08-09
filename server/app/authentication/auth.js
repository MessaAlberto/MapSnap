const router = require('express').Router();
const bcrypt = require('bcrypt');
const ms = require('ms');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secretToken = process.env.JWT_SECRET_TOKEN;
const secretRefresh = process.env.JWT_SECRET_REFRESH;
const expireToken = process.env.JWT_EXPIRE_TOKEN;
const expireRefresh = process.env.JWT_EXPIRE_REFRESH;
const { authenticateToken } = require('../middleware');
const { mqttRequest } = require('../../mqttManager');


router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user._id;
  const socketId = req.headers['x-socket-id'];
  console.log('socketId:', socketId);

  try {
    // const user = await db.getUserById(userId);
    const mqttResponse = await mqttRequest(`${socketId}/user`, { req: 'getUsernameById', id_usr: userId });
    if (mqttResponse.username) {
      res.status(200).json({ user: { id: userId, username: mqttResponse.username } });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
    console.error('Error:', error);
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const socketId = req.headers['x-socket-id'];

  try {
    // const user = await db.getUserByUsername(username);
    const user = await mqttRequest(`${socketId}/user`, { req: 'getUserByUsername', username });
    console.log('User:', user);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    const accessToken = jwt.sign({ _id: user.id_usr }, secretToken, { expiresIn: expireToken });
    const refreshToken = jwt.sign({ _id: user.id_usr }, secretRefresh, { expiresIn: expireRefresh });

    // await db.updateRefreshToken(user.id, refreshToken);
    const mqttResponse  = await mqttRequest(`${socketId}/user`, { req: 'updateRefreshToken', id_usr: user.id_usr, refreshToken });

    if (!mqttResponse || mqttResponse.status !== 'success') {
      console.log('Error updating refresh token');
      return res.status(500).send('Error updating refresh token');
    }

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: false, maxAge: ms(expireToken) });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: false, maxAge: ms(expireRefresh) });

    res.status(200).json({ user: { id: user.id_usr, username: user.username } });
  } catch (err) {
    res.status(500).send('Error logging in');
    console.log('Error logging in:', err);
  }
});

router.post('/logout', async (req, res) => {
  res.clearCookie('accessToken', { httpOnly: true, secure: true });
  res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  res.status(200).send('Logged out');
});


router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const socketId = req.headers['x-socket-id'];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(422).send('Email is not valid or already taken');
  }

  if (!username || !email || !password) {
    return res.status(400).send('Missing fields');
  }

  try {
    // const existingUser = await db.getUserByEmail(email);
    const existingUser = await mqttRequest(`${socketId}/user`, { req: 'getUserByEmail', email });

    if (existingUser.status && existingUser.status !== 'not_found') {
      return res.status(420).send('Email is not valid or already taken');
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    // await db.registerUser(username, email, hashPassword);
    const result = await mqttRequest(`${socketId}/user`, { req: 'registerUser', username, email, password: hashPassword });

    console.log('Result:', result);
    if (result && result.status !== 'success') {
      return res.status(500).send('Error registering user');
    }

    res.status(201).send('User created');
  } catch (err) {
    res.status(500).send('Error registering user');
    console.log('Error registering user:', err);
  }
});


module.exports = router;