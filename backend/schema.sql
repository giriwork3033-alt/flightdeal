-- FlightDeal MVP Database Schema

CREATE TABLE IF NOT EXISTS flight_results (
  id                SERIAL PRIMARY KEY,
  flight_fingerprint TEXT NOT NULL,
  carrier           TEXT NOT NULL,
  flight_number     TEXT NOT NULL,
  origin            TEXT NOT NULL,
  destination       TEXT NOT NULL,
  departure_date    DATE NOT NULL,
  departure_time    TIME NOT NULL,
  arrival_time      TIME,
  duration_mins     INTEGER,
  platform          TEXT NOT NULL,
  base_price        INTEGER NOT NULL,
  currency          TEXT DEFAULT 'INR',
  seats_left        INTEGER,
  fetched_at        TIMESTAMP DEFAULT NOW(),
  UNIQUE(flight_fingerprint, platform, fetched_at)
);

CREATE TABLE IF NOT EXISTS offers (
  id                  SERIAL PRIMARY KEY,
  platform            TEXT NOT NULL,
  offer_type          TEXT NOT NULL CHECK (offer_type IN ('card','coupon','voucher')),
  card_name           TEXT,
  card_network        TEXT,
  coupon_code         TEXT,
  discount_type       TEXT NOT NULL CHECK (discount_type IN ('flat','percent')),
  discount_value      INTEGER NOT NULL,
  max_cap             INTEGER,
  min_booking_value   INTEGER DEFAULT 0,
  stackable           BOOLEAN DEFAULT FALSE,
  valid_from          DATE,
  valid_until         DATE,
  verified            BOOLEAN DEFAULT FALSE,
  verified_at         TIMESTAMP,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_results (
  id                  SERIAL PRIMARY KEY,
  flight_fingerprint  TEXT NOT NULL,
  platform            TEXT NOT NULL,
  base_price          INTEGER NOT NULL,
  coupon_code         TEXT,
  coupon_saving       INTEGER DEFAULT 0,
  card_name           TEXT,
  card_saving         INTEGER DEFAULT 0,
  net_price           INTEGER NOT NULL,
  total_saving        INTEGER NOT NULL,
  best_combination    JSONB,
  computed_at         TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS searches (
  id            SERIAL PRIMARY KEY,
  origin        TEXT NOT NULL,
  destination   TEXT NOT NULL,
  travel_date   DATE NOT NULL,
  user_cards    JSONB,
  ip_hash       TEXT,
  searched_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flight_fingerprint ON flight_results(flight_fingerprint);
CREATE INDEX IF NOT EXISTS idx_offers_platform ON offers(platform);
CREATE INDEX IF NOT EXISTS idx_deal_fingerprint ON deal_results(flight_fingerprint);
CREATE INDEX IF NOT EXISTS idx_searches_route ON searches(origin, destination, travel_date);
