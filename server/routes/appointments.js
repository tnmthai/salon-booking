const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const isSuperAdmin = (email) => email === 'admin@tnmthai.com';

// GET appointments (super admin: all shops, normal: own salon)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, status } = req.query;
    let where = [];
    let params = [];
    let idx = 1;

    if (!isSuperAdmin(req.user.email)) {
      where.push(`a.salon_id = $${idx++}`);
      params.push(req.user.salon_id);
    }
    if (date) {
      where.push(`DATE(a.start_time) = $${idx++}`);
      params.push(date);
    }
    if (status) {
      where.push(`a.status = $${idx++}`);
      params.push(status);
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const { rows } = await db.query(`
      SELECT a.*, 
        c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
        s.name as service_name, s.price as service_price,
        st.name as staff_name,
        sal.name as salon_name
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN staff st ON a.staff_id = st.id
      LEFT JOIN salons sal ON a.salon_id = sal.id
      ${whereClause}
      ORDER BY a.start_time ASC
    `, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET available time slots for booking
router.get('/slots', async (req, res) => {
  try {
    const { slug, staff_id, service_id, date } = req.query;
    if (!slug || !staff_id || !service_id || !date) {
      return res.status(400).json({ error: 'Missing required params: slug, staff_id, service_id, date' });
    }

    // Get salon
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });
    const salon_id = salon.rows[0].id;

    // Get service duration
    const svc = await db.query('SELECT duration_min FROM services WHERE id = $1 AND salon_id = $2', [service_id, salon_id]);
    if (!svc.rows.length) return res.status(404).json({ error: 'Service not found' });
    const duration = svc.rows[0].duration_min;

    // Get working hours for this staff on this day of week
    const dayOfWeek = new Date(date + 'T00:00:00').getDay();
    const wh = await db.query(
      'SELECT start_time, end_time FROM working_hours WHERE staff_id = $1 AND day_of_week = $2 AND is_active = true',
      [staff_id, dayOfWeek]
    );
    if (!wh.rows.length) return res.json([]); // Staff doesn't work this day

    const { start_time: workStart, end_time: workEnd } = wh.rows[0];

    // Convert NZ working hours to UTC for slot generation
    // NZ timezone: UTC+12 (NZST) in winter, UTC+13 (NZDT) in summer
    // Use Intl to get the correct offset for the given date
    function nzToUtc(d, hours, minutes) {
      // Create a date string in NZ timezone, then parse as UTC
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(hours).padStart(2, '0');
      const min = String(minutes).padStart(2, '0');
      // Get NZ offset for this date
      const nzDate = new Date(`${y}-${m}-${day}T${h}:${min}:00`);
      // Figure out offset: format the NZ date in UTC and compare
      const utcStr = nzDate.toLocaleString('en-US', { timeZone: 'UTC' });
      const nzStr = nzDate.toLocaleString('en-US', { timeZone: 'Pacific/Auckland' });
      const utcDate = new Date(utcStr);
      const nzRef = new Date(nzStr);
      const offsetMs = nzRef.getTime() - utcDate.getTime();
      // Subtract offset to get UTC
      return new Date(nzDate.getTime() - offsetMs);
    }

    // Get existing appointments for this staff on this date
    const appts = await db.query(
      `SELECT start_time, end_time FROM appointments 
       WHERE staff_id = $1 AND DATE(start_time AT TIME ZONE 'Pacific/Auckland') = $2 AND status != 'cancelled'`,
      [staff_id, date]
    );

    // Generate slots at 30-min intervals in UTC
    const slots = [];
    const [startH, startM] = workStart.split(':').map(Number);
    const [endH, endM] = workEnd.split(':').map(Number);
    const baseDate = new Date(date + 'T12:00:00'); // noon to avoid date boundary issues
    let current = nzToUtc(baseDate, startH, startM);
    const end = nzToUtc(baseDate, endH, endM);

    const now = new Date();

    while (current.getTime() + duration * 60000 <= end.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + duration * 60000);

      // Skip past slots
      if (slotStart > now) {
        // Check overlap with existing appointments
        const overlaps = appts.rows.some(a => {
          const aStart = new Date(a.start_time);
          const aEnd = new Date(a.end_time);
          return slotStart < aEnd && slotEnd > aStart;
        });

        if (!overlaps) {
          slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
        }
      }

      current.setMinutes(current.getMinutes() + 30);
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET appointments for a salon (by slug — public, for booking page)
router.get('/public/:slug', async (req, res) => {
  try {
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [req.params.slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });
    const { date, staff_id } = req.query;
    if (!date) return res.json([]);

    let query = `SELECT a.start_time, a.end_time, a.staff_id FROM appointments a WHERE a.salon_id = $1 AND DATE(a.start_time) = $2 AND a.status != 'cancelled'`;
    let params = [salon.rows[0].id, date];
    if (staff_id) { query += ' AND a.staff_id = $3'; params.push(staff_id); }
    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create appointment (public — for booking page)
router.post('/public', async (req, res) => {
  const { salon_id, service_id, staff_id, customer_name, customer_phone, customer_email, start_time, notes } = req.body;
  try {
    const svc = await db.query('SELECT id, name, duration_min, price FROM services WHERE id = $1', [service_id]);
    if (!svc.rows.length) return res.status(400).json({ error: 'Service not found' });
    const { name: serviceName, duration_min, price } = svc.rows[0];
    const end_time = new Date(new Date(start_time).getTime() + duration_min * 60000).toISOString();

    // Get staff name
    const staffResult = await db.query('SELECT name FROM staff WHERE id = $1', [staff_id]);
    const staffName = staffResult.rows[0]?.name || 'Staff';

    // Get salon info
    const salonResult = await db.query('SELECT name, address, email FROM salons WHERE id = $1', [salon_id]);
    const salon = salonResult.rows[0] || {};

    let customer = await db.query('SELECT id FROM customers WHERE salon_id = $1 AND phone = $2', [salon_id, customer_phone]);
    if (!customer.rows.length) {
      customer = await db.query('INSERT INTO customers (salon_id, name, phone, email) VALUES ($1, $2, $3, $4) RETURNING id', [salon_id, customer_name, customer_phone, customer_email]);
    }
    const customer_id = customer.rows[0].id;

    const { rows } = await db.query(
      'INSERT INTO appointments (salon_id, service_id, staff_id, customer_id, start_time, end_time, price, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [salon_id, service_id, staff_id, customer_id, start_time, end_time, price, 'confirmed', notes || null]
    );

    // Send email notifications (non-blocking)
    const bookingDate = new Date(start_time);
    const dateStr = bookingDate.toLocaleDateString('en-NZ', { timeZone: 'Pacific/Auckland', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = bookingDate.toLocaleTimeString('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit' });
    const emailData = { customerName: customer_name, salonName: salon.name || 'Salon', serviceName, staffName, date: dateStr, time: timeStr, duration: duration_min, price, address: salon.address, customerPhone: customer_phone, customerEmail: customer_email, notes };

    try {
      const { sendEmail, bookingConfirmationEmail, shopOwnerNotificationEmail } = require('../utils/email');

      // Email to customer
      if (customer_email) {
        console.log(`[EMAIL] Sending confirmation to customer: ${customer_email}`);
        sendEmail(customer_email, `Booking Confirmed - ${salon.name}`, bookingConfirmationEmail(emailData))
          .then(r => { if(r) console.log(`[EMAIL] ✅ Customer email sent`); else console.log(`[EMAIL] ⚠️ Customer email skipped/failed`); })
          .catch(e => console.error(`[EMAIL] ❌ Customer email error:`, e.message));
      }

      // Email to shop owner
      if (salon.email) {
        console.log(`[EMAIL] Sending notification to owner: ${salon.email}`);
        sendEmail(salon.email, `New Booking - ${customer_name} on ${dateStr}`, shopOwnerNotificationEmail(emailData))
          .then(r => { if(r) console.log(`[EMAIL] ✅ Owner email sent`); else console.log(`[EMAIL] ⚠️ Owner email skipped/failed`); })
          .catch(e => console.error(`[EMAIL] ❌ Owner email error:`, e.message));
      }
    } catch (emailErr) {
      console.error(`[EMAIL] ❌ Email module error:`, emailErr.message);
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update appointment status
router.put('/:id', authMiddleware, async (req, res) => {
  const { status } = req.body;
  try {
    let query, params;
    if (isSuperAdmin(req.user.email)) {
      query = 'UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *';
      params = [status, req.params.id];
    } else {
      query = 'UPDATE appointments SET status=$1 WHERE id=$2 AND salon_id=$3 RETURNING *';
      params = [status, req.params.id, req.user.salon_id];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
