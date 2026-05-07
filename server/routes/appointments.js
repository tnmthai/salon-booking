const router = require('express').Router();
const db = require('../db');

// GET appointments (with filters)
router.get('/', async (req, res) => {
  const { date, staff_id, status } = req.query;
  let query = `
    SELECT a.*, s.name as service_name, s.duration_min, s.price,
           st.name as staff_name, c.name as customer_name, c.phone as customer_phone
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN staff st ON a.staff_id = st.id
    JOIN customers c ON a.customer_id = c.id
    WHERE 1=1
  `;
  const params = [];
  let i = 1;

  if (date) {
    query += ` AND DATE(a.start_time) = $${i++}`;
    params.push(date);
  }
  if (staff_id) {
    query += ` AND a.staff_id = $${i++}`;
    params.push(staff_id);
  }
  if (status) {
    query += ` AND a.status = $${i++}`;
    params.push(status);
  }

  query += ' ORDER BY a.start_time';

  try {
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET available time slots for a staff+service+date
router.get('/slots', async (req, res) => {
  const { staff_id, service_id, date } = req.query;
  if (!staff_id || !service_id || !date) {
    return res.status(400).json({ error: 'staff_id, service_id, and date required' });
  }

  try {
    // Get service duration
    const svc = await db.query('SELECT duration_min FROM services WHERE id = $1', [service_id]);
    if (!svc.rows.length) return res.status(404).json({ error: 'Service not found' });
    const duration = svc.rows[0].duration_min;

    // Get existing appointments for that staff on that date
    const appts = await db.query(
      `SELECT start_time, end_time FROM appointments
       WHERE staff_id = $1 AND DATE(start_time) = $2 AND status != 'cancelled'
       ORDER BY start_time`,
      [staff_id, date]
    );

    // Generate slots (9am - 6pm, 30min intervals)
    const slots = [];
    const dayStart = new Date(`${date}T09:00:00`);
    const dayEnd = new Date(`${date}T18:00:00`);

    for (let t = new Date(dayStart); t < dayEnd; t.setMinutes(t.getMinutes() + 30)) {
      const slotEnd = new Date(t.getTime() + duration * 60000);
      if (slotEnd > dayEnd) break;

      const overlaps = appts.rows.some(appt => {
        const aStart = new Date(appt.start_time);
        const aEnd = new Date(appt.end_time);
        return t < aEnd && slotEnd > aStart;
      });

      if (!overlaps) {
        slots.push({
          start: new Date(t).toISOString(),
          end: slotEnd.toISOString(),
        });
      }
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create appointment
router.post('/', async (req, res) => {
  const { customer_id, staff_id, service_id, start_time, notes } = req.body;
  try {
    // Get service duration to calculate end_time
    const svc = await db.query('SELECT duration_min FROM services WHERE id = $1', [service_id]);
    if (!svc.rows.length) return res.status(404).json({ error: 'Service not found' });

    const start = new Date(start_time);
    const end = new Date(start.getTime() + svc.rows[0].duration_min * 60000);

    const { rows } = await db.query(
      `INSERT INTO appointments (customer_id, staff_id, service_id, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [customer_id, staff_id, service_id, start.toISOString(), end.toISOString(), notes]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update appointment status
router.put('/:id', async (req, res) => {
  const { status, notes } = req.body;
  try {
    const { rows } = await db.query(
      'UPDATE appointments SET status=$1, notes=$2 WHERE id=$3 RETURNING *',
      [status, notes, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE cancel appointment
router.delete('/:id', async (req, res) => {
  try {
    await db.query("UPDATE appointments SET status = 'cancelled' WHERE id = $1", [req.params.id]);
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
