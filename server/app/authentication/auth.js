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

router.post('/login', async (req, res) => {
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


module.exports = router;