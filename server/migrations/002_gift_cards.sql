-- Gift Cards table
CREATE TABLE IF NOT EXISTS gift_cards (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  code VARCHAR(16) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance DECIMAL(10,2) NOT NULL,
  purchaser_name VARCHAR(100),
  purchaser_email VARCHAR(100),
  recipient_name VARCHAR(100),
  recipient_email VARCHAR(100),
  message TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, redeemed, expired, cancelled
  stripe_payment_id VARCHAR(255),
  redeemed_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_salon ON gift_cards(salon_id);

-- Gift card redemptions log
CREATE TABLE IF NOT EXISTS gift_card_redemptions (
  id SERIAL PRIMARY KEY,
  gift_card_id INTEGER REFERENCES gift_cards(id) ON DELETE CASCADE,
  appointment_id INTEGER REFERENCES appointments(id),
  amount_used DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
