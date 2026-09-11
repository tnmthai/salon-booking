const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Demo salon.
 *
 * The previous version rebuilt the whole schedule on every "Try Demo" click:
 * it deleted all appointments, then ran ~40 SELECTs and ~360 single-row
 * INSERTs, one round trip each. On a hosted Postgres that is several seconds
 * of waiting, and two visitors clicking at once would wipe each other's data
 * mid-session.
 *
 * Now the data is seeded once, and a visit only *shifts the dates* — a single
 * UPDATE. If someone already started a demo today there is nothing to do at
 * all, so the button is effectively instant. A nightly job does the full
 * rebuild, off the visitor's path, so a day of clicking around gets cleaned up.
 */

const DEMO_EMAIL = 'demo@timia.nz';
const DEMO_SLUG = 'demo-salon';
const DEMO_TZ = 'Pacific/Auckland';
const DEMO_PASSWORD = 'demo123';

// Schedule spans these days either side of the anchor date.
const DAYS_BACK = 3;
const DAYS_FORWARD = 7;

// Postgres advisory lock key, so two simultaneous first-time visitors cannot
// both seed the salon.
const SEED_LOCK_KEY = 815234;

/* ------------------------------------------------------------- date helpers */

/** Today in a timezone, as YYYY-MM-DD. */
function todayInTz(tz) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

/** Offset of `tz` from UTC, in minutes, on a given YYYY-MM-DD. */
function tzOffsetMinutes(dateStr, tz) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const ref = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  for (const style of ['longOffset', 'shortOffset']) {
    try {
      const parts = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: style }).formatToParts(ref);
      const name = parts.find(p => p.type === 'timeZoneName')?.value || '';
      const match = name.match(/([+-])(\d{1,2})(?::(\d{2}))?/);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        return (parseInt(match[2], 10) * 60 + parseInt(match[3] || '0', 10)) * sign;
      }
    } catch { /* try the next style */ }
  }
  return 0;
}

/** A wall-clock time in `tz` on `dateStr`, as a UTC Date. */
function localToUtc(dateStr, hours, minutes, tz) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const offset = tzOffsetMinutes(dateStr, tz);
  return new Date(Date.UTC(y, m - 1, d, hours, minutes, 0) - offset * 60000);
}

/** YYYY-MM-DD, `offset` days from `dateStr`. */
function addDays(dateStr, offset) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + offset);
  return dt.toISOString().slice(0, 10);
}

/** Whole days between two YYYY-MM-DD strings (b - a). */
function daysBetween(a, b) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

/** Normalise whatever the driver hands back for a DATE column. */
function toDateStr(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(value);
  }
  return null;
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/* -------------------------------------------------------------- the schedule */

/**
 * Rebuild the demo schedule around `anchorDate`.
 * Everything goes in as one multi-row INSERT instead of ~360 separate ones.
 */
