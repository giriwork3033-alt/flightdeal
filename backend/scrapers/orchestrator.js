/**
 * Scraper Orchestrator
 * Runs all platform scrapers in parallel with timeout protection.
 * Falls back gracefully if any scraper fails.
 */

const { scrapeMmt } = require('./mmt');
const { scrapeIxigo } = require('./ixigo');
const { scrapeCleartrip } = require('./cleartrip');

const TIMEOUT_MS = 30000;

function withTimeout(promise, ms, platform) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => {
      console.warn(`[Orchestrator] ${platform} timed out after ${ms}ms`);
      resolve([]);
    }, ms))
  ]);
}

async function fetchAllPlatforms(origin, destination, date) {
  console.log(`[Orchestrator] Starting: ${origin}→${destination} on ${date}`);
  const start = Date.now();

  const scrapers = [
    { name: 'MMT',       fn: () => scrapeMmt(origin, destination, date) },
    { name: 'Ixigo',     fn: () => scrapeIxigo(origin, destination, date) },
    { name: 'Cleartrip', fn: () => scrapeCleartrip(origin, destination, date) },
  ];

  const settled = await Promise.allSettled(
    scrapers.map(s =>
      withTimeout(s.fn(), TIMEOUT_MS, s.name)
        .then(data => ({ platform: s.name, data: data || [], error: null }))
        .catch(err => ({ platform: s.name, data: [], error: err.message }))
    )
  );

  const allFlights = [];
  const stats = {};

  for (const result of settled) {
    const { platform, data, error } = result.value || {};
    stats[platform] = { count: data?.length || 0, error };
    if (data?.length) allFlights.push(...data);
  }

  console.log(`[Orchestrator] Done in ${Date.now() - start}ms`, stats);
  return { flights: allFlights, stats };
}

function groupByFingerprint(flights) {
  const groups = {};
  for (const f of flights) {
    const fp = f.flight_fingerprint;
    if (!groups[fp]) {
      groups[fp] = {
        fingerprint: fp, carrier: f.carrier,
        flight_number: f.flight_number, origin: f.origin,
        destination: f.destination, departure_date: f.departure_date,
        departure_time: f.departure_time, arrival_time: f.arrival_time,
        duration_mins: f.duration_mins, platforms: [],
      };
    }
    groups[fp].platforms.push({ platform: f.platform, base_price: f.base_price, seats_left: f.seats_left });
  }
  return Object.values(groups);
}

module.exports = { fetchAllPlatforms, groupByFingerprint };
