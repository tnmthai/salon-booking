const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/users', require('./routes/users'));
app.use('/api/working-hours', require('./routes/working-hours'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', version: 'mt-v5' });
  } catch (err) {
    res.json({ status: 'error', db: err.message });
  }
});

// List all salons with owner info (public)
app.get('/api/salons', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.name, s.slug, s.address, s.phone, s.description,
        u.name as owner_name, u.email as owner_email, u.id as owner_id
      FROM salons s
      LEFT JOIN users u ON u.salon_id = s.id AND u.role = 'owner'
      ORDER BY s.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create owner for a salon (super admin only)
app.post('/api/salons/:id/owner', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== 'admin@tnmthai.com') return res.status(403).json({ error: 'Forbidden' });
    
    const { name, email, password } = req.body;
    const salonId = req.params.id;
    
    // Check email uniqueness
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(400).json({ error: 'Email already registered' });
    
    // Demote old owner
    await pool.query("UPDATE users SET role = 'staff' WHERE salon_id = $1 AND role = 'owner'", [salonId]);
    
    // Create new owner
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (salon_id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, 'owner') RETURNING id, email, name, role",
      [salonId, email, password_hash, name]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update salon info (super admin only)
app.put('/api/salons/:id', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== 'admin@tnmthai.com') return res.status(403).json({ error: 'Forbidden' });
    const { name, slug, phone, email, address, description } = req.body;
    const { rows } = await pool.query(
      'UPDATE salons SET name=$1, slug=$2, phone=$3, email=$4, address=$5, description=$6 WHERE id=$7 RETURNING *',
      [name, slug, phone, email, address, description, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Salon not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete salon (super admin only)
app.delete('/api/salons/:id', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== 'admin@tnmthai.com') return res.status(403).json({ error: 'Forbidden' });
    const { rows } = await pool.query('DELETE FROM salons WHERE id = $1 RETURNING id, name', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Salon not found' });
    res.json({ message: 'Salon deleted', salon: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update salon owner (super admin only)
app.put('/api/salons/:id/owner', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== 'admin@tnmthai.com') return res.status(403).json({ error: 'Forbidden' });
    
    const { user_id } = req.body;
    const salonId = req.params.id;
    
    // Remove old owner role
    await pool.query("UPDATE users SET role = 'staff' WHERE salon_id = $1 AND role = 'owner'", [salonId]);
    
    // Set new owner
    if (user_id) {
      await pool.query('UPDATE users SET salon_id = $1, role = $2 WHERE id = $3', [salonId, 'owner', user_id]);
    }
    
    res.json({ message: 'Owner updated' });
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
async function run(sql) {
  try { await pool.query(sql); } catch (e) { console.log('  SQL:', sql.substring(0, 60), '→', e.message); }
}

(async () => {
  console.log('Initializing database...');

  // Create tables if not exist (order matters for FKs)
  await run(`CREATE TABLE IF NOT EXISTS salons (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, slug VARCHAR(100) UNIQUE NOT NULL, address TEXT, phone VARCHAR(20), email VARCHAR(100), logo_url TEXT, description TEXT, opening_hour INTEGER DEFAULT 9, closing_hour INTEGER DEFAULT 18, created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, email VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, name VARCHAR(100), role VARCHAR(20) DEFAULT 'owner', created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE TABLE IF NOT EXISTS services (id SERIAL PRIMARY KEY, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, description TEXT, duration_min INTEGER NOT NULL DEFAULT 30, price DECIMAL(10,2) NOT NULL DEFAULT 0, category VARCHAR(50), active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE TABLE IF NOT EXISTS staff (id SERIAL PRIMARY KEY, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, role VARCHAR(50), phone VARCHAR(20), email VARCHAR(100), avatar_url TEXT, active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE TABLE IF NOT EXISTS staff_services (staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE, service_id INTEGER REFERENCES services(id) ON DELETE CASCADE, PRIMARY KEY (staff_id, service_id))`);
  await run(`CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, phone VARCHAR(20), email VARCHAR(100), notes TEXT, created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE TABLE IF NOT EXISTS appointments (id SERIAL PRIMARY KEY, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, customer_id INTEGER REFERENCES customers(id), staff_id INTEGER REFERENCES staff(id), service_id INTEGER REFERENCES services(id), start_time TIMESTAMP NOT NULL, end_time TIMESTAMP NOT NULL, status VARCHAR(20) DEFAULT 'confirmed', notes TEXT, created_at TIMESTAMP DEFAULT NOW())`);

  // Add salon_id to old tables that don't have it (migration)
  const tables_needing_salon = ['services', 'staff', 'customers', 'appointments'];
  for (const t of tables_needing_salon) {
    await run(`ALTER TABLE ${t} ADD COLUMN IF NOT EXISTS salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE`);
  }

  // Working hours table
  await run(`CREATE TABLE IF NOT EXISTS working_hours (id SERIAL PRIMARY KEY, staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE, day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), start_time TIME NOT NULL, end_time TIME NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE INDEX IF NOT EXISTS idx_working_hours_staff ON working_hours(staff_id)`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_working_hours_unique ON working_hours(staff_id, day_of_week)`);

  // Link staff to user accounts
  await run(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL`);
  await run(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price DECIMAL(10,2)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id)`);

  // Create indexes
  await run(`CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_staff_salon ON staff(salon_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_customers_salon ON customers(salon_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_appointments_salon ON appointments(salon_id)`);

  // Backfill NULL salon_id to first available salon
  const defaultSalon = await pool.query('SELECT id FROM salons ORDER BY id LIMIT 1');
  if (defaultSalon.rows.length > 0) {
    const defaultSalonId = defaultSalon.rows[0].id;
    for (const t of tables_needing_salon) {
      await pool.query(`UPDATE ${t} SET salon_id = $1 WHERE salon_id IS NULL`, [defaultSalonId]);
    }
    await pool.query('UPDATE users SET salon_id = $1 WHERE salon_id IS NULL', [defaultSalonId]);
    console.log(`Backfilled NULL salon_id to salon ${defaultSalonId}`);
  }
  await run(`CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_time)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug)`);

  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Salon booking server running on port ${PORT}`);
  });
})();
