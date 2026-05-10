const router = require('express').Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const isSuperAdmin = (email) => email === 'admin@tnmthai.com';

async function getSalonTimezone(salonId) {
  if (!salonId) return 'Pacific/Auckland';
  try {
    const result = await db.query('SELECT timezone FROM salons WHERE id = $1', [salonId]);
    return result.rows[0]?.timezone || 'Pacific/Auckland';
  } catch { return 'Pacific/Auckland'; }
}

// GET appointments (super admin: all shops, normal: own salon)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, status, staff_id } = req.query;
    let where = [];
    let params = [];
    let idx = 1;

    // Get salon timezone for date filtering
    let tz = 'Pacific/Auckland';
    if (req.user.salon_id) {
      const salonResult = await db.query('SELECT timezone FROM salons WHERE id = $1', [req.user.salon_id]);
      if (salonResult.rows[0]?.timezone) tz = salonResult.rows[0].timezone;
    }

    if (!isSuperAdmin(req.user.email)) {
      where.push(`a.salon_id = $${idx++}`);
      params.push(req.user.salon_id);
    }
    if (date) {
      // Convert NZ date to UTC range in JS (AT TIME ZONE can't use params)
      const dayStart = new Date(date + 'T00:00:00');
      const dayEnd = new Date(date + 'T23:59:59');
      // Get UTC offsets for this timezone
      const startStr = dayStart.toLocaleString('en-US', { timeZone: tz });
      const endStr = dayEnd.toLocaleString('en-US', { timeZone: tz });
      const startOff = new Date(startStr).getTime() - dayStart.getTime();
      const endOff = new Date(endStr).getTime() - dayEnd.getTime();
      const utcStart = new Date(dayStart.getTime() - startOff);
      const utcEnd = new Date(dayEnd.getTime() - endOff);
      where.push(`a.start_time >= $${idx++} AND a.start_time <= $${idx++}`);
      params.push(utcStart.toISOString(), utcEnd.toISOString());
    }
    if (status) {
      where.push(`a.status = $${idx++}`);
      params.push(status);
    }
    if (staff_id) {
      where.push(`a.staff_id = $${idx++}`);
      params.push(staff_id);
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
    const { slug, staff_id, service_id, date, duration: customDuration, service_ids } = req.query;
    if (!slug || !staff_id || !date) {
      return res.status(400).json({ error: 'Missing required params: slug, staff_id, date' });
    }

    const salonResult = await db.query('SELECT id, timezone FROM salons WHERE slug = $1', [slug]);
    const salonId = salonResult.rows[0]?.id;
    const tz = salonResult.rows[0]?.timezone || 'Pacific/Auckland';

    // Get salon
    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });
    const salon_id = salon.rows[0].id;

    // Get service duration — support multiple services (Priority 6)
    let duration;
    if (customDuration) {
      duration = parseInt(customDuration);
    } else if (service_ids) {
      const ids = service_ids.split(',').map(Number);
      const svcs = await db.query('SELECT duration_min FROM services WHERE id = ANY($1) AND salon_id = $2', [ids, salon_id]);
      duration = svcs.rows.reduce((sum, s) => sum + s.duration_min, 0);
    } else if (service_id) {
      const svc = await db.query('SELECT duration_min FROM services WHERE id = $1 AND salon_id = $2', [service_id, salon_id]);
      if (!svc.rows.length) return res.status(404).json({ error: 'Service not found' });
      duration = svc.rows[0].duration_min;
    } else {
      return res.status(400).json({ error: 'Provide service_id, service_ids, or duration' });
    }

    // Check for working hours overrides first (Priority 5)
    const override = await db.query(
      'SELECT is_active, start_time, end_time FROM working_hours_overrides WHERE staff_id = $1 AND date = $2',
      [staff_id, date]
    );

    let workStart, workEnd;
    if (override.rows.length > 0) {
      if (!override.rows[0].is_active) return res.json([]); // Day off override
      workStart = override.rows[0].start_time;
      workEnd = override.rows[0].end_time;
    } else {
      // Fall back to regular working hours
      const dayOfWeek = new Date(date + 'T00:00:00').getDay();
      const wh = await db.query(
        'SELECT start_time, end_time FROM working_hours WHERE staff_id = $1 AND day_of_week = $2 AND is_active = true',
        [staff_id, dayOfWeek]
      );
      if (!wh.rows.length) return res.json([]); // Staff doesn't work this day
      workStart = wh.rows[0].start_time;
      workEnd = wh.rows[0].end_time;
    }

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
      const nzStr = nzDate.toLocaleString('en-US', { timeZone: tz });
      const utcDate = new Date(utcStr);
      const nzRef = new Date(nzStr);
      const offsetMs = nzRef.getTime() - utcDate.getTime();
      // Subtract offset to get UTC
      return new Date(nzDate.getTime() - offsetMs);
    }

    // Get existing appointments for this staff on this date
    // Convert date to UTC range using timezone
    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd = new Date(date + 'T23:59:59');
    const startStr = dayStart.toLocaleString('en-US', { timeZone: tz });
    const endStr = dayEnd.toLocaleString('en-US', { timeZone: tz });
    const startOff = new Date(startStr).getTime() - dayStart.getTime();
    const endOff = new Date(endStr).getTime() - dayEnd.getTime();
    const utcStart = new Date(dayStart.getTime() - startOff);
    const utcEnd = new Date(dayEnd.getTime() - endOff);
    const appts = await db.query(
      `SELECT start_time, end_time FROM appointments 
       WHERE staff_id = $1 AND start_time >= $2 AND start_time <= $3 AND status != 'cancelled'`,
      [staff_id, utcStart.toISOString(), utcEnd.toISOString()]
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
  const { salon_id, service_id, service_ids, staff_id, customer_name, customer_phone, customer_email, start_time, notes } = req.body;
  try {
    // Get salon timezone
    const tz = await getSalonTimezone(salon_id);

    // Support multiple services (Priority 6)
    const allServiceIds = service_ids && service_ids.length > 0 ? service_ids : [service_id];
    const svcs = await db.query('SELECT id, name, duration_min, price FROM services WHERE id = ANY($1)', [allServiceIds]);
    if (svcs.rows.length === 0) return res.status(400).json({ error: 'Service not found' });

    const totalDuration = svcs.rows.reduce((sum, s) => sum + s.duration_min, 0);
    const totalPrice = svcs.rows.reduce((sum, s) => sum + parseFloat(s.price), 0);
    const serviceName = svcs.rows.map(s => s.name).join(', ');
    const primaryService = svcs.rows[0];
    const duration_min = totalDuration;
    const price = totalPrice;
    const end_time = new Date(new Date(start_time).getTime() + totalDuration * 60000).toISOString();

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

    // Generate unique booking code (8 chars, alphanumeric)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let bookingCode;
    for (let i = 0; i < 10; i++) {
      bookingCode = Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const exists = await db.query('SELECT id FROM appointments WHERE booking_code = $1', [bookingCode]);
      if (!exists.rows.length) break;
    }

    const { rows } = await db.query(
      'INSERT INTO appointments (salon_id, service_id, staff_id, customer_id, start_time, end_time, price, status, booking_code, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [salon_id, primaryService.id, staff_id, customer_id, start_time, end_time, price, 'confirmed', bookingCode, notes || null]
    );

    // Store multiple services in junction table (Priority 6)
    if (allServiceIds.length > 1) {
      for (const svc of svcs.rows) {
        await db.query(
          'INSERT INTO appointment_services (appointment_id, service_id, price, duration_min) VALUES ($1, $2, $3, $4)',
          [rows[0].id, svc.id, svc.price, svc.duration_min]
        );
      }
    } else {
      await db.query(
        'INSERT INTO appointment_services (appointment_id, service_id, price, duration_min) VALUES ($1, $2, $3, $4)',
        [rows[0].id, primaryService.id, primaryService.price, primaryService.duration_min]
      );
    }

    // Send email notifications (non-blocking)
    const bookingDate = new Date(start_time);
    const dateStr = bookingDate.toLocaleDateString('en-NZ', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = bookingDate.toLocaleTimeString('en-NZ', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
    const emailData = { customerName: customer_name, salonName: salon.name || 'Salon', serviceName, staffName, date: dateStr, time: timeStr, duration: duration_min, price, address: salon.address, customerPhone: customer_phone, customerEmail: customer_email, notes, bookingCode };

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

// GET public lookup by booking code or phone
router.get('/lookup', async (req, res) => {
  const { code, phone } = req.query;
  if (!code && !phone) return res.status(400).json({ error: 'Provide code or phone' });
  try {
    let query, params;
    if (code) {
      query = `
        SELECT a.*, s.name as service_name, st.name as staff_name,
               sal.name as salon_name, sal.address as salon_address,
               c.name as customer_name, c.phone as customer_phone, c.email as customer_email
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN staff st ON a.staff_id = st.id
        JOIN salons sal ON a.salon_id = sal.id
        JOIN customers c ON a.customer_id = c.id
        WHERE a.booking_code = $1
        ORDER BY a.start_time DESC`;
      params = [code.toUpperCase()];
    } else {
      query = `
        SELECT a.*, s.name as service_name, st.name as staff_name,
               sal.name as salon_name, sal.address as salon_address,
               c.name as customer_name, c.phone as customer_phone, c.email as customer_email
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN staff st ON a.staff_id = st.id
        JOIN salons sal ON a.salon_id = sal.id
        JOIN customers c ON a.customer_id = c.id
        WHERE c.phone = $1
        ORDER BY a.start_time DESC`;
      params = [phone];
    }
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'No bookings found' });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT cancel appointment (public — by booking_code or phone)
router.put('/:id/cancel', async (req, res) => {
  const { booking_code, phone } = req.body;
  if (!booking_code && !phone) return res.status(400).json({ error: 'Provide booking_code or phone' });
  try {
    let tz = 'Pacific/Auckland';
    // Verify ownership
    let verifyQuery, verifyParams;
    if (booking_code) {
      verifyQuery = `SELECT a.*, c.phone as customer_phone, c.email as customer_email, c.name as customer_name,
        s.name as service_name, st.name as staff_name, sal.name as salon_name, sal.address as salon_address
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        JOIN services s ON a.service_id = s.id
        JOIN staff st ON a.staff_id = st.id
        JOIN salons sal ON a.salon_id = sal.id
        WHERE a.id = $1 AND a.booking_code = $2`;
      verifyParams = [req.params.id, booking_code.toUpperCase()];
    } else {
      verifyQuery = `SELECT a.*, c.phone as customer_phone, c.email as customer_email, c.name as customer_name,
        s.name as service_name, st.name as staff_name, sal.name as salon_name, sal.address as salon_address
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        JOIN services s ON a.service_id = s.id
        JOIN staff st ON a.staff_id = st.id
        JOIN salons sal ON a.salon_id = sal.id
        WHERE a.id = $1 AND c.phone = $2`;
      verifyParams = [req.params.id, phone];
    }
    const verify = await db.query(verifyQuery, verifyParams);
    if (!verify.rows.length) return res.status(404).json({ error: 'Appointment not found or credentials do not match' });

    const appt = verify.rows[0];
    tz = await getSalonTimezone(appt.salon_id);

    // Check 3-hour rule
    const now = new Date();
    const startTime = new Date(appt.start_time);
    const hoursUntil = (startTime - now) / (1000 * 60 * 60);
    if (hoursUntil < 3) {
      return res.status(400).json({ error: 'Cannot cancel less than 3 hours before appointment' });
    }

    if (appt.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    const { rows } = await db.query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    // Send cancellation email (non-blocking)
    try {
      const { sendEmail, cancellationEmail } = require('../utils/email');
      if (appt.customer_email) {
        const bookingDate = new Date(appt.start_time);
        const dateStr = bookingDate.toLocaleDateString('en-NZ', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = bookingDate.toLocaleTimeString('en-NZ', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
        sendEmail(appt.customer_email, `Booking Cancelled - ${appt.salon_name}`,
          cancellationEmail({ customerName: appt.customer_name, salonName: appt.salon_name, serviceName: appt.service_name, staffName: appt.staff_name, date: dateStr, time: timeStr })
        ).catch(e => console.error('[EMAIL] Cancel email error:', e.message));
      }
    } catch (e) { console.error('[EMAIL] Cancel module error:', e.message); }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT reschedule appointment (public — by booking_code or phone)
router.put('/:id/reschedule', async (req, res) => {
  const { booking_code, phone, start_time } = req.body;
  if (!booking_code && !phone) return res.status(400).json({ error: 'Provide booking_code or phone' });
  if (!start_time) return res.status(400).json({ error: 'Provide new start_time' });
  try {
    // Verify ownership
    let verifyQuery, verifyParams;
    if (booking_code) {
      verifyQuery = `SELECT a.*, c.phone as customer_phone, c.email as customer_email, c.name as customer_name,
        s.name as service_name, s.duration_min, st.name as staff_name, sal.name as salon_name, sal.address as salon_address
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        JOIN services s ON a.service_id = s.id
        JOIN staff st ON a.staff_id = st.id
        JOIN salons sal ON a.salon_id = sal.id
        WHERE a.id = $1 AND a.booking_code = $2`;
      verifyParams = [req.params.id, booking_code.toUpperCase()];
    } else {
      verifyQuery = `SELECT a.*, c.phone as customer_phone, c.email as customer_email, c.name as customer_name,
        s.name as service_name, s.duration_min, st.name as staff_name, sal.name as salon_name, sal.address as salon_address
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        JOIN services s ON a.service_id = s.id
        JOIN staff st ON a.staff_id = st.id
        JOIN salons sal ON a.salon_id = sal.id
        WHERE a.id = $1 AND c.phone = $2`;
      verifyParams = [req.params.id, phone];
    }
    const verify = await db.query(verifyQuery, verifyParams);
    if (!verify.rows.length) return res.status(404).json({ error: 'Appointment not found or credentials do not match' });

    const appt = verify.rows[0];
    tz = await getSalonTimezone(appt.salon_id);

    // Check 3-hour rule
    const now = new Date();
    const startTime = new Date(appt.start_time);
    const hoursUntil = (startTime - now) / (1000 * 60 * 60);
    if (hoursUntil < 3) {
      return res.status(400).json({ error: 'Cannot reschedule less than 3 hours before appointment' });
    }

    if (appt.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot reschedule a cancelled appointment' });
    }

    // Check for conflicts
    const newStart = new Date(start_time);
    const newEnd = new Date(newStart.getTime() + appt.duration_min * 60000);
    const conflicts = await db.query(
      `SELECT id FROM appointments WHERE staff_id = $1 AND status != 'cancelled' AND id != $2
       AND start_time < $3 AND end_time > $4`,
      [appt.staff_id, req.params.id, newEnd.toISOString(), newStart.toISOString()]
    );
    if (conflicts.rows.length) {
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    const { rows } = await db.query(
      'UPDATE appointments SET start_time = $1, end_time = $2 WHERE id = $3 RETURNING *',
      [newStart.toISOString(), newEnd.toISOString(), req.params.id]
    );

    // Send reschedule email (non-blocking)
    try {
      const { sendEmail, rescheduleEmail } = require('../utils/email');
      if (appt.customer_email) {
        const oldDate = new Date(appt.start_time);
        const oldDateStr = oldDate.toLocaleDateString('en-NZ', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const oldTimeStr = oldDate.toLocaleTimeString('en-NZ', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
        const newDateStr = newStart.toLocaleDateString('en-NZ', { timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const newTimeStr = newStart.toLocaleTimeString('en-NZ', { timeZone: tz, hour: '2-digit', minute: '2-digit' });
        sendEmail(appt.customer_email, `Booking Rescheduled - ${appt.salon_name}`,
          rescheduleEmail({ customerName: appt.customer_name, salonName: appt.salon_name, serviceName: appt.service_name, staffName: appt.staff_name, oldDate: oldDateStr, oldTime: oldTimeStr, newDate: newDateStr, newTime: newTimeStr })
        ).catch(e => console.error('[EMAIL] Reschedule email error:', e.message));
      }
    } catch (e) { console.error('[EMAIL] Reschedule module error:', e.message); }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update appointment status
router.put('/:id', authMiddleware, async (req, res) => {
  const { status, start_time, end_time, staff_id, price, service_name } = req.body;
  try {
    let query, params;
    const updates = [];
    const values = [];
    let idx = 1;

    if (status) { updates.push(`status=$${idx++}`); values.push(status); }
    if (start_time) { updates.push(`start_time=$${idx++}`); values.push(start_time); }
    if (end_time) { updates.push(`end_time=$${idx++}`); values.push(end_time); }
    if (staff_id) { updates.push(`staff_id=$${idx++}`); values.push(staff_id); }
    if (price !== undefined) { updates.push(`price=$${idx++}`); values.push(price); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    if (isSuperAdmin(req.user.email)) {
      query = `UPDATE appointments SET ${updates.join(', ')} WHERE id=$${idx++} RETURNING *`;
      values.push(req.params.id);
    } else {
      query = `UPDATE appointments SET ${updates.join(', ')} WHERE id=$${idx++} AND salon_id=$${idx++} RETURNING *`;
      values.push(req.params.id, req.user.salon_id);
    }
    params = values;
    const { rows } = await db.query(query, params);
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
