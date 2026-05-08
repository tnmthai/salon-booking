const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const isSuperAdmin = (email) => email === 'admin@tnmthai.com';

// GET all users for the salon (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = `SELECT u.id, u.email, u.name, u.role, u.created_at, s.name as salon_name, s.slug as salon_slug
        FROM users u LEFT JOIN salons s ON u.salon_id = s.id ORDER BY u.created_at`;
      params = [];
    } else {
      query = 'SELECT id, email, name, role, created_at FROM users WHERE salon_id = $1 ORDER BY created_at';
      params = [req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users (super admin — no salon filter)
router.get('/all', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../middleware/auth');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== 'admin@tnmthai.com') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { rows } = await db.query(
      `SELECT u.id, u.email, u.name, u.role, u.created_at, s.name as salon_name, s.slug as salon_slug
       FROM users u JOIN salons s ON u.salon_id = s.id ORDER BY u.created_at`
    );
    res.json(rows);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// PUT update user (super admin can update anyone, owner can update their salon)
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, email, role } = req.body;
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 RETURNING id, email, name, role';
      params = [name, email, role, req.params.id];
    } else {
      query = 'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 AND salon_id=$5 RETURNING id, email, name, role';
      params = [name, email, role, req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user (super admin can delete anyone)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (isSuperAdmin(req.user.email)) {
      await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    } else {
      await db.query('DELETE FROM users WHERE id = $1 AND salon_id = $2', [req.params.id, req.user.salon_id]);
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
