-- ===================================================================
-- SMILE DENTAL CLINIC — CLOUDFLARE D1 DATABASE SCHEMA
-- Execute via: wrangler d1 execute sdc-db --file=worker/schema.sql
-- ===================================================================

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref_code TEXT NOT NULL UNIQUE,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  treatment TEXT NOT NULL,
  doctor TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(doctor, date, time_slot)
);

CREATE TABLE IF NOT EXISTS blocked_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(doctor, date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_bookings_date_doctor ON bookings(date, doctor);
CREATE INDEX IF NOT EXISTS idx_bookings_ref_code ON bookings(ref_code);
CREATE INDEX IF NOT EXISTS idx_blocked_date_doctor ON blocked_slots(date, doctor);
