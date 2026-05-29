/**
 * Discount Engine
 * Computes both:
 * 1. Best price with USER'S cards
 * 2. Ultimate lowest price with ANY available card offer
 */

function calcDiscount(basePrice, offer) {
  if (basePrice < (offer.min_booking_value || 0)) return 0;
  if (offer.discount_type === 'flat') {
    return Math.min(offer.discount_value, basePrice);
  }
  if (offer.discount_type === 'percent') {
    const raw = Math.round(basePrice * offer.discount_value / 100);
    return offer.max_cap ? Math.min(raw, offer.max_cap) : raw;
  }
  return 0;
}

function isOfferValid(offer) {
  if (!offer.valid_until) return true;
  return new Date(offer.valid_until) >= new Date();
}

function filterByPlatform(offers, platform) {
  return offers.filter(o => o.platform === platform && isOfferValid(o));
}

function findBestCombination(basePrice, platformOffers, allowedCards) {
  const coupons = platformOffers.filter(o =>
    o.offer_type === 'coupon' || o.offer_type === 'voucher'
  );
  const cardOffers = platformOffers.filter(o =>
    o.offer_type === 'card' &&
    (!allowedCards || allowedCards.includes(o.card_name))
  );

  const combinations = [{ coupon: null, card: null, saving: 0 }];

  for (const c of coupons) {
    const saving = calcDiscount(basePrice, c);
    if (saving > 0) combinations.push({ coupon: c.coupon_code, card: null, saving, coupon_offer: c });
  }

  for (const card of cardOffers) {
    const saving = calcDiscount(basePrice, card);
    if (saving > 0) combinations.push({ coupon: null, card: card.card_name, saving, card_offer: card });
  }

  for (const c of coupons) {
    for (const card of cardOffers) {
      if (c.stackable && card.stackable) {
        const couponSaving = calcDiscount(basePrice, c);
        const cardSaving = calcDiscount(basePrice - couponSaving, card);
        const totalSaving = couponSaving + cardSaving;
        if (totalSaving > 0) {
          combinations.push({
            coupon: c.coupon_code, card: card.card_name,
            saving: totalSaving, stacked: true,
            coupon_offer: c, card_offer: card
          });
        }
      }
    }
  }

  return combinations.sort((a, b) => b.saving - a.saving)[0];
}

function computeNetPrice(flightResult, offers, userCards) {
  const { platform, base_price } = flightResult;
  const platformOffers = filterByPlatform(offers, platform);

  // 1. Best with user's cards
  const userBest = findBestCombination(base_price, platformOffers, userCards);
  const couponSaving = userBest.coupon_offer ? calcDiscount(base_price, userBest.coupon_offer) : 0;
  const cardSaving = userBest.card_offer ? calcDiscount(base_price - couponSaving, userBest.card_offer) : 0;

  // 2. Ultimate best with ANY card
  const ultimateBest = findBestCombination(base_price, platformOffers, null);
  const ultCouponSaving = ultimateBest.coupon_offer ? calcDiscount(base_price, ultimateBest.coupon_offer) : 0;
  const ultCardSaving = ultimateBest.card_offer ? calcDiscount(base_price - ultCouponSaving, ultimateBest.card_offer) : 0;

  const userNetPrice = base_price - userBest.saving;
  const ultimateNetPrice = base_price - ultimateBest.saving;
  const hasUltimateUpgrade = ultimateNetPrice < userNetPrice;

  return {
    ...flightResult,
    // User's best
    coupon_code: userBest.coupon || null,
    coupon_saving: couponSaving,
    card_name: userBest.card || null,
    card_saving: cardSaving,
    net_price: userNetPrice,
    total_saving: userBest.saving,
    best_combination: userBest,
    // Ultimate best
    ultimate_net_price: ultimateNetPrice,
    ultimate_total_saving: ultimateBest.saving,
    ultimate_card_name: ultimateBest.card || null,
    ultimate_coupon_code: ultimateBest.coupon || null,
    ultimate_card_saving: ultCardSaving,
    ultimate_coupon_saving: ultCouponSaving,
    ultimate_combination: ultimateBest,
    has_ultimate_upgrade: hasUltimateUpgrade,
    upgrade_saving: hasUltimateUpgrade ? userNetPrice - ultimateNetPrice : 0,
  };
}

function rankResults(results) {
  return results
    .filter(r => r.net_price > 0)
    .sort((a, b) => a.net_price - b.net_price)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

module.exports = { computeNetPrice, rankResults, calcDiscount };
