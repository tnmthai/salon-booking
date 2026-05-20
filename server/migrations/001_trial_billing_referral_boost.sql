-- Migration: Trial, Billing, Referral, Marketplace Boost
-- Date: 2026-05-20

-- 1. Trial & Billing columns on salons
ALTER TABLE salons ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS trial_plan VARCHAR(20); -- 'starter' or 'growth'
ALTER TABLE salons ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(10) DEFAULT 'monthly'; -- 'monthly' or 'annual'
ALTER TABLE salons ADD COLUMN IF NOT EXISTS plan_price DECIMAL(10,2) DEFAULT 0; -- locked price for early bird
ALTER TABLE salons ADD COLUMN IF NOT EXISTS is_early_bird BOOLEAN DEFAULT false;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS early_bird_count INTEGER DEFAULT 0; -- global counter

-- 2. Marketplace boost columns on salons
ALTER TABLE salons ADD COLUMN IF NOT EXISTS boost_until TIMESTAMP;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS is_new_badge BOOLEAN DEFAULT true;

-- 3. Referral system
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  referred_salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, rewarded
  reward_type VARCHAR(50), -- 'free_starter_month', 'free_growth_month'
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_salon_id);

-- 4. Track early bird slots globally
CREATE TABLE IF NOT EXISTS early_bird_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_slots INTEGER DEFAULT 50,
  slots_taken INTEGER DEFAULT 0,
  starter_price DECIMAL(10,2) DEFAULT 7.00,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO early_bird_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