async function rebuildSchedule(client, salonId, anchorDate) {
  await client.query('DELETE FROM appointments WHERE salon_id = $1', [salonId]);
  await client.query('DELETE FROM reviews WHERE salon_id = $1', [salonId]);

  // One query for every staff/service pairing, instead of one per staff per day.
  const { rows: pairs } = await client.query(`
    SELECT ss.staff_id, s.id AS service_id, s.name, s.duration_min, s.price
    FROM staff_services ss
    JOIN services s ON s.id = ss.service_id
    JOIN staff st ON st.id = ss.staff_id
    WHERE st.salon_id = $1 AND st.is_active = true AND s.active = true
    ORDER BY ss.staff_id, s.id
  `, [salonId]);

  const { rows: customers } = await client.query(
    'SELECT id FROM customers WHERE salon_id = $1', [salonId]
  );

  if (!pairs.length || !customers.length) return 0;

  const byStaff = new Map();
  for (const p of pairs) {
    if (!byStaff.has(p.staff_id)) byStaff.set(p.staff_id, []);
    byStaff.get(p.staff_id).push(p);
  }

  const now = Date.now();
  const rows = [];

  for (let offset = -DAYS_BACK; offset <= DAYS_FORWARD; offset++) {
    const dateStr = addDays(anchorDate, offset);
    // Closed on Sundays.
    if (new Date(dateStr + 'T00:00:00Z').getUTCDay() === 0) continue;

    for (const [staffId, staffServices] of byStaff) {
      let minutes = 9 * 60;
      let idx = Math.floor(Math.random() * staffServices.length);

      while (minutes < 18 * 60) {
        const svc = staffServices[idx % staffServices.length];
        const duration = svc.duration_min || 30;
        if (minutes + duration > 18 * 60) break;

        const start = localToUtc(dateStr, Math.floor(minutes / 60), minutes % 60, DEMO_TZ);
        const end = new Date(start.getTime() + duration * 60000);
        const customer = customers[Math.floor(Math.random() * customers.length)];

        rows.push([
          salonId, customer.id, staffId, svc.service_id, svc.name,
          start.toISOString(), end.toISOString(), svc.price,
          start.getTime() < now ? 'completed' : 'confirmed',
          generateCode(),
        ]);

        minutes += duration;
        if (Math.random() > 0.6) minutes += 15; // occasional gap
        idx++;
      }
    }
  }

  if (rows.length) {
    const cols = 10;
    const values = rows
      .map((_, i) => `(${Array.from({ length: cols }, (_, c) => `$${i * cols + c + 1}`).join(',')})`)
      .join(',');
    await client.query(
      `INSERT INTO appointments
         (salon_id, customer_id, staff_id, service_id, service_name,
          start_time, end_time, price, status, booking_code)
       VALUES ${values}`,
      rows.flat()
    );
  }

  await client.query(`
    INSERT INTO reviews (salon_id, customer_name, rating, comment, created_at) VALUES
      ($1, 'Sarah K.', 5, 'Absolutely love this salon! Mai did an amazing job on my hair. Will definitely be back.', NOW() - INTERVAL '5 days'),
      ($1, 'Emily C.', 5, 'Best nail salon in Auckland. The gel nails lasted 3 weeks!', NOW() - INTERVAL '3 days'),
      ($1, 'Jessica P.', 4, 'Great service and very friendly staff. The facial was so relaxing.', NOW() - INTERVAL '1 day')
  `, [salonId]);

  await client.query('UPDATE salons SET demo_anchor = $1 WHERE id = $2', [anchorDate, salonId]);
  return rows.length;
}

/* ------------------------------------------------------------------ seeding */

