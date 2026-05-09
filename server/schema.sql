-- Salon Booking Multi-Tenant Schema

CREATE TABLE IF NOT EXISTS salons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  logo_url TEXT,
  description TEXT,
  opening_hour INTEGER DEFAULT 9,
  closing_hour INTEGER DEFAULT 18,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'owner',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_min INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_services (
  staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id),
  staff_id INTEGER REFERENCES staff(id),
  service_id INTEGER REFERENCES services(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_staff_salon ON staff(salon_id);
CREATE INDEX idx_customers_salon ON customers(salon_id);
CREATE INDEX idx_appointments_salon ON appointments(salon_id);
CREATE INDEX idx_appointments_start ON appointments(start_time);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_salons_slug ON salons(slug);

-- Priority 4: Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  customer_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reviews_salon ON reviews(salon_id);
CREATE INDEX IF NOT EXISTS idx_reviews_staff ON reviews(staff_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_appointment ON reviews(appointment_id);

-- Priority 5: Working hours overrides
CREATE TABLE IF NOT EXISTS working_hours_overrides (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wh_overrides_staff ON working_hours_overrides(staff_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wh_overrides_unique ON working_hours_overrides(staff_id, date);

-- Priority 6: Multiple services per booking
CREATE TABLE IF NOT EXISTS appointment_services (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  price DECIMAL(10,2),
  duration_min INTEGER
);
CREATE INDEX IF NOT EXISTS idx_appt_services_appt ON appointment_services(appointment_id);

-- Priority 7: Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  salon_id INTEGER REFERENCES salons(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gallery_salon ON gallery(salon_id);

-- Priority 8: Loyalty
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;

-- Priority 3: Reminder tracking
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Priority 1: Booking code index
CREATE INDEX IF NOT EXISTS idx_appointments_booking_code ON appointments(booking_code) WHERE booking_code IS NOT NULL;
