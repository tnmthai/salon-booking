const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const isSuperAdmin = (email) => email === 'admin@tnmthai.com';

// GET reviews for a salon (public)
router.get('/public/:slug', async (req, res) => {
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });

    const { rows } = await db.query(`
      SELECT r.*, st.name as staff_name
      FROM reviews r
      LEFT JOIN staff st ON r.staff_id = st.id
      WHERE r.salon_id = $1
      ORDER BY r.created_at DESC
    `, [salon.rows[0].id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET reviews for a salon (auth)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT r.*, st.name as staff_name
      FROM reviews r
      LEFT JOIN staff st ON r.staff_id = st.id
      WHERE r.salon_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.salon_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET average rating for a salon (public)
router.get('/rating/:slug', async (req, res) => {
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });

    const { rows } = await db.query(`
      SELECT 
        COALESCE(ROUND(AVG(rating), 1), 0) as average_rating,
        COUNT(*) as total_reviews
      FROM reviews WHERE salon_id = $1
    `, [salon.rows[0].id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create review (public — by booking_code + phone)
router.post('/', async (req, res) => {
  const { booking_code, phone, rating, comment } = req.body;
  if (!booking_code || !phone) return res.status(400).json({ error: 'Provide booking_code and phone' });
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

  try {
    // Verify the appointment exists and is completed
    const appt = await db.query(`
      SELECT a.*, c.name as customer_name, c.phone as customer_phone
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      WHERE a.booking_code = $1 AND c.phone = $2 AND a.status = 'completed'
    `, [booking_code.toUpperCase(), phone]);

    if (!appt.rows.length) {
      return res.status(404).json({ error: 'Completed appointment not found. Check your booking code and phone number.' });
    }

    const appointment = appt.rows[0];

    // Check if already reviewed
    const existing = await db.query('SELECT id FROM reviews WHERE appointment_id = $1', [appointment.id]);
    if (existing.rows.length) {
      return res.status(400).json({ error: 'You have already reviewed this appointment' });
    }

    const { rows } = await db.query(
      'INSERT INTO reviews (appointment_id, salon_id, staff_id, rating, comment, customer_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [appointment.id, appointment.salon_id, appointment.staff_id, rating, comment || null, appointment.customer_name]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE review (auth — owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'DELETE FROM reviews WHERE id = $1 RETURNING id';
      params = [req.params.id];
    } else {
      query = 'DELETE FROM reviews WHERE id = $1 AND salon_id = $2 RETURNING id';
      params = [req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
