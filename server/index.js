const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const pool = require('./db');
const { seedAdmin, addTimezoneColumn, addStaffActiveColumn, addServiceNameColumn, addUserActiveColumn, addWebsiteColumn } = require('./initdb');
const { authMiddleware, isSuperAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Seed admin user and add columns on startup
seedAdmin(pool);
addTimezoneColumn(pool);
addStaffActiveColumn(pool);
addServiceNameColumn(pool);
addUserActiveColumn(pool);
addWebsiteColumn(pool);

// --- Security ---
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.clarity.ms", "https://scripts.clarity.ms", "https://connect.facebook.net", "https://staticxx.facebook.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://mediaserver.realestate.co.nz", "https://cloudinary.roomies.pics", "https://www.facebook.com", "https://*.fbcdn.net", "https://c.clarity.ms", "https://*.clarity.ms"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://t.clarity.ms", "https://www.clarity.ms", "https://www.facebook.com", "https://*.facebook.com", "https://*.fbcdn.net"],
      frameSrc: ["'self'", "https://www.facebook.com", "https://web.facebook.com"],
      objectSrc: ["'none'"],
    }
  }
}));

const allowedOrigins = [
  'https://salon-booking.up.railway.app',
  'https://timia.nz',
  'https://www.timia.nz',
  'http://localhost:5173',
  'http://localhost:3001',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);
app.use('/api/appointments/public', publicLimiter);
app.use('/api/appointments/lookup', publicLimiter);
app.use('/api/visits', publicLimiter);
app.use('/api/loyalty/public', publicLimiter);
app.use('/api/contact', publicLimiter);
app.use('/api/reviews', publicLimiter);
app.use('/api', apiLimiter);

// Stripe webhook — needs raw body, must be before express.json()
const stripeWebhook = require('./routes/stripe').webhookHandler;
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '10kb' }));

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
app.use('/api/visits', require('./routes/visits'));
const { router: plansRouter } = require('./routes/plans');
app.use('/api', plansRouter);
app.use('/api/demo', require('./routes/demo'));

// Stripe checkout (needs JSON body)
const stripeCheckout = require('./routes/stripe').checkoutHandler;
app.post('/api/stripe/checkout', stripeCheckout);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.json({ status: 'error', db: 'disconnected' });
  }
});

// Contact form
function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    if (name.length > 200 || email.length > 300 || message.length > 5000) return res.status(400).json({ error: 'Input too long' });
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    const { sendEmail } = require('./utils/email');
    await sendEmail(
      'support@timia.nz',
      `Contact from ${safeName} (${safeEmail})`,
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#ec4899">New Contact Message</h2>
        <p><strong>From:</strong> ${safeName}</p>
        <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
        <p style="white-space:pre-wrap">${safeMessage}</p>
      </div>`
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all salons with owner info (public — only visible ones)
app.get('/api/salons', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.name, s.slug, s.address, s.phone, s.description, s.plan, s.show_on_landing,
        u.name as owner_name, u.id as owner_id
      FROM salons s
      LEFT JOIN users u ON u.salon_id = s.id AND u.role = 'owner'
      WHERE s.show_on_landing = true
      ORDER BY s.name
    `);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List ALL salons for explore page (public — all active salons)
