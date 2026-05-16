const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register — register new salon + owner
router.post('/register', async (req, res) => {
  const { salon_name, slug, email, password, owner_name, phone, address, website } = req.body;
  if (!salon_name || !slug || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check slug uniqueness
    const existing = await db.query('SELECT id FROM salons WHERE slug = $1', [slug]);
    if (existing.rows.length) {
      return res.status(400).json({ error: 'Slug already taken' });
    }

    // Check email uniqueness
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create salon
    const salon = await db.query(
      'INSERT INTO salons (name, slug, phone, email, address, website) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [salon_name, slug, phone, email, address, website || null]
    );

    // Create owner user
    const password_hash = await bcrypt.hash(password, 10);
    const user = await db.query(
      'INSERT INTO users (salon_id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, salon_id',
      [salon.rows[0].id, email, password_hash, owner_name || salon_name, 'owner']
    );

    const token = jwt.sign(
      { id: user.rows[0].id, salon_id: salon.rows[0].id, email, role: 'owner' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Notify support about new shop registration
    try {
      const { sendEmail, newShopNotificationEmail } = require('../utils/email');
      await sendEmail(
        'support@timia.nz',
        `🏪 New Shop: ${salon_name}`,
        newShopNotificationEmail({
          salonName: salon_name,
          slug,
          ownerName: owner_name || salon_name,
          email,
          phone,
          address,
          website: website || null,
        })
      );
    } catch (e) {
      console.error('[EMAIL] Failed to send new shop notification:', e.message);
    }

    res.status(201).json({
      token,
      user: user.rows[0],
      salon: salon.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Account lockout tracking
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkLockout(email) {
  const entry = loginAttempts.get(email);
  if (!entry) return false;
  if (Date.now() > entry.unlockAt) {
    loginAttempts.delete(email);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(email) {
  const entry = loginAttempts.get(email);
  if (!entry) {
    loginAttempts.set(email, { count: 1, unlockAt: Date.now() + LOCKOUT_MS });
  } else {
    entry.count++;
    if (entry.count >= MAX_ATTEMPTS) entry.unlockAt = Date.now() + LOCKOUT_MS;
  }
}

function clearAttempts(email) {
  loginAttempts.delete(email);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  if (checkLockout(email)) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  }

  try {
    const result = await db.query(
      `SELECT u.*, s.name as salon_name, s.slug as salon_slug, s.timezone
       FROM users u LEFT JOIN salons s ON u.salon_id = s.id
       WHERE u.email = $1`,
      [email]
    );

    if (!result.rows.length) {
      recordFailure(email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (user.is_active === false) return res.status(403).json({ error: 'Account is deactivated' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      recordFailure(email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    clearAttempts(email);

    const token = jwt.sign(
      { id: user.id, salon_id: user.salon_id, email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, salon_id: user.salon_id },
      salon: { id: user.salon_id, name: user.salon_name, slug: user.salon_slug, timezone: user.timezone || 'Pacific/Auckland' },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — get current user info
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.salon_id, s.name as salon_name, s.slug as salon_slug, s.timezone, s.show_on_landing, s.show_in_explore, s.phone as salon_phone, s.email as salon_email, s.address as salon_address, s.description as salon_description
       FROM users u LEFT JOIN salons s ON u.salon_id = s.id WHERE u.id = $1`,
      [decoded.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    res.json({
      user: { id: u.id, email: u.email, name: u.name, role: u.role, salon_id: u.salon_id },
      salon: { id: u.salon_id, name: u.salon_name, slug: u.salon_slug, timezone: u.timezone || 'Pacific/Auckland', show_on_landing: u.show_on_landing !== false, show_in_explore: u.show_in_explore !== false, phone: u.salon_phone, email: u.salon_email, address: u.salon_address, description: u.salon_description },
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});



module.exports = router;
