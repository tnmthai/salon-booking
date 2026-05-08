const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET all users for the salon (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, email, name, role, created_at FROM users WHERE salon_id = $1 ORDER BY created_at',
      [req.user.salon_id]
    );
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
    // Super admin check: email must be admin@tnmthai.com
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

// PUT update user
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 AND salon_id=$5 RETURNING id, email, name, role',
      [name, email, role, req.params.id, req.user.salon_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1 AND salon_id = $2', [req.params.id, req.user.salon_id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
