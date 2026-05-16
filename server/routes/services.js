const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { validateName, validateText, validatePositiveNumber, validateInt } = require('../utils/validation');

const { isSuperAdmin } = require('../middleware/auth');

// GET services for a salon (by slug — public)
router.get('/public/:slug', async (req, res) => {
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });

    const { rows } = await db.query(
      'SELECT * FROM services WHERE salon_id = $1 AND active = true ORDER BY category, name',
      [salon.rows[0].id]
    );
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all services (super admin: all shops, normal: own salon)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'SELECT s.*, sal.name as salon_name FROM services s LEFT JOIN salons sal ON s.salon_id = sal.id WHERE s.active = true ORDER BY s.category, s.name';
      params = [];
    } else {
      query = 'SELECT * FROM services WHERE salon_id = $1 AND active = true ORDER BY category, name';
      params = [req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET service by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'SELECT * FROM services WHERE id = $1';
      params = [req.params.id];
    } else {
      query = 'SELECT * FROM services WHERE id = $1 AND salon_id = $2';
      params = [req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Service not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create service
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, duration_min, price, category, salon_id } = req.body;

  // Validation
  const errors = [
    validateName(name, true),
    description ? validateText(description, 'Description', 2000) : null,
    validatePositiveNumber(price, 'Price'),
    validateInt(duration_min, 'Duration', 1, 480),
    category ? validateText(category, 'Category', 100) : null,
  ].filter(Boolean);
  if (errors.length) return res.status(400).json({ error: errors[0] });

  const targetSalonId = isSuperAdmin(req.user.email) ? (salon_id || req.user.salon_id) : req.user.salon_id;
  try {
    const { rows } = await db.query(
      'INSERT INTO services (salon_id, name, description, duration_min, price, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [targetSalonId, name, description, duration_min, price, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update service
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, description, duration_min, price, category, active } = req.body;
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'UPDATE services SET name=$1, description=$2, duration_min=$3, price=$4, category=$5, active=$6 WHERE id=$7 RETURNING *';
      params = [name, description, duration_min, price, category, active, req.params.id];
    } else {
      query = 'UPDATE services SET name=$1, description=$2, duration_min=$3, price=$4, category=$5, active=$6 WHERE id=$7 AND salon_id=$8 RETURNING *';
      params = [name, description, duration_min, price, category, active, req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Service not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE service (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (isSuperAdmin(req.user.email)) {
      await db.query('UPDATE services SET active = false WHERE id = $1', [req.params.id]);
    } else {
      await db.query('UPDATE services SET active = false WHERE id = $1 AND salon_id = $2', [req.params.id, req.user.salon_id]);
    }
    res.json({ message: 'Service deactivated' });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
