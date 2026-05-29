/**
 * Cleartrip Scraper
 * Cleartrip is Flipkart-owned and has a relatively accessible API
 */

const axios = require('axios');
const { normalise } = require('../engine/normaliser');

async function scrapeCleartrip(origin, destination, date) {
  console.log(`[Cleartrip] Fetching ${origin}→${destination} on ${date}`);

  try {
    const response = await axios.get('https://www.cleartrip.com/flights/results', {
      params: {
        from: origin, to: destination,
        depart_date: date, adults: 1,
        childs: 0, infants: 0, class: 'Economy',
        source: 'search',
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.cleartrip.com/flights',
      },
      timeout: 15000,
    });

    const flights = response.data?.results?.flights ||
                    response.data?.flights || [];

    console.log(`[Cleartrip] Found ${flights.length} flights`);
    return normalise('Cleartrip', flights);

  } catch (err) {
    console.error(`[Cleartrip] Error: ${err.message}`);
    return [];
  }
}

module.exports = { scrapeCleartrip };
