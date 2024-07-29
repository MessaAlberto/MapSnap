const router = require('express').Router();
const db = require('../../database');
const bcrypt = require('bcrypt');
const ms = require('ms');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const secretToken = process.env.JWT_SECRET_TOKEN;
const secretRefresh = process.env.JWT_SECRET_REFRESH;
const expireToken = process.env.JWT_EXPIRE_TOKEN;
const expireRefresh = process.env.JWT_EXPIRE_REFRESH;
const { authenticateToken } = require('../middleware');


router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await db.getUserById(userId);
    if (user) {
      res.json({ user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.getUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    const accessToken = jwt.sign({ _id: user.id }, secretToken, { expiresIn: expireToken });
    const refreshToken = jwt.sign({ _id: user.id }, secretRefresh, { expiresIn: expireRefresh });

    await db.updateRefreshToken(user.id, refreshToken);

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, maxAge: ms(expireToken) });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, maxAge: ms(expireRefresh) });

    res.status(200).json({ user: { id: user.id, username: user.username } });
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(422).send('Email is not valid or already taken');
  }

  if (!username || !email || !password) {
    return res.status(400).send('Missing fields');
  }

  try {
    const existingUser = await db.getUserByEmail(email);

    if (existingUser) {
      return res.status(422).send('Email is not valid or already taken');
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    await db.registerUser(username, email, hashPassword);

    res.status(201).send('User created');
  } catch (err) {
    res.status(500).send('Error registering user');
    console.log('Error registering user:', err);
  }
});


module.exports = router;