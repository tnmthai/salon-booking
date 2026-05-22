const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const DEMO_EMAIL = 'demo@timia.nz';
const DEMO_SLUG = 'demo-salon';

// POST /api/demo/start — Create or get demo salon, return token
router.post('/start', async (req, res) => {
  try {
    // Check if demo salon exists
    let salon = await db.query('SELECT * FROM salons WHERE slug = $1', [DEMO_SLUG]);
    let user = await db.query('SELECT * FROM users WHERE email = $1', [DEMO_EMAIL]);

    if (salon.rows.length === 0) {
      // Create demo salon
      const newSalon = await db.query(
        `INSERT INTO salons (name, slug, phone, email, address, timezone, plan, trial_plan, trial_ends_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        ['Timia Demo Salon', DEMO_SLUG, '021-000-0000', DEMO_EMAIL, '123 Queen Street, Auckland', 'Pacific/Auckland', 'free', 'growth', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()]
      );
      salon = newSalon;

      // Create demo user
      const hash = await bcrypt.hash('demo123', 10);
      const newUser = await db.query(
        'INSERT INTO users (salon_id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, salon_id',
        [salon.rows[0].id, DEMO_EMAIL, hash, 'Demo Owner', 'owner']
      );
      user = newUser;

      // Add demo services
      const services = await db.query(`
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
        RETURNING id, name
      `, [salon.rows[0].id]);

      // Add demo staff
      const staff = await db.query(`
        INSERT INTO staff (salon_id, name, email, phone, color, is_active) VALUES
          ($1, 'Mai Nguyen', 'mai@demo.com', '021-111-1111', '#ec4899', true),
          ($1, 'Linh Tran', 'linh@demo.com', '021-222-2222', '#8b5cf6', true),
          ($1, 'Han Le', 'han@demo.com', '021-333-3333', '#f59e0b', true),
          ($1, 'Thu Pham', 'thu@demo.com', '021-444-4444', '#10b981', true)
        RETURNING id, name
      `, [salon.rows[0].id]);

      // Link staff to services
      const svc = services.rows;
      const stf = staff.rows;
      for (const s of stf) {
        for (const sv of svc) {
          // Each staff does 3-5 random services
          if (Math.random() > 0.5) {
            await db.query(
              'INSERT INTO staff_services (staff_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [s.id, sv.id]
            );
          }
        }
      }

      // Add demo working hours (Mon-Sat 9am-6pm)
      for (let day = 1; day <= 6; day++) {
        for (const s of stf) {
          await db.query(
            'INSERT INTO working_hours (salon_id, staff_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
            [salon.rows[0].id, s.id, day, '09:00', '18:00']
          );
        }
      }

      // Add demo customers
      const customers = await db.query(`
        INSERT INTO customers (salon_id, name, phone, email) VALUES
          ($1, 'Sarah Kim', '021-555-0001', 'sarah@email.com'),
          ($1, 'Emily Chen', '021-555-0002', 'emily@email.com'),
          ($1, 'Jessica Park', '021-555-0003', 'jess@email.com'),
          ($1, 'Anna Lee', '021-555-0004', 'anna@email.com'),
          ($1, 'Mika Patel', '021-555-0005', 'mika@email.com')
        RETURNING id, name
      `, [salon.rows[0].id]);

      // Add some demo appointments (today + next few days)
      const now = new Date();
      const cst = customers.rows;
      for (let dayOffset = -2; dayOffset <= 5; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);
        if (date.getDay() === 0) continue; // Skip Sunday

        const numAppts = dayOffset < 0 ? 3 : Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numAppts; i++) {
          const hour = 9 + Math.floor(Math.random() * 8);
          const min = Math.random() > 0.5 ? 0 : 30;
          const startTime = new Date(date);
          startTime.setHours(hour, min, 0, 0);
          const dur = 30 + Math.floor(Math.random() * 4) * 15;
          const endTime = new Date(startTime.getTime() + dur * 60000);

          const randomSvc = svc[Math.floor(Math.random() * svc.length)];
          const randomStaff = stf[Math.floor(Math.random() * stf.length)];
          const randomCust = cst[Math.floor(Math.random() * cst.length)];
          const status = dayOffset < 0 ? 'completed' : 'confirmed';

          await db.query(
            `INSERT INTO appointments (salon_id, customer_id, staff_id, service_id, service_name, start_time, end_time, price, status, booking_code)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [salon.rows[0].id, randomCust.id, randomStaff.id, randomSvc.id, randomSvc.name, startTime.toISOString(), endTime.toISOString(), randomSvc.price, status, generateCode()]
          );
        }
      }

      // Add demo reviews
      await db.query(`
        INSERT INTO reviews (salon_id, customer_name, rating, comment, created_at) VALUES
          ($1, 'Sarah K.', 5, 'Absolutely love this salon! Mai did an amazing job on my hair. Will definitely be back.', NOW() - INTERVAL '5 days'),
          ($1, 'Emily C.', 5, 'Best nail salon in Auckland. The gel nails lasted 3 weeks!', NOW() - INTERVAL '3 days'),
          ($1, 'Jessica P.', 4, 'Great service and very friendly staff. The facial was so relaxing.', NOW() - INTERVAL '1 day')
      `, [salon.rows[0].id]);

      console.log('[DEMO] Demo salon created with sample data');
    }

    // Generate token
    const u = user.rows[0];
    const token = jwt.sign(
      { id: u.id, salon_id: u.salon_id || salon.rows[0].id, email: u.email, role: u.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const salonData = salon.rows[0];

    res.json({
      token,
      salon: { id: salonData.id, name: salonData.name, slug: salonData.slug, plan: salonData.plan },
      user: { id: u.id, email: u.email, name: u.name, role: u.role },
      message: 'Demo session started! Explore the dashboard freely.',
    });
  } catch (err) {
    console.error('[DEMO ERROR]', err.message);
    res.status(500).json({ error: 'Failed to start demo' });
  }
});

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

module.exports = router;
