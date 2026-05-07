const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// DB schema
const schema = `
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
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
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  staff_id INTEGER REFERENCES staff(id),
  service_id INTEGER REFERENCES services(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);
`;

const seed = `
INSERT INTO services (name, description, duration_min, price, category)
SELECT * FROM (VALUES
  ('Haircut', 'Classic haircut with styling', 30, 35.00, 'Hair'),
  ('Hair Coloring', 'Full color treatment', 90, 85.00, 'Hair'),
  ('Blow Dry', 'Wash and blow dry styling', 45, 40.00, 'Hair'),
  ('Manicure', 'Nail shaping, cuticle care, polish', 30, 25.00, 'Nails'),
  ('Pedicure', 'Foot soak, nail care, polish', 45, 35.00, 'Nails'),
  ('Facial', 'Deep cleansing facial treatment', 60, 60.00, 'Skin'),
  ('Eyebrow Shaping', 'Eyebrow threading or waxing', 15, 15.00, 'Beauty'),
  ('Full Body Massage', 'Relaxation massage', 60, 70.00, 'Spa')
) AS t(name, description, duration_min, price, category)
WHERE NOT EXISTS (SELECT 1 FROM services LIMIT 1);

INSERT INTO staff (name, role, phone, email)
SELECT * FROM (VALUES
  ('Mai Nguyen', 'Senior Stylist', '021-123-4567', 'mai@salon.com'),
  ('Linh Tran', 'Colorist', '021-234-5678', 'linh@salon.com'),
  ('Han Le', 'Nail Technician', '021-345-6789', 'han@salon.com'),
  ('Thu Pham', 'Esthetician', '021-456-7890', 'thu@salon.com')
) AS t(name, role, phone, email)
WHERE NOT EXISTS (SELECT 1 FROM staff LIMIT 1);

INSERT INTO staff_services (staff_id, service_id)
SELECT * FROM (VALUES
  (1, 1), (1, 3), (2, 2), (2, 3), (3, 4), (3, 5), (4, 6), (4, 7), (1, 8), (4, 8)
) AS t(staff_id, service_id)
WHERE NOT EXISTS (SELECT 1 FROM staff_services LIMIT 1);
`;

// Init endpoint
app.get('/api/init', async (req, res) => {
  try {
    await pool.query(schema);
    await pool.query(seed);
    res.json({ message: 'Database initialized' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.json({ status: 'error', db: err.message });
  }
});

// API routes
app.use('/api/services', require('./routes/services'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/customers', require('./routes/customers'));

// Serve static client build in production
const clientPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientPath));
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Auto-init on startup
(async () => {
  try {
    await pool.query(schema);
    await pool.query(seed);
    console.log('Database schema and seed applied');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
  app.listen(PORT, () => {
    console.log(`Salon booking server running on port ${PORT}`);
  });
})();
