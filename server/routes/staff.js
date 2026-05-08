const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const isSuperAdmin = (email) => email === 'admin@tnmthai.com';

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
    res.status(500).json({ error: err.message });
  }
});

// GET all staff (super admin: all shops, normal: own salon)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'SELECT st.*, sal.name as salon_name FROM staff st LEFT JOIN salons sal ON st.salon_id = sal.id WHERE st.active = true ORDER BY st.name';
      params = [];
    } else {
      query = 'SELECT * FROM staff WHERE salon_id = $1 AND active = true ORDER BY name';
      params = [req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create staff
router.post('/', authMiddleware, async (req, res) => {
  const { name, email, phone, color, salon_id } = req.body;
  const targetSalonId = isSuperAdmin(req.user.email) ? (salon_id || req.user.salon_id) : req.user.salon_id;
  try {
    const { rows } = await db.query(
      'INSERT INTO staff (salon_id, name, email, phone, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [targetSalonId, name, email, phone, color || '#EC4899']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
