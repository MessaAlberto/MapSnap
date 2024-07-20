const pgp = require('pg-promise')();
require('dotenv').config();

const dbConfig = {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
};

const db = pgp(dbConfig);

// Function to get a user by username
async function getUserByUsername(username) {
  try {
    const result = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
    return result;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw new Error('Database query failed');
  }
}

// Function to get a user by email
async function getUserByEmail(email) {
  try {
    const result = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    return result;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw new Error('Database query failed');
  }
}

// Function to update the refresh token
async function updateRefreshToken(userId, refreshToken) {
  try {
    await db.none('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, userId]);
  } catch (error) {
    console.error('Error updating refresh token:', error);
    throw new Error('Database update failed');
  }
}

// Function to register a user
async function registerUser(username, email, hashedPassword) {
  try {
    await db.none('INSERT INTO users(username, email, password) VALUES($1, $2, $3)', [username, email, hashedPassword]);
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error('Database insert failed');
  }
}

// Function to get the ID by username
async function getUserIdByUsername(username) {
  try {
    const result = await db.oneOrNone('SELECT id FROM users WHERE username = $1', [username]);
    return result ? result.id : null;
  } catch (error) {
    console.error('Error fetching user ID by username:', error);
    throw new Error('Database query failed');
  }
}

// Function to get the username by ID
async function getUsernameById(ownerId) {
  try {
    const result = await db.oneOrNone('SELECT username FROM users WHERE id = $1', [ownerId]);
    return result ? result.username : null;
  } catch (error) {
    console.error('Error fetching username by ID:', error);
    throw new Error('Database query failed');
  }
}

// Function to get the user by ID
async function getUserById(userId) {
  try {
    const result = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);
    return result;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw new Error('Database query failed');
  }
}



module.exports = {
  db, 
  getUserByUsername,
  getUserByEmail,
  updateRefreshToken,
  registerUser,
  getUserIdByUsername,
  getUsernameById,
  getUserById,
}
