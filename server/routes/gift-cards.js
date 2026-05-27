const router = require('express').Router();
const db = require('../db');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

// Generate unique gift card code
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST /api/gift-cards/purchase — Public: buy a gift card
router.post('/purchase', async (req, res) => {
  try {
    const { slug, amount, purchaser_name, purchaser_email, recipient_name, recipient_email, message } = req.body;
    if (!slug || !amount || amount < 5 || amount > 500) {
      return res.status(400).json({ error: 'Invalid amount (min $5, max $500)' });
    }
    if (!purchaser_name || !purchaser_email) {
      return res.status(400).json({ error: 'Purchaser name and email required' });
    }

    const salon = await db.query('SELECT id FROM salons WHERE slug = $1', [slug]);
    if (!salon.rows.length) return res.status(404).json({ error: 'Salon not found' });

    // Generate unique code
    let code;
    for (let i = 0; i < 10; i++) {
      code = generateCode();
      const exists = await db.query('SELECT id FROM gift_cards WHERE code = $1', [code]);
      if (!exists.rows.length) break;
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiry

    const { rows } = await db.query(
      `INSERT INTO gift_cards (salon_id, code, amount, balance, purchaser_name, purchaser_email, recipient_name, recipient_email, message, expires_at)
       VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [salon.rows[0].id, code, amount, purchaser_name, purchaser_email, recipient_name || '', recipient_email || '', message || '', expiresAt]
    );

    res.status(201).json({
      id: rows[0].id,
      code: rows[0].code,
      amount: rows[0].amount,
      recipient_name: rows[0].recipient_name,
      recipient_email: rows[0].recipient_email,
      message: rows[0].message,
      expires_at: rows[0].expires_at,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/gift-cards/lookup/:code — Public: check gift card balance
router.get('/lookup/:code', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT code, amount, balance, status, recipient_name, expires_at, created_at
       FROM gift_cards WHERE code = $1`,
      [req.params.code.toUpperCase()]
    );
    if (!rows.length) return res.status(404).json({ error: 'Gift card not found' });
    const gc = rows[0];
    if (gc.status === 'expired' || new Date(gc.expires_at) < new Date()) {
      return res.json({ ...gc, status: 'expired' });
    }
    res.json(gc);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gift-cards/redeem — Public: apply gift card to appointment
router.post('/redeem', async (req, res) => {
  try {
    const { code, salon_slug, appointment_id } = req.body;
    if (!code) return res.status(400).json({ error: 'Gift card code required' });

    const gc = await db.query(
      `SELECT gc.* FROM gift_cards gc
       JOIN salons s ON gc.salon_id = s.id
       WHERE gc.code = $1 AND s.slug = $2`,
      [code.toUpperCase(), salon_slug]
    );
    if (!gc.rows.length) return res.status(404).json({ error: 'Gift card not found for this salon' });

    const card = gc.rows[0];
    if (card.status !== 'active') return res.status(400).json({ error: `Gift card is ${card.status}` });
    if (new Date(card.expires_at) < new Date()) return res.status(400).json({ error: 'Gift card has expired' });
    if (parseFloat(card.balance) <= 0) return res.status(400).json({ error: 'Gift card has no balance' });

    // Get appointment total if appointment_id provided
    let redeemAmount = parseFloat(card.balance);
    if (appointment_id) {
      const appt = await db.query(
        `SELECT COALESCE(SUM(s.price), 0) as total
         FROM appointments a
         JOIN services s ON a.service_id = s.id
         WHERE a.id = $1 AND a.salon_id = $2`,
        [appointment_id, card.salon_id]
      );
      if (appt.rows.length) {
        redeemAmount = Math.min(parseFloat(card.balance), parseFloat(appt.rows[0].total));
      }
    }

    // Deduct from balance
    const newBalance = parseFloat(card.balance) - redeemAmount;
    const newStatus = newBalance <= 0 ? 'redeemed' : 'active';

    await db.query(
      'UPDATE gift_cards SET balance = $1, status = $2, redeemed_at = CASE WHEN $2 = $3 THEN NOW() ELSE redeemed_at END WHERE id = $4',
      [newBalance, newStatus, 'redeemed', card.id]
    );

    // Log redemption
    await db.query(
      'INSERT INTO gift_card_redemptions (gift_card_id, appointment_id, amount_used) VALUES ($1, $2, $3)',
      [card.id, appointment_id || null, redeemAmount]
    );

    res.json({
      code: card.code,
      amount_used: redeemAmount,
      remaining_balance: newBalance,
      status: newStatus,
    });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/gift-cards — Auth: list gift cards for salon
router.get('/', authMiddleware, async (req, res) => {
  try {
    const salonId = isSuperAdmin(req.user.email) ? (req.query.salon_id || req.user.salon_id) : req.user.salon_id;
    const { rows } = await db.query(
      `SELECT gc.*, 
        (SELECT COUNT(*) FROM gift_card_redemptions gcr WHERE gcr.gift_card_id = gc.id) as redemption_count
       FROM gift_cards gc WHERE gc.salon_id = $1 ORDER BY gc.created_at DESC`,
      [salonId]
    );
    res.json(rows);
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/gift-cards/:id — Auth: cancel a gift card
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('UPDATE gift_cards SET status = $1 WHERE id = $2 RETURNING *', ['cancelled', req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Gift card not found' });
    res.json({ message: 'Gift card cancelled', gift_card: rows[0] });
  } catch (err) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
