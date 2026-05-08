const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

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
    res.status(500).json({ error: err.message });
  }
});

// GET all services for authenticated salon
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM services WHERE salon_id = $1 AND active = true ORDER BY category, name',
      [req.user.salon_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET service by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM services WHERE id = $1 AND salon_id = $2',
      [req.params.id, req.user.salon_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Service not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create service
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, duration_min, price, category } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO services (salon_id, name, description, duration_min, price, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.salon_id, name, description, duration_min, price, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update service
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, description, duration_min, price, category, active } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE services SET name=$1, description=$2, duration_min=$3, price=$4, category=$5, active=$6 WHERE id=$7 AND salon_id=$8 RETURNING *',
      [name, description, duration_min, price, category, active, req.params.id, req.user.salon_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Service not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE service (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('UPDATE services SET active = false WHERE id = $1 AND salon_id = $2', [req.params.id, req.user.salon_id]);
    res.json({ message: 'Service deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