app.get('/api/explore/salons', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.name, s.slug, s.address, s.phone, s.description, s.plan, s.show_on_landing, s.show_in_explore,
        u.name as owner_name, u.id as owner_id
      FROM salons s
      LEFT JOIN users u ON u.salon_id = s.id AND u.role = 'owner'
      WHERE s.show_in_explore = true
      ORDER BY s.name
    `);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List ALL salons (super admin only — includes hidden ones)
app.get('/api/admin/salons', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });
    const { rows } = await pool.query(`
      SELECT s.id, s.name, s.slug, s.address, s.phone, s.description, s.plan, s.show_on_landing,
        u.name as owner_name, u.email as owner_email, u.id as owner_id
      FROM salons s
      LEFT JOIN users u ON u.salon_id = s.id AND u.role = 'owner'
      ORDER BY s.name
    `);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });
    
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
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });
    const { name, slug, phone, email, address, description } = req.body;
    const { rows } = await pool.query(
      'UPDATE salons SET name=$1, slug=$2, phone=$3, email=$4, address=$5, description=$6 WHERE id=$7 RETURNING *',
      [name, slug, phone, email, address, description, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Salon not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
    const isSuper = isSuperAdmin(decoded.email);
    const { salon_id: targetSalonId, name, phone, email, address, description, timezone, show_on_landing, show_in_explore, loyalty_settings } = req.body;
    const salonId = isSuper && targetSalonId ? targetSalonId : decoded.salon_id;
    if (!salonId) return res.status(403).json({ error: 'No salon' });
    const fields = [];
    const vals = [];
    let i = 1;
    if (name !== undefined) { fields.push(`name=$${i++}`); vals.push(name); }
    if (phone !== undefined) { fields.push(`phone=$${i++}`); vals.push(phone); }
    if (email !== undefined) { fields.push(`email=$${i++}`); vals.push(email); }
    if (address !== undefined) { fields.push(`address=$${i++}`); vals.push(address); }
    if (description !== undefined) { fields.push(`description=$${i++}`); vals.push(description); }
    if (timezone !== undefined) { fields.push(`timezone=$${i++}`); vals.push(timezone); }
    if (show_on_landing !== undefined) { fields.push(`show_on_landing=$${i++}`); vals.push(show_on_landing); }
    if (show_in_explore !== undefined) { fields.push(`show_in_explore=$${i++}`); vals.push(show_in_explore); }
    if (loyalty_settings !== undefined) { fields.push(`loyalty_settings=$${i++}`); vals.push(JSON.stringify(loyalty_settings)); }
    if (!fields.length) return res.status(400).json({ error: 'No fields to update' });
    vals.push(salonId);
    const { rows } = await pool.query(`UPDATE salons SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
    res.json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });
    const { rows } = await pool.query('DELETE FROM salons WHERE id = $1 RETURNING id, name', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Salon not found' });
    res.json({ message: 'Salon deleted', salon: rows[0] });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Delete staff + all related data (super admin only)
app.delete('/api/admin/staff/:id', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });
    const staffId = req.params.id;
    const apptDel = await pool.query('DELETE FROM appointments WHERE staff_id = $1', [staffId]);
    await pool.query('DELETE FROM working_hours WHERE staff_id = $1', [staffId]);
    await pool.query('DELETE FROM staff_services WHERE staff_id = $1', [staffId]);
    const { rows } = await pool.query('DELETE FROM staff WHERE id = $1 RETURNING id, name', [staffId]);
    if (!rows.length) return res.status(404).json({ error: 'Staff not found' });
    res.json({ message: 'Staff deleted', staff: rows[0], appointments_deleted: apptDel.rowCount });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all appointments, or by salon (super admin only)
