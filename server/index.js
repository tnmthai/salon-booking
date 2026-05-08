const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// DB schema (multi-tenant)
const dropOld = `
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS staff_services CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS salons CASCADE;
`;

const schema = `
CREATE TABLE IF NOT EXISTS salons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  logo_url TEXT,
  description TEXT,
  opening_hour INTEGER DEFAULT 9,
  closing_hour INTEGER DEFAULT 18,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email)
);
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id),
  staff_id INTEGER REFERENCES staff(id),
  service_id INTEGER REFERENCES services(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_salon ON staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_customers_salon ON customers(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_salon ON appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug);
`;

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/customers', require('./routes/customers'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.json({ status: 'error', db: err.message });
  }
});

// List all salons (public)
app.get('/api/salons', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, slug, address, phone, description FROM salons ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get salon by slug (public)
app.get('/api/salons/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, slug, address, phone, email, description, opening_hour, closing_hour FROM salons WHERE slug = $1',
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Salon not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static client build in production
const clientPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientPath));
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Auto-init on startup
(async () => {
  try {
    await pool.query(dropOld);
    console.log('Old tables dropped');
    await pool.query(schema);
    console.log('Database schema applied');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Salon booking server running on port ${PORT}`);
  });
})();
