const express = require('express');
const router = express.Router();
const offers = require('../data/offers.json');

// GET /api/offers — all offers
router.get('/', (req, res) => {
  let filtered = offers;
  if (req.query.platform) {
    filtered = filtered.filter(o => o.platform === req.query.platform);
  }
  if (req.query.card) {
    filtered = filtered.filter(o => o.card_name === req.query.card);
  }
  if (req.query.type) {
    filtered = filtered.filter(o => o.offer_type === req.query.type);
  }
  res.json({ success: true, count: filtered.length, offers: filtered });
});

// GET /api/offers/cards — list of all unique card names with offers
router.get('/cards', (req, res) => {
  const cards = [...new Set(
    offers
      .filter(o => o.offer_type === 'card' && o.card_name)
      .map(o => o.card_name)
  )].sort();
  res.json({ success: true, cards });
});

// GET /api/offers/platforms — list of all platforms
router.get('/platforms', (req, res) => {
  const platforms = [...new Set(offers.map(o => o.platform))].sort();
  res.json({ success: true, platforms });
});

module.exports = router;