app.delete('/api/admin/appointments', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('./middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });
    const salonId = req.query.salon_id;
    let result;
    if (salonId) {
      result = await pool.query('DELETE FROM appointments WHERE salon_id = $1', [salonId]);
    } else {
      result = await pool.query('DELETE FROM appointments');
    }
    res.json({ message: 'Appointments deleted', deleted: result.rowCount });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
    if (!isSuperAdmin(decoded.email)) return res.status(403).json({ error: 'Forbidden' });
    
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
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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

// --- Loyalty rewards CRUD (owner) — MUST be before /:identifier ---
app.get('/api/loyalty/rewards', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM loyalty_rewards WHERE salon_id = $1 ORDER BY points_cost',
      [req.user.salon_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/loyalty/rewards', authMiddleware, async (req, res) => {
  try {
    const { name, description, points_cost } = req.body;
    if (!name || !points_cost) return res.status(400).json({ error: 'Name and points_cost required' });
    const { rows } = await pool.query(
      'INSERT INTO loyalty_rewards (salon_id, name, description, points_cost) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.salon_id, name, description || '', parseInt(points_cost)]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/loyalty/rewards/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, points_cost, active } = req.body;
    const fields = [];
    const vals = [];
    let i = 1;
    if (name !== undefined) { fields.push(`name=$${i++}`); vals.push(name); }
    if (description !== undefined) { fields.push(`description=$${i++}`); vals.push(description); }
    if (points_cost !== undefined) { fields.push(`points_cost=$${i++}`); vals.push(parseInt(points_cost)); }
    if (active !== undefined) { fields.push(`active=$${i++}`); vals.push(active); }
    if (!fields.length) return res.status(400).json({ error: 'No fields' });
    vals.push(req.params.id, req.user.salon_id);
    const { rows } = await pool.query(
      `UPDATE loyalty_rewards SET ${fields.join(',')} WHERE id=$${i++} AND salon_id=$${i} RETURNING *`,
      vals
    );
    if (!rows.length) return res.status(404).json({ error: 'Reward not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/loyalty/rewards/:id', authMiddleware, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM loyalty_rewards WHERE id = $1 AND salon_id = $2',
      [req.params.id, req.user.salon_id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Reward not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Loyalty: list all customers with points (owner) ---
app.get('/api/loyalty/customers', authMiddleware, async (req, res) => {
  try {
    const salonId = req.user.salon_id;
    if (!salonId) return res.status(400).json({ error: 'No salon associated with this account' });
    const { rows } = await pool.query(
      `SELECT id, name, phone, email, loyalty_points, total_visits, created_at
       FROM customers WHERE salon_id = $1 AND (loyalty_points > 0 OR total_visits > 0)
       ORDER BY loyalty_points DESC, total_visits DESC`,
      [salonId]
    );
    const salon = await pool.query('SELECT loyalty_settings FROM salons WHERE id = $1', [salonId]);
    res.json({ customers: rows, settings: salon.rows[0]?.loyalty_settings || {} });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Loyalty: send points reminder email to customer ---
app.post('/api/loyalty/send-points-email', authMiddleware, async (req, res) => {
  try {
    const { customer_id } = req.body;
    if (!customer_id || !Number.isInteger(customer_id)) return res.status(400).json({ error: 'Valid customer_id required' });
    const salonId = req.user.salon_id;
    if (!salonId) return res.status(400).json({ error: 'No salon associated with this account' });

    const customer = await pool.query('SELECT * FROM customers WHERE id = $1 AND salon_id = $2', [customer_id, salonId]);
    if (!customer.rows.length) return res.status(404).json({ error: 'Customer not found' });
    if (!customer.rows[0].email) return res.status(400).json({ error: 'Customer has no email' });

    const salon = await pool.query('SELECT name, slug, loyalty_settings FROM salons WHERE id = $1', [salonId]);
    const salonData = salon.rows[0];
    const settings = salonData.loyalty_settings || {};

    const rewards = await pool.query(
      'SELECT name, points_cost FROM loyalty_rewards WHERE salon_id = $1 AND active = true AND points_cost <= $2 ORDER BY points_cost',
      [salonId, customer.rows[0].loyalty_points]
    );

    const { sendEmail, loyaltyReminderEmail } = require('./utils/email');
    const html = loyaltyReminderEmail({
      customerName: customer.rows[0].name,
      salonName: salonData.name,
      totalPoints: customer.rows[0].loyalty_points,
      totalVisits: customer.rows[0].total_visits,
      stampGoal: settings.stamp_goal || 10,
      stampReward: settings.stamp_reward || 'Free service',
      availableRewards: rewards.rows,
      bookingUrl: `https://www.timia.nz/${salonData.slug}/book`,
      emailTemplate: settings.email_template || null,
    });

    const result = await sendEmail(customer.rows[0].email, `Your loyalty points at ${salonData.name}`, html);
    if (result && result.error) {
      return res.status(500).json({ error: 'Failed to send email' });
    }
    res.json({ message: 'Email sent' });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Loyalty points endpoint (auth) ---
app.get('/api/loyalty/:identifier', authMiddleware, async (req, res) => {
  try {
    const id = req.params.identifier;
    const isEmail = id.includes('@');
    const { rows } = await pool.query(
      `SELECT id, name, phone, email, loyalty_points, total_visits FROM customers WHERE ${isEmail ? 'email' : 'phone'} = $1 AND salon_id = $2 ORDER BY loyalty_points DESC LIMIT 1`,
      [id, req.user.salon_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    const salon = await pool.query('SELECT loyalty_settings FROM salons WHERE id = $1', [req.user.salon_id]);
    res.json({ customer: rows[0], settings: salon.rows[0]?.loyalty_settings || {} });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Public loyalty lookup (customer self-check by phone or email) ---
app.get('/api/loyalty/public/:slug/:identifier', async (req, res) => {
  try {
    const salon = await pool.query('SELECT id, name, loyalty_settings FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });
    const sid = salon.rows[0].id;
    const id = req.params.identifier;
    const isEmail = id.includes('@');
    const customer = await pool.query(
      `SELECT id, name, phone, email, loyalty_points, total_visits FROM customers WHERE ${isEmail ? 'email' : 'phone'} = $1 AND salon_id = $2`,
      [id, sid]
    );
    const rewards = await pool.query(
      'SELECT id, name, description, points_cost FROM loyalty_rewards WHERE salon_id = $1 AND active = true ORDER BY points_cost',
      [sid]
    );
    const settings = salon.rows[0].loyalty_settings || {};
    res.json({
      salon: salon.rows[0].name,
      customer: customer.rows[0] || null,
      rewards: rewards.rows,
      settings,
      stamp_goal: settings.stamp_goal || 10,
      stamp_reward: settings.stamp_reward || 'Free service',
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Redeem loyalty reward ---
app.post('/api/loyalty/redeem', authMiddleware, async (req, res) => {
  try {
    const { customer_id, reward_id } = req.body;
    const reward = await pool.query('SELECT * FROM loyalty_rewards WHERE id = $1 AND salon_id = $2 AND active = true', [reward_id, req.user.salon_id]);
    if (!reward.rows.length) return res.status(404).json({ error: 'Reward not found' });
    const customer = await pool.query('SELECT * FROM customers WHERE id = $1 AND salon_id = $2', [customer_id, req.user.salon_id]);
    if (!customer.rows.length) return res.status(404).json({ error: 'Customer not found' });
    if (customer.rows[0].loyalty_points < reward.rows[0].points_cost) {
      return res.status(400).json({ error: 'Not enough points' });
    }
    await pool.query('UPDATE customers SET loyalty_points = loyalty_points - $1 WHERE id = $2', [reward.rows[0].points_cost, customer_id]);
    res.json({ message: 'Redeemed!', remaining_points: customer.rows[0].loyalty_points - reward.rows[0].points_cost });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
    if (decoded.role !== 'owner' && !isSuperAdmin(decoded.email)) {
      const staffCheck = await pool.query('SELECT id FROM staff WHERE user_id = $1 AND id = $2', [decoded.id, a.staff_id]);
      if (!staffCheck.rows.length && a.salon_id !== decoded.salon_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    await pool.query("UPDATE appointments SET status = 'completed' WHERE id = $1", [req.params.id]);

    // Award loyalty points (configurable per salon)
    let pointsEarned = 0;
    if (a.customer_id && a.price) {
      const salonInfo = await pool.query('SELECT loyalty_settings FROM salons WHERE id = $1', [a.salon_id]);
      const settings = salonInfo.rows[0]?.loyalty_settings || { points_per_dollar: 0.1 };
      const rate = parseFloat(settings.points_per_dollar) || 0.1;
      pointsEarned = Math.floor(parseFloat(a.price) * rate);
      if (pointsEarned > 0) {
        await pool.query('UPDATE customers SET loyalty_points = loyalty_points + $1, total_visits = total_visits + 1 WHERE id = $2', [pointsEarned, a.customer_id]);
        console.log(`[LOYALTY] Awarded ${pointsEarned} points to customer #${a.customer_id} (rate: ${rate}/$1)`);
      }
    }

    // Send completion email with loyalty points (non-blocking)
    try {
      const cust = await pool.query('SELECT * FROM customers WHERE id = $1', [a.customer_id]);
      const salon = await pool.query('SELECT * FROM salons WHERE id = $1', [a.salon_id]);
      const svc = await pool.query('SELECT * FROM services WHERE id = $1', [a.service_id]);
      if (cust.rows[0]?.email) {
        const bookingDate = new Date(a.start_time);
        const dateStr = bookingDate.toLocaleDateString('en-NZ', { timeZone: 'Pacific/Auckland', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const { sendEmail, completionEmail } = require('./utils/email');
        const custData = cust.rows[0];
        const salonData = salon.rows[0];
        const newPoints = (custData.loyalty_points || 0) + pointsEarned;
        const settings = salonData?.loyalty_settings || {};
        const stampGoal = settings.stamp_goal || 10;
        sendEmail(custData.email, `Thanks for visiting! ⭐ - ${salonData?.name || 'Salon'}`,
          completionEmail({
            customerName: custData.name,
            salonName: salonData?.name || 'Salon',
            serviceName: svc.rows[0]?.name || 'Service',
            date: dateStr,
            pointsEarned,
            totalPoints: newPoints,
            stampGoal,
            stampReward: settings.stamp_reward || 'Free service',
            bookingCode: a.booking_code,
          })
        ).catch(e => console.error('[EMAIL] Completion email error:', e.message));
      }
    } catch (e) { console.error('[EMAIL] Completion email module error:', e.message); }

    res.json({ message: 'Marked as completed' });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SEO routes - serve sitemap.xml and robots.txt directly
app.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.timia.nz</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/features</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/pricing</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/about</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/contact</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/register</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/login</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/lookup</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/terms</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/privacy</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/cookies</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
  <url>
    <loc>https://www.timia.nz/legal</loc>
    <lastmod>2026-05-12</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
</urlset>`);
});

app.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: https://www.timia.nz/sitemap.xml`);
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
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS loyalty_settings JSONB DEFAULT '{"points_per_dollar":0.1,"stamp_goal":10,"stamp_reward":"Free service"}'::jsonb`);
  await run(`CREATE TABLE IF NOT EXISTS loyalty_rewards (id SERIAL PRIMARY KEY, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, name VARCHAR(255) NOT NULL, description TEXT, points_cost INTEGER NOT NULL, active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_salon ON loyalty_rewards(salon_id)`);
  await run(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0`);

  // Page visits tracking
  await run(`CREATE TABLE IF NOT EXISTS page_visits (id SERIAL PRIMARY KEY, salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, page VARCHAR(100) DEFAULT 'booking', ip_address VARCHAR(100), user_agent TEXT, referrer TEXT, visited_at TIMESTAMP DEFAULT NOW())`);
  await run(`CREATE INDEX IF NOT EXISTS idx_page_visits_salon ON page_visits(salon_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_page_visits_date ON page_visits(visited_at)`);
  await run(`ALTER TABLE page_visits ADD COLUMN IF NOT EXISTS city VARCHAR(100)`);
  await run(`ALTER TABLE page_visits ADD COLUMN IF NOT EXISTS country VARCHAR(100)`);

  // Reminder tracking (Priority 3)
  await run(`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false`);

  // Subscription plans
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'free'`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS show_on_landing BOOLEAN DEFAULT true`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS show_in_explore BOOLEAN DEFAULT true`);

  // Trial, billing, referral, boost columns
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS trial_plan VARCHAR(20)`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(10) DEFAULT 'monthly'`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS plan_price DECIMAL(10,2) DEFAULT 0`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS is_early_bird BOOLEAN DEFAULT false`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS boost_until TIMESTAMP`);
  await run(`ALTER TABLE salons ADD COLUMN IF NOT EXISTS is_new_badge BOOLEAN DEFAULT true`);

  // Referral system
  await run(`CREATE TABLE IF NOT EXISTS referrals (id SERIAL PRIMARY KEY, referrer_salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, referred_salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE, referral_code VARCHAR(20) UNIQUE NOT NULL, status VARCHAR(20) DEFAULT 'pending', reward_type VARCHAR(50), created_at TIMESTAMP DEFAULT NOW(), completed_at TIMESTAMP)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_salon_id)`);

  // Early bird config
  await run(`CREATE TABLE IF NOT EXISTS early_bird_config (id INTEGER PRIMARY KEY DEFAULT 1, total_slots INTEGER DEFAULT 50, slots_taken INTEGER DEFAULT 0, starter_price DECIMAL(10,2) DEFAULT 7.00, updated_at TIMESTAMP DEFAULT NOW())`);
  await pool.query('INSERT INTO early_bird_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING');

  console.log('Database initialized');

  app.listen(PORT, () => {
    console.log(`Salon booking server running on port ${PORT}`);
  });
})();
