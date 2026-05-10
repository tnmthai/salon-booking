const { Pool } = require('pg');

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
  salon_id INTEGER REFERENCES salons(id),
  customer_id INTEGER REFERENCES customers(id),
  staff_id INTEGER REFERENCES staff(id),
  service_id INTEGER REFERENCES services(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'confirmed',
  booking_code VARCHAR(8) UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_start ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON appointments(staff_id);
`;

const seed = `
INSERT INTO services (name, description, duration_min, price, category) VALUES
  ('Haircut', 'Classic haircut with styling', 30, 35.00, 'Hair'),
  ('Hair Coloring', 'Full color treatment', 90, 85.00, 'Hair'),
  ('Blow Dry', 'Wash and blow dry styling', 45, 40.00, 'Hair'),
  ('Manicure', 'Nail shaping, cuticle care, polish', 30, 25.00, 'Nails'),
  ('Pedicure', 'Foot soak, nail care, polish', 45, 35.00, 'Nails'),
  ('Facial', 'Deep cleansing facial treatment', 60, 60.00, 'Skin'),
  ('Eyebrow Shaping', 'Eyebrow threading or waxing', 15, 15.00, 'Beauty'),
  ('Full Body Massage', 'Relaxation massage', 60, 70.00, 'Spa')
ON CONFLICT DO NOTHING;

INSERT INTO staff (name, role, phone, email) VALUES
  ('Mai Nguyen', 'Senior Stylist', '021-123-4567', 'mai@salon.com'),
  ('Linh Tran', 'Colorist', '021-234-5678', 'linh@salon.com'),
  ('Han Le', 'Nail Technician', '021-345-6789', 'han@salon.com'),
  ('Thu Pham', 'Esthetician', '021-456-7890', 'thu@salon.com')
ON CONFLICT DO NOTHING;

INSERT INTO staff_services (staff_id, service_id) VALUES
  (1, 1), (1, 3), (2, 2), (2, 3), (3, 4), (3, 5), (4, 6), (4, 7), (1, 8), (4, 8)
ON CONFLICT DO NOTHING;
`;

async function initDB(pool) {
  try {
    await pool.query(schema);
    console.log('Schema created');
    await pool.query(seed);
    console.log('Seed data inserted');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

async function seedAdmin(pool) {
  try {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('Thai123@', 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      ['admin@tnmthai.com', hash, 'Admin', 'super_admin']
    );
    console.log('Admin user seeded');
  } catch (err) {
    console.log('Admin seed skipped:', err.message);
  }
}


// Add timezone column if not exists
async function addTimezoneColumn(pool) {
  try {
    await pool.query("ALTER TABLE salons ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Pacific/Auckland'");
    console.log('Timezone column added');
  } catch (err) {
    console.log('Timezone column skipped:', err.message);
  }
}

// Update exports

// Add is_active column to staff if not exists
async function addStaffActiveColumn(pool) {
  try {
    await pool.query("ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true");
    console.log('Staff is_active column added');
  } catch (err) {
    console.log('Staff is_active column skipped:', err.message);
  }
}

// Add service_name column to appointments if not exists
async function addServiceNameColumn(pool) {
  try {
    await pool.query("ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_name VARCHAR(255)");
    console.log('Service_name column added');
  } catch (err) {
    console.log('Service_name column skipped:', err.message);
  }
}


// Add is_active column to users if not exists
async function addUserActiveColumn(pool) {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true");
    console.log('Users is_active column added');
  } catch (err) {
    console.log('Users is_active column skipped:', err.message);
  }
}


// Add website column to salons if not exists
async function addWebsiteColumn(pool) {
  try {
    await pool.query("ALTER TABLE salons ADD COLUMN IF NOT EXISTS website VARCHAR(255)");
    console.log('Website column added');
  } catch (err) {
    console.log('Website column skipped:', err.message);
  }
}

module.exports = { initDB, seedAdmin, addTimezoneColumn, addStaffActiveColumn, addServiceNameColumn, addUserActiveColumn, addWebsiteColumn };
