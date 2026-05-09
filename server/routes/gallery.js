const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const isSuperAdmin = (email) => email === 'admin@tnmthai.com';

// GET gallery for a salon (public)
router.get('/public/:slug', async (req, res) => {
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });

    const { rows } = await db.query(
      'SELECT * FROM gallery WHERE salon_id = $1 ORDER BY created_at DESC',
      [salon.rows[0].id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET gallery (auth)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM gallery WHERE salon_id = $1 ORDER BY created_at DESC',
      [req.user.salon_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add gallery image (auth)
router.post('/', authMiddleware, async (req, res) => {
  const { image_url, caption } = req.body;
  if (!image_url) return res.status(400).json({ error: 'Image URL required' });

  try {
    const { rows } = await db.query(
      'INSERT INTO gallery (salon_id, image_url, caption) VALUES ($1, $2, $3) RETURNING *',
      [req.user.salon_id, image_url, caption || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE gallery image (auth)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'DELETE FROM gallery WHERE id = $1 RETURNING id';
      params = [req.params.id];
    } else {
      query = 'DELETE FROM gallery WHERE id = $1 AND salon_id = $2 RETURNING id';
      params = [req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Image not found' });
    res.json({ message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
