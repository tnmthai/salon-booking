const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET customers for authenticated salon
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM customers WHERE salon_id = $1 ORDER BY name',
      [req.user.salon_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create customer (public — for booking)
router.post('/', async (req, res) => {
  const { slug, name, phone, email, notes } = req.body;
  try {
    let salon_id;
    if (slug) {
      const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [slug]);
      if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });
      salon_id = salon.rows[0].id;
    } else {
      return res.status(400).json({ error: 'slug required' });
    }

    const { rows } = await db.query(
      'INSERT INTO customers (salon_id, name, phone, email, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [salon_id, name, phone, email, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer by id (admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM customers WHERE id = $1 AND salon_id = $2',
      [req.params.id, req.user.salon_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, phone, email, notes } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE customers SET name=$1, phone=$2, email=$3, notes=$4 WHERE id=$5 AND salon_id=$6 RETURNING *',
      [name, phone, email, notes, req.params.id, req.user.salon_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