/** Create the demo salon and its fixed data. Runs at most once. */
async function seedDemoSalon(client, today) {
  const salon = await client.query(
    `INSERT INTO salons (name, slug, phone, email, address, timezone, plan, trial_plan, trial_ends_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    ['Timia Demo Salon', DEMO_SLUG, '021-000-0000', DEMO_EMAIL, '123 Queen Street, Auckland',
      DEMO_TZ, 'free', 'growth', new Date(Date.now() + 30 * 86400000).toISOString()]
  );
  const salonId = salon.rows[0].id;

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await client.query(
    'INSERT INTO users (salon_id, email, password_hash, name, role) VALUES ($1,$2,$3,$4,$5)',
    [salonId, DEMO_EMAIL, hash, 'Demo Owner', 'owner']
  );

  const services = await client.query(`
    INSERT INTO services (salon_id, name, description, duration_min, price, category) VALUES
      ($1, 'Classic Haircut', 'Professional haircut with wash and style', 30, 35.00, 'Hair'),
      ($1, 'Hair Coloring', 'Full color treatment with premium products', 90, 85.00, 'Hair'),
      ($1, 'Blow Dry', 'Wash and blow dry styling', 45, 40.00, 'Hair'),
      ($1, 'Manicure', 'Nail shaping, cuticle care, and polish', 30, 25.00, 'Nails'),
      ($1, 'Pedicure', 'Foot soak, nail care, and polish', 45, 35.00, 'Nails'),
      ($1, 'Gel Nails', 'Long-lasting gel nail application', 60, 45.00, 'Nails'),
      ($1, 'Classic Facial', 'Deep cleansing facial treatment', 60, 60.00, 'Skin'),
      ($1, 'Eyebrow Shaping', 'Threading or waxing', 15, 15.00, 'Beauty'),
      ($1, 'Full Body Massage', 'Relaxation massage', 60, 70.00, 'Spa'),
      ($1, 'Lash Extensions', 'Classic or volume lash extensions', 90, 90.00, 'Beauty')
    RETURNING id
  `, [salonId]);

  const staff = await client.query(`
    INSERT INTO staff (salon_id, name, email, phone, color, is_active) VALUES
      ($1, 'Mai Nguyen', 'mai@demo.com', '021-111-1111', '#ec4899', true),
      ($1, 'Linh Tran', 'linh@demo.com', '021-222-2222', '#8b5cf6', true),
      ($1, 'Han Le', 'han@demo.com', '021-333-3333', '#f59e0b', true),
      ($1, 'Thu Pham', 'thu@demo.com', '021-444-4444', '#10b981', true)
    RETURNING id
  `, [salonId]);

  // Every staff member does a fixed slice of the menu — deterministic, so the
  // demo looks the same each time, and always at least four services each.
  const linkRows = [];
  staff.rows.forEach((s, si) => {
    services.rows.forEach((sv, vi) => {
      if ((vi + si) % 2 === 0 || vi % 4 === si) linkRows.push([s.id, sv.id]);
    });
  });
  if (linkRows.length) {
    const values = linkRows.map((_, i) => `($${i * 2 + 1},$${i * 2 + 2})`).join(',');
    await client.query(
      `INSERT INTO staff_services (staff_id, service_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      linkRows.flat()
    );
  }

  // Mon–Sat, 9am–6pm.
  const hourRows = [];
  for (let day = 1; day <= 6; day++) {
    for (const s of staff.rows) hourRows.push([salonId, s.id, day, '09:00', '18:00']);
  }
  const hourValues = hourRows
    .map((_, i) => `($${i * 5 + 1},$${i * 5 + 2},$${i * 5 + 3},$${i * 5 + 4},$${i * 5 + 5})`)
    .join(',');
  await client.query(
    `INSERT INTO working_hours (salon_id, staff_id, day_of_week, start_time, end_time)
     VALUES ${hourValues} ON CONFLICT DO NOTHING`,
    hourRows.flat()
  );

  await client.query(`
    INSERT INTO customers (salon_id, name, phone, email) VALUES
      ($1, 'Sarah Kim', '021-555-0001', 'sarah@email.com'),
      ($1, 'Emily Chen', '021-555-0002', 'emily@email.com'),
      ($1, 'Jessica Park', '021-555-0003', 'jess@email.com'),
      ($1, 'Anna Lee', '021-555-0004', 'anna@email.com'),
      ($1, 'Mika Patel', '021-555-0005', 'mika@email.com')
  `, [salonId]);

  await rebuildSchedule(client, salonId, today);
  return salonId;
}

/* ------------------------------------------------------------------ refresh */

/**
 * Bring an existing demo salon up to today.
 * Same-day visit: nothing at all. Otherwise one UPDATE to slide every
 * appointment forward, and one to put the statuses back in order.
 */
async function refreshDates(salonId, anchor, today) {
  if (anchor === today) return 'fresh';

  const shift = daysBetween(anchor, today);
  if (!Number.isFinite(shift) || shift === 0) return 'fresh';

  await db.query(
    `UPDATE appointments
        SET start_time = start_time + ($1 || ' days')::interval,
            end_time   = end_time   + ($1 || ' days')::interval
      WHERE salon_id = $2`,
    [String(shift), salonId]
  );
  await db.query(
    `UPDATE appointments
        SET status = CASE WHEN start_time < NOW() THEN 'completed' ELSE 'confirmed' END,
            reminder_sent = false
      WHERE salon_id = $1 AND status <> 'cancelled'`,
    [salonId]
  );
  await db.query('UPDATE salons SET demo_anchor = $1 WHERE id = $2', [today, salonId]);
  return 'shifted';
}

