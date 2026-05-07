const { Pool } = require('pg');

const isRailway = !!process.env.RAILWAY_ENVIRONMENT_NAME;
const dbUrl = process.env.DATABASE_URL || '';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes('railway.internal') ? false : (isRailway ? { rejectUnauthorized: false } : false),
});

module.exports = pool;
