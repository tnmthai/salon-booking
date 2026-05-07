const router = require('express').Router();
const db = require('../db');

// GET all active services
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM services WHERE active = true ORDER BY category, name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET service by id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Service not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create service
router.post('/', async (req, res) => {
  const { name, description, duration_min, price, category } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO services (name, description, duration_min, price, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, duration_min, price, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update service
router.put('/:id', async (req, res) => {
  const { name, description, duration_min, price, category, active } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE services SET name=$1, description=$2, duration_min=$3, price=$4, category=$5, active=$6 WHERE id=$7 RETURNING *',
      [name, description, duration_min, price, category, active, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Service not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE service (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE services SET active = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Service deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
