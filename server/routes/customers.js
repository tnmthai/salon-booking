const router = require('express').Router();
const db = require('../db');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM customers ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer by id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  const { name, phone, email, notes } = req.body;
  try {
    const { rows } = await db.query(
      'INSERT INTO customers (name, phone, email, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, email, notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  const { name, phone, email, notes } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE customers SET name=$1, phone=$2, email=$3, notes=$4 WHERE id=$5 RETURNING *',
      [name, phone, email, notes, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
