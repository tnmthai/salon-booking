const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const { isSuperAdmin } = require('../middleware/auth');

// GET customers (super admin: all shops, normal: own salon)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'SELECT c.*, sal.name as salon_name FROM customers c LEFT JOIN salons sal ON c.salon_id = sal.id ORDER BY c.created_at DESC';
      params = [];
    } else {
      query = 'SELECT * FROM customers WHERE salon_id = $1 ORDER BY created_at DESC';
      params = [req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create customer
router.post('/', authMiddleware, async (req, res) => {
  const { name, phone, email, notes } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO customers (salon_id, name, phone, email, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.salon_id, name, phone, email, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
