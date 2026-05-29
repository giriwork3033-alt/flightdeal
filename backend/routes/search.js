require('dotenv').config();
const express = require('express');
const router = express.Router();
const { computeNetPrice, rankResults } = require('../engine/discountEngine');
const { query } = require('../db');
const offers = require('../data/offers.json');

const USE_MOCK = true; // set to false when real scrapers are ready

// ── Mock flight data ────────────────────────────────────────────────
function getMockFlights(origin, destination, date) {
  const base = [
    { carrier: '6E', flight_number: '6E-204', departure_time: '06:15', arrival_time: '08:30', duration_mins: 135, platforms: [
      { platform: 'MMT',         base_price: 5800 },
      { platform: 'Ixigo',       base_price: 5650 },
      { platform: 'Goibibo',     base_price: 5750 },
      { platform: 'Cleartrip',   base_price: 5900 },
      { platform: 'EaseMyTrip',  base_price: 5700 },
    ]},
    { carrier: 'SG', flight_number: 'SG-112',  departure_time: '07:45', arrival_time: '10:05', duration_mins: 140, platforms: [
      { platform: 'MMT',         base_price: 4900 },
      { platform: 'Ixigo',       base_price: 4800 },
      { platform: 'Cleartrip',   base_price: 5100 },
      { platform: 'EaseMyTrip',  base_price: 4850 },
    ]},
    { carrier: 'AI', flight_number: 'AI-865',  departure_time: '09:30', arrival_time: '11:50', duration_mins: 140, platforms: [
      { platform: 'MMT',         base_price: 6200 },
      { platform: 'Goibibo',     base_price: 6100 },
      { platform: 'Cleartrip',   base_price: 6050 },
    ]},
    { carrier: '6E', flight_number: '6E-542',  departure_time: '14:20', arrival_time: '16:35', duration_mins: 135, platforms: [
      { platform: 'MMT',         base_price: 5200 },
      { platform: 'Ixigo',       base_price: 5100 },
      { platform: 'Goibibo',     base_price: 5300 },
      { platform: 'EaseMyTrip',  base_price: 5150 },
    ]},
    { carrier: 'UK', flight_number: 'UK-981',  departure_time: '17:00', arrival_time: '19:15', duration_mins: 135, platforms: [
      { platform: 'MMT',         base_price: 7100 },
      { platform: 'Cleartrip',   base_price: 6950 },
      { platform: 'Ixigo',       base_price: 7000 },
    ]},
  ];

  const flights = [];
  for (const f of base) {
    for (const p of f.platforms) {
      flights.push({
        flight_fingerprint: `${f.carrier}_${f.flight_number}_${origin}_${destination}_${date}_${f.departure_time.replace(':', '')}`.toUpperCase(),
        carrier: f.carrier,
        flight_number: f.flight_number,
        origin,
        destination,
        departure_date: date,
        departure_time: f.departure_time,
        arrival_time: f.arrival_time,
        duration_mins: f.duration_mins,
        platform: p.platform,
        base_price: p.base_price,
        seats_left: Math.floor(Math.random() * 12) + 1,
      });
    }
  }
  return flights;
}

// ── Validate ──────────────────────────────────────────────────────
function validate({ origin, destination, date }) {
  const errors = [];
  if (!origin || origin.length !== 3) errors.push('Invalid origin airport code');
  if (!destination || destination.length !== 3) errors.push('Invalid destination airport code');
  if (!date || isNaN(Date.parse(date))) errors.push('Invalid date');
  if (origin?.toUpperCase() === destination?.toUpperCase()) errors.push('Origin and destination cannot be the same');
  const travel = new Date(date);
  const today = new Date(); today.setHours(0,0,0,0);
  if (travel < today) errors.push('Travel date cannot be in the past');
  return errors;
}

// ── POST /api/search ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { origin, destination, date, cards = [] } = req.body;
  const errors = validate({ origin, destination, date });
  if (errors.length) return res.status(400).json({ success: false, errors });

  const O = origin.toUpperCase();
  const D = destination.toUpperCase();

  try {
    // Log search to DB
    query(
      'INSERT INTO searches (origin, destination, travel_date, user_cards) VALUES ($1,$2,$3,$4)',
      [O, D, date, JSON.stringify(cards)]
    ).catch(e => console.error('[DB] Search log failed:', e.message));

    let flights = [];
    let stats = {};

    if (USE_MOCK) {
      flights = getMockFlights(O, D, date);
      stats = { MMT: { count: 5 }, Ixigo: { count: 4 }, Goibibo: { count: 3 }, Cleartrip: { count: 4 }, EaseMyTrip: { count: 3 } };
    } else {
      const { fetchAllPlatforms } = require('../scrapers/orchestrator');
      const result = await fetchAllPlatforms(O, D, date);
      flights = result.flights;
      stats = result.stats;
    }

    if (!flights.length) {
      return res.json({ success: true, results: [], message: 'No flights found', stats });
    }

    const dealResults = flights.map(f => computeNetPrice(f, offers, cards));
    const ranked = rankResults(dealResults);

    return res.json({
      success: true,
      count: ranked.length,
      results: ranked,
      stats,
      mock: USE_MOCK,
      searched_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[Search] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Search failed. Please try again.',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

module.exports = router;
