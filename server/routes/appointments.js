const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET available slots (public — by salon slug)
router.get('/slots', async (req, res) => {
  const { slug, staff_id, service_id, date } = req.query;
  if (!slug || !staff_id || !service_id || !date) {
    return res.status(400).json({ error: 'slug, staff_id, service_id, and date required' });
  }

  try {
    const salon = await db.query('SELECT id, opening_hour, closing_hour FROM salons WHERE slug = $1', [slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });

    const svc = await db.query('SELECT duration_min FROM services WHERE id = $1 AND salon_id = $2', [service_id, salon.rows[0].id]);
    if (!svc.rows.length) return res.status(404).json({ error: 'Service not found' });
    const duration = svc.rows[0].duration_min;

    const appts = await db.query(
      `SELECT start_time, end_time FROM appointments WHERE staff_id = $1 AND DATE(start_time) = $2 AND status != 'cancelled'`,
      [staff_id, date]
    );

    const openHour = salon.rows[0].opening_hour || 9;
    const closeHour = salon.rows[0].closing_hour || 18;
    const slots = [];
    const dayStart = new Date(`${date}T${String(openHour).padStart(2,'0')}:00:00`);
    const dayEnd = new Date(`${date}T${String(closeHour).padStart(2,'0')}:00:00`);

    for (let t = new Date(dayStart); t < dayEnd; t.setMinutes(t.getMinutes() + 30)) {
      const slotEnd = new Date(t.getTime() + duration * 60000);
      if (slotEnd > dayEnd) break;

      const overlaps = appts.rows.some(appt => {
        const aStart = new Date(appt.start_time);
        const aEnd = new Date(appt.end_time);
        return t < aEnd && slotEnd > aStart;
      });

      if (!overlaps) {
        slots.push({ start: new Date(t).toISOString(), end: slotEnd.toISOString() });
      }
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET appointments (admin — authenticated)
router.get('/', authMiddleware, async (req, res) => {
  const { date, staff_id, status } = req.query;
  let query = `
    SELECT a.*, s.name as service_name, s.duration_min, s.price,
           st.name as staff_name, c.name as customer_name, c.phone as customer_phone
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN staff st ON a.staff_id = st.id
    JOIN customers c ON a.customer_id = c.id
    WHERE a.salon_id = $1
  `;
  const params = [req.user.salon_id];
  let i = 2;

  if (date) { query += ` AND DATE(a.start_time) = $${i++}`; params.push(date); }
  if (staff_id) { query += ` AND a.staff_id = $${i++}`; params.push(staff_id); }
  if (status) { query += ` AND a.status = $${i++}`; params.push(status); }

  query += ' ORDER BY a.start_time';

  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create appointment (public booking)
router.post('/', async (req, res) => {
  const { slug, customer_id, staff_id, service_id, start_time, notes } = req.body;
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });
    const salon_id = salon.rows[0].id;

    const svc = await db.query('SELECT duration_min FROM services WHERE id = $1 AND salon_id = $2', [service_id, salon_id]);
    if (!svc.rows.length) return res.status(404).json({ error: 'Service not found' });

    const start = new Date(start_time);
    const end = new Date(start.getTime() + svc.rows[0].duration_min * 60000);

    const { rows } = await db.query(
      `INSERT INTO appointments (salon_id, customer_id, staff_id, service_id, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [salon_id, customer_id, staff_id, service_id, start.toISOString(), end.toISOString(), notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update appointment status (admin)
router.put('/:id', authMiddleware, async (req, res) => {
  const { status, notes } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE appointments SET status=$1, notes=$2 WHERE id=$3 AND salon_id=$4 RETURNING *',
      [status, notes, req.params.id, req.user.salon_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE cancel appointment (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query("UPDATE appointments SET status = 'cancelled' WHERE id = $1 AND salon_id = $2", [req.params.id, req.user.salon_id]);
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
