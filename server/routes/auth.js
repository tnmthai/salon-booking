const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');
const { validateEmail, validatePassword, validateName, validateSlug, validatePhone, validateText } = require('../utils/validation');

// POST /api/auth/register — register new salon + owner
router.post('/register', async (req, res) => {
  const { salon_name, slug, email, password, owner_name, phone, address, website, referral_code } = req.body;

  // Validation
  const errors = [
    validateName(salon_name, 'salon_name'),
    validateSlug(slug),
    validateEmail(email),
    validatePassword(password),
    validateName(owner_name, false),
    phone ? validatePhone(phone) : null,
    address ? validateText(address, 'Address', 500) : null,
    website ? validateText(website, 'Website', 500) : null,
  ].filter(Boolean);
  if (errors.length) return res.status(400).json({ error: errors[0] });

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
      [salon_name, slug, phone || null, email, address || null, website || null]
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
      { expiresIn: '1d' }
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

    // Apply registration bonuses (14-day boost + 90-day Starter trial)
    try {
      const { applyRegistrationBonuses } = require('./plans');
      await applyRegistrationBonuses(salon.rows[0].id);
    } catch (e) {
      console.error('[BONUS] Failed to apply registration bonuses:', e.message);
    }

    // Apply referral code if provided
    if (referral_code) {
      try {
        const ref = await db.query(
          'SELECT * FROM referrals WHERE referral_code = $1 AND referred_salon_id IS NULL',
          [referral_code.toUpperCase()]
        );
        if (ref.rows.length) {
          await db.query(
            'UPDATE referrals SET referred_salon_id = $1, status = \'completed\', completed_at = NOW() WHERE id = $2',
            [salon.rows[0].id, ref.rows[0].id]
          );
          // Give referrer reward
          const referrerCount = await db.query(
            "SELECT COUNT(*) as count FROM referrals WHERE referrer_salon_id = $1 AND status = 'completed'",
            [ref.rows[0].referrer_salon_id]
          );
          const count = parseInt(referrerCount.rows[0].count);
          if (count >= 3) {
            const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await db.query('UPDATE salons SET trial_plan = $1, trial_ends_at = $2 WHERE id = $3', ['growth', trialEnd.toISOString(), ref.rows[0].referrer_salon_id]);
          } else if (count >= 1) {
            const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            await db.query('UPDATE salons SET trial_plan = $1, trial_ends_at = $2 WHERE id = $3', ['starter', trialEnd.toISOString(), ref.rows[0].referrer_salon_id]);
          }
        }
      } catch (e) {
        console.error('[REFERRAL] Failed to apply referral:', e.message);
      }
    }

    res.status(201).json({
      token,
      user: user.rows[0],
      salon: { ...salon.rows[0], trial_plan: 'starter', boost_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), is_new_badge: true },
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
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
  if (typeof email !== 'string' || email.length > 300) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (typeof password !== 'string' || password.length > 128) {
    return res.status(400).json({ error: 'Invalid password' });
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
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, salon_id: user.salon_id },
      salon: { id: user.salon_id, name: user.salon_name, slug: user.salon_slug, timezone: user.timezone || 'Pacific/Auckland' },
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rate limit tracking for verification codes (in-memory)
const codeRateLimits = new Map();

function checkCodeRateLimit(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxCodes = 5;

  if (!codeRateLimits.has(key)) {
    codeRateLimits.set(key, []);
  }
  const timestamps = codeRateLimits.get(key).filter(t => now - t < windowMs);
  codeRateLimits.set(key, timestamps);
  return timestamps.length < maxCodes;
}

function recordCodeSent(email) {
  const key = email.toLowerCase();
  if (!codeRateLimits.has(key)) codeRateLimits.set(key, []);
  codeRateLimits.get(key).push(Date.now());
}

// POST /api/auth/send-code — send email verification code
router.post('/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || email.length > 300) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Rate limit check
  if (!checkCodeRateLimit(email)) {
    return res.status(429).json({ error: 'Too many codes requested. Please try again later.' });
  }

  try {
    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await db.query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [email.toLowerCase(), code, expiresAt]
    );

    // Send email
    const { sendEmail, verificationCodeEmail } = require('../utils/email');
    await sendEmail(
      email.toLowerCase(),
      'Your Timia Login Code',
      verificationCodeEmail({ code, email: email.toLowerCase() })
    );

    recordCodeSent(email);

    console.log(`[AUTH] Verification code sent to ${email.toLowerCase()}`);
    res.json({ ok: true, message: 'Code sent' });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Failed to send code' });
  }
});

// POST /api/auth/verify-code — verify code and login/register
router.post('/verify-code', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code required' });
  }
  if (typeof email !== 'string' || email.length > 300) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (typeof code !== 'string' || code.length !== 6) {
    return res.status(400).json({ error: 'Invalid code format' });
  }

  try {
    // Find valid, unused, non-expired code
    const result = await db.query(
      `SELECT id FROM verification_codes
       WHERE email = $1 AND code = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.toLowerCase(), code]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Mark code as used
    await db.query('UPDATE verification_codes SET used = TRUE WHERE id = $1', [result.rows[0].id]);

    // Check if user exists
    const userResult = await db.query(
      `SELECT u.*, s.name as salon_name, s.slug as salon_slug, s.timezone
       FROM users u LEFT JOIN salons s ON u.salon_id = s.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    let user, salon;
    let isNew = false;

    if (userResult.rows.length) {
      // Existing user — login
      user = userResult.rows[0];
      if (user.is_active === false) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }
      salon = { id: user.salon_id, name: user.salon_name, slug: user.salon_slug, timezone: user.timezone || 'Pacific/Auckland' };
    } else {
      // New user — auto-register
      isNew = true;
      const emailPrefix = email.split('@')[0];
      const salonName = 'My Salon';
      const slug = crypto.randomBytes(4).toString('hex'); // 8-char random slug

      // Create salon
      const salonResult = await db.query(
        'INSERT INTO salons (name, slug, email) VALUES ($1, $2, $3) RETURNING *',
        [salonName, slug, email.toLowerCase()]
      );
      salon = salonResult.rows[0];

      // Create owner user (no password — they use email codes)
      const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const userInsert = await db.query(
        'INSERT INTO users (salon_id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, salon_id',
        [salon.id, email.toLowerCase(), passwordHash, emailPrefix, 'owner']
      );
      user = userInsert.rows[0];

      // Apply registration bonuses (same as /register)
      try {
        const { applyRegistrationBonuses } = require('./plans');
        await applyRegistrationBonuses(salon.id);
      } catch (e) {
        console.error('[BONUS] Failed to apply registration bonuses:', e.message);
      }

      // Notify support about new shop
      try {
        const { sendEmail, newShopNotificationEmail } = require('../utils/email');
        await sendEmail(
          'support@timia.nz',
          `🏪 New Shop (code login): ${salonName}`,
          newShopNotificationEmail({
            salonName,
            slug,
            ownerName: emailPrefix,
            email: email.toLowerCase(),
            phone: null,
            address: null,
            website: null,
          })
        );
      } catch (e) {
        console.error('[EMAIL] Failed to send new shop notification:', e.message);
      }
    }

    const token = jwt.sign(
      { id: user.id, salon_id: user.salon_id || salon.id, email: email.toLowerCase(), role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, salon_id: user.salon_id || salon.id },
      salon: { id: salon.id, name: salon.name, slug: salon.slug, timezone: salon.timezone || 'Pacific/Auckland' },
      is_new: isNew,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me — get current user info
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.salon_id, s.name as salon_name, s.slug as salon_slug, s.timezone, s.show_on_landing, s.show_in_explore, s.loyalty_settings, s.phone as salon_phone, s.email as salon_email, s.address as salon_address, s.description as salon_description
       FROM users u LEFT JOIN salons s ON u.salon_id = s.id WHERE u.id = $1`,
      [decoded.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    res.json({
      user: { id: u.id, email: u.email, name: u.name, role: u.role, salon_id: u.salon_id },
      salon: { id: u.salon_id, name: u.salon_name, slug: u.salon_slug, timezone: u.timezone || 'Pacific/Auckland', show_on_landing: u.show_on_landing !== false, show_in_explore: u.show_in_explore !== false, loyalty_settings: u.loyalty_settings, phone: u.salon_phone, email: u.salon_email, address: u.salon_address, description: u.salon_description },
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});



module.exports = router;
