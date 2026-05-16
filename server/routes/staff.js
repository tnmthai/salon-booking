const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { validateName, validateText, validatePhone, validateEmail } = require('../utils/validation');

const { isSuperAdmin } = require('../middleware/auth');

// GET staff for a salon (by slug — public)
router.get('/public/:slug', async (req, res) => {
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });

    const { rows } = await db.query(
      'SELECT * FROM staff WHERE salon_id = $1 AND active = true ORDER BY name',
      [salon.rows[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all staff (super admin: all shops, normal: own salon) — includes inactive
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'SELECT st.*, sal.name as salon_name FROM staff st LEFT JOIN salons sal ON st.salon_id = sal.id ORDER BY st.is_active DESC, st.name';
      params = [];
    } else {
      query = 'SELECT * FROM staff WHERE salon_id = $1 ORDER BY is_active DESC, name';
      params = [req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Plan limits
const PLAN_LIMITS = { free: { maxStaff: 2, maxApptsPerMonth: 40 }, starter: { maxStaff: 6, maxApptsPerMonth: -1 }, growth: { maxStaff: -1, maxApptsPerMonth: -1 } };

// POST create staff
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, phone, color, salon_id } = req.body;

  // Validation
  const errors = [
    validateName(name, true),
    email ? validateEmail(email) : null,
    phone ? validatePhone(phone) : null,
  ].filter(Boolean);
  if (errors.length) return res.status(400).json({ error: errors[0] });

  const targetSalonId = isSuperAdmin(req.user.email) ? (salon_id || req.user.salon_id) : req.user.salon_id;
  try {
    // Check plan limit
    if (!isSuperAdmin(req.user.email)) {
      const salon = await db.query('SELECT plan FROM salons WHERE id = $1', [targetSalonId]);
      const plan = salon.rows[0]?.plan || 'free';
      const limit = PLAN_LIMITS[plan]?.maxStaff ?? 2;
      if (limit > 0) {
        const count = await db.query('SELECT COUNT(*) as c FROM staff WHERE salon_id = $1 AND active = true', [targetSalonId]);
        if (parseInt(count.rows[0].c) >= limit) {
          return res.status(403).json({ error: `Staff limit reached (${limit}). Upgrade your plan to add more staff.` });
        }
      }
    }

    const { rows } = await db.query(
      'INSERT INTO staff (salon_id, name, email, phone, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [targetSalonId, name, email, phone, color || '#EC4899']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update staff
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, email, phone, color, active } = req.body;
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'UPDATE staff SET name=$1, email=$2, phone=$3, color=$4, active=$5 WHERE id=$6 RETURNING *';
      params = [name, email, phone, color, active, req.params.id];
    } else {
      query = 'UPDATE staff SET name=$1, email=$2, phone=$3, color=$4, active=$5 WHERE id=$6 AND salon_id=$7 RETURNING *';
      params = [name, email, phone, color, active, req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Staff not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE staff (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (isSuperAdmin(req.user.email)) {
      await db.query('UPDATE staff SET active = false WHERE id = $1', [req.params.id]);
    } else {
      await db.query('UPDATE staff SET active = false WHERE id = $1 AND salon_id = $2', [req.params.id, req.user.salon_id]);
    }
    res.json({ message: 'Staff deactivated' });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
