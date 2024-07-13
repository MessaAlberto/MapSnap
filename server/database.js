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

module.exports = db;