/* --------------------------------------------------------------- the route */

router.post('/start', async (req, res) => {
  try {
    const today = todayInTz(DEMO_TZ);
    let salon = await db.query('SELECT * FROM salons WHERE slug = $1', [DEMO_SLUG]);

    if (salon.rows.length === 0) {
      // Seed under an advisory lock so concurrent first visitors do not race.
      const client = await db.connect();
      try {
        await client.query('SELECT pg_advisory_lock($1)', [SEED_LOCK_KEY]);
        const again = await client.query('SELECT id FROM salons WHERE slug = $1', [DEMO_SLUG]);
        if (again.rows.length === 0) {
          await client.query('BEGIN');
          try {
            await seedDemoSalon(client, today);
            await client.query('COMMIT');
            console.log('[DEMO] demo salon seeded');
          } catch (err) {
            await client.query('ROLLBACK');
            throw err;
          }
        }
      } finally {
        await client.query('SELECT pg_advisory_unlock($1)', [SEED_LOCK_KEY]).catch(() => {});
        client.release();
      }
      salon = await db.query('SELECT * FROM salons WHERE slug = $1', [DEMO_SLUG]);
    } else {
      const s = salon.rows[0];
      const anchor = toDateStr(s.demo_anchor);
      if (!anchor) {
        // Salon predates the anchor column (or was left half-built by the old
        // code). Rebuild once, then it is on the cheap path forever after.
        const client = await db.connect();
        try {
          await client.query('BEGIN');
          await rebuildSchedule(client, s.id, today);
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK').catch(() => {});
          throw err;
        } finally {
          client.release();
        }
      } else {
        await refreshDates(s.id, anchor, today);
      }
      await db.query(
        'UPDATE salons SET trial_plan = $1, trial_ends_at = $2 WHERE id = $3',
        ['growth', new Date(Date.now() + 30 * 86400000).toISOString(), s.id]
      );
      salon = await db.query('SELECT * FROM salons WHERE slug = $1', [DEMO_SLUG]);
    }

    const salonData = salon.rows[0];
    if (!salonData) return res.status(500).json({ error: 'Demo is unavailable right now' });

    const user = await db.query('SELECT * FROM users WHERE email = $1', [DEMO_EMAIL]);
    if (!user.rows.length) return res.status(500).json({ error: 'Demo is unavailable right now' });
    const u = user.rows[0];

    const token = jwt.sign(
      { id: u.id, salon_id: u.salon_id || salonData.id, email: u.email, role: u.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      salon: { id: salonData.id, name: salonData.name, slug: salonData.slug, plan: salonData.plan },
      user: { id: u.id, email: u.email, name: u.name, role: u.role },
      message: 'Demo session started! Explore the dashboard freely.',
    });
  } catch (err) {
    console.error('[DEMO ERROR]', err);
    res.status(500).json({ error: 'Failed to start demo' });
  }
});

/* --------------------------------------------------- nightly housekeeping */

/**
 * Visitors can cancel bookings, add services and generally make a mess. Rather
 * than resetting on their click (which is what made the button slow), rebuild
 * once a night at 4am NZ.
 */
let lastNightlyReset = null;

async function nightlyReset() {
  try {
    const today = todayInTz(DEMO_TZ);
    const hour = parseInt(new Intl.DateTimeFormat('en-NZ', {
      timeZone: DEMO_TZ, hour: '2-digit', hour12: false,
    }).format(new Date()), 10);
    if (hour !== 4 || lastNightlyReset === today) return;

    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [DEMO_SLUG]);
    if (!salon.rows.length) return;

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const count = await rebuildSchedule(client, salon.rows[0].id, today);
      await client.query('COMMIT');
      lastNightlyReset = today;
      console.log(`[DEMO] nightly reset: ${count} appointments`);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[DEMO] nightly reset failed:', err.message);
  }
}

setInterval(nightlyReset, 30 * 60 * 1000);

module.exports = router;
