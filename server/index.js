const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');
const { seedAdmin } = require('./initdb');

const app = express();
const PORT = process.env.PORT || 3001;

// Seed admin user on startup
seedAdmin(pool);

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
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/overrides', require('./routes/overrides'));

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

// Salon owner update own salon
app.put('/api/salon/settings', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.salon_id) return res.status(403).json({ error: 'No salon' });
    const { name, phone, email, address, description } = req.body;
    const fields = [];
    const vals = [];
    let i = 1;
    if (name !== undefined) { fields.push(`name=$${i++}`); vals.push(name); }
    if (phone !== undefined) { fields.push(`phone=$${i++}`); vals.push(phone); }
    if (email !== undefined) { fields.push(`email=$${i++}`); vals.push(email); }
    if (address !== undefined) { fields.push(`address=$${i++}`); vals.push(address); }
    if (description !== undefined) { fields.push(`description=$${i++}`); vals.push(description); }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    vals.push(decoded.salon_id);
    const { rows } = await pool.query(`UPDATE salons SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
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

// --- Priority 3: Reminder email cron (runs every hour) ---
async function sendReminders() {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { rows } = await pool.query(`
      SELECT a.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
        s.name as service_name, s.duration_min,
        st.name as staff_name,
        sal.name as salon_name, sal.address as salon_address
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      JOIN staff st ON a.staff_id = st.id
      JOIN salons sal ON a.salon_id = sal.id
      WHERE a.status = 'confirmed'
        AND a.reminder_sent = false
        AND a.start_time >= $1
        AND a.start_time <= $2
        AND c.email IS NOT NULL
        AND c.email != ''
    `, [in24h.toISOString(), in25h.toISOString()]);

    if (rows.length === 0) return;

    console.log(`[REMINDER] Found ${rows.length} appointments needing reminders`);

    const { sendEmail, reminderEmail } = require('./utils/email');

    for (const appt of rows) {
      try {
        const bookingDate = new Date(appt.start_time);
        const dateStr = bookingDate.toLocaleDateString('en-NZ', { timeZone: 'Pacific/Auckland', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = bookingDate.toLocaleTimeString('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit' });

        await sendEmail(appt.customer_email, `Reminder: Appointment Tomorrow at ${appt.salon_name}`,
          reminderEmail({
            customerName: appt.customer_name,
            salonName: appt.salon_name,
            serviceName: appt.service_name,
            staffName: appt.staff_name,
            date: dateStr,
            time: timeStr,
            duration: appt.duration_min,
            price: appt.price,
            address: appt.salon_address,
            bookingCode: appt.booking_code,
          })
        );

        await pool.query('UPDATE appointments SET reminder_sent = true WHERE id = $1', [appt.id]);
        console.log(`[REMINDER] ✅ Sent to ${appt.customer_email} for appt #${appt.id}`);
      } catch (e) {
        console.error(`[REMINDER] ❌ Failed for appt #${appt.id}:`, e.message);
      }
    }
  } catch (err) {
    console.error('[REMINDER] ❌ Cron error:', err.message);
  }
}

// Run reminders every hour
setInterval(sendReminders, 60 * 60 * 1000);
// Also run once on startup (after 30s delay)
setTimeout(sendReminders, 30000);

// --- Loyalty points endpoint ---
app.get('/api/loyalty/:phone', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, loyalty_points FROM customers WHERE phone = $1 ORDER BY loyalty_points DESC LIMIT 1',
      [req.params.phone]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Mark appointment completed + award loyalty points ---
app.put('/api/appointments/:id/complete', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const appt = await pool.query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
    if (!appt.rows.length) return res.status(404).json({ error: 'Appointment not found' });

    const a = appt.rows[0];
    // Allow owner, super admin, or staff linked to this appointment
    if (decoded.role !== 'owner' && decoded.email !== 'admin@tnmthai.com') {
      const staffCheck = await pool.query('SELECT id FROM staff WHERE user_id = $1 AND id = $2', [decoded.id, a.staff_id]);
      if (!staffCheck.rows.length && a.salon_id !== decoded.salon_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await pool.query("UPDATE appointments SET status = 'completed' WHERE id = $1", [req.params.id]);

    // Award loyalty points (1 point per $10 spent)
    if (a.customer_id && a.price) {
      const points = Math.floor(parseFloat(a.price) / 10);
      if (points > 0) {
        await pool.query('UPDATE customers SET loyalty_points = loyalty_points + $1 WHERE id = $2', [points, a.customer_id]);
        console.log(`[LOYALTY] Awarded ${points} points to customer #${a.customer_id}`);
      }
    }

    // Send review request email (non-blocking)
    try {
      const cust = await pool.query('SELECT * FROM customers WHERE id = $1', [a.customer_id]);
      const salon = await pool.query('SELECT * FROM salons WHERE id = $1', [a.salon_id]);
      const svc = await pool.query('SELECT * FROM services WHERE id = $1', [a.service_id]);
      if (cust.rows[0]?.email) {
        const bookingDate = new Date(a.start_time);
        const dateStr = bookingDate.toLocaleDateString('en-NZ', { timeZone: 'Pacific/Auckland', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const { sendEmail, reviewRequestEmail } = require('./utils/email');
        sendEmail(cust.rows[0].email, `How was your visit? - ${salon.rows[0]?.name || 'Salon'}`,
          reviewRequestEmail({
            customerName: cust.rows[0].name,
            salonName: salon.rows[0]?.name || 'Salon',
            serviceName: svc.rows[0]?.name || 'Service',
            date: dateStr,
            bookingCode: a.booking_code,
          })
        ).catch(e => console.error('[EMAIL] Review request error:', e.message));
      }
    } catch (e) { console.error('[EMAIL] Review request module error:', e.message); }

    res.json({ message: 'Marked as completed' });
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
  await run(`ALTER TABLE staff ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#EC4899'`);
  await run(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_code VARCHAR(8)`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_booking_code ON appointments(booking_code) WHERE booking_code IS NOT NULL`);
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

  // --- NEW TABLES ---

  // Reviews (Priority 4)
  await run(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL, rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), comment TEXT, customer_name VARCHAR(100), created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE INDEX IF NOT EXISTS idx_reviews_salon ON reviews(salon_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_reviews_staff ON reviews(staff_id)`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_appointment ON reviews(appointment_id)`);

  // Working hours overrides (Priority 5)
  await run(`CREATE TABLE IF NOT EXISTS working_hours_overrides (id SERIAL PRIMARY KEY, staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE, date DATE NOT NULL, is_active BOOLEAN DEFAULT false, start_time TIME, end_time TIME, reason TEXT, created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE INDEX IF NOT EXISTS idx_wh_overrides_staff ON working_hours_overrides(staff_id)`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_wh_overrides_unique ON working_hours_overrides(staff_id, date)`);

  // Appointment services junction (Priority 6)
  await run(`CREATE TABLE IF NOT EXISTS appointment_services (id SERIAL PRIMARY KEY, appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE, service_id INTEGER REFERENCES services(id) ON DELETE CASCADE, price DECIMAL(10,2), duration_min INTEGER)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_appt_services_appt ON appointment_services(appointment_id)`);

  // Gallery (Priority 7)
  await run(`CREATE TABLE IF NOT EXISTS gallery (id SERIAL PRIMARY KEY, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, image_url TEXT NOT NULL, caption TEXT, created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE INDEX IF NOT EXISTS idx_gallery_salon ON gallery(salon_id)`);

  // Loyalty points (Priority 8)
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0`);

  // Reminder tracking (Priority 3)
  await run(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false`);

  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Salon booking server running on port ${PORT}`);
  });
})();
