const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.RAILWAY_ENVIRONMENT ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
