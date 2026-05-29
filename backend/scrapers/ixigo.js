/**
 * Ixigo Scraper — uses ScraperAPI + axios
 * Ixigo has an accessible JSON API endpoint
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { normalise } = require('../engine/normaliser');

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

async function fetchViaScraperApi(url, render = false) {
  return axios.get('http://api.scraperapi.com', {
    params: {
      api_key: SCRAPER_API_KEY,
      url,
      render,
      country_code: 'in',
    },
    timeout: 45000,
  });
}

async function scrapeIxigo(origin, destination, date) {
  console.log(`[Ixigo] Fetching ${origin}→${destination} on ${date}`);

  // Try JSON API first
  try {
    const apiUrl = `https://www.ixigo.com/api/v2/flight/search?from=${origin}&to=${destination}&date=${date}&adults=1&children=0&infants=0&class=e&source=search`;

    const response = SCRAPER_API_KEY
      ? await fetchViaScraperApi(apiUrl, false)
      : await axios.get(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://www.ixigo.com/flights',
          },
          timeout: 15000,
        });

    const data = response.data;
    const rawFlights = data?.results?.flights || data?.flights || data?.data?.flights || [];

    if (rawFlights.length) {
      console.log(`[Ixigo] API returned ${rawFlights.length} flights`);
      return normalise('Ixigo', rawFlights);
    }
  } catch (err) {
    console.warn(`[Ixigo] API attempt failed: ${err.message}`);
  }

  // Fallback: scrape the search page HTML
  try {
    const [y, m, d] = date.split('-');
    const pageUrl = `https://www.ixigo.com/search/result/flight/${origin}/${destination}/${y}${m}${d}/1/0/0/E/O`;

    const response = SCRAPER_API_KEY
      ? await fetchViaScraperApi(pageUrl, true)
      : await axios.get(pageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
          timeout: 20000,
        });

    const $ = cheerio.load(response.data);
    const flights = [];

    $('.result-listing, .flight-result-container, .search-result').each((i, el) => {
      const card = $(el);
      const price = parseInt(card.find('.price, .fare-price, [class*="price"]').first().text().replace(/[^0-9]/g, ''), 10);
      if (!price || price < 500) return;

      flights.push({
        airlineCode: card.find('.airline-name, .airlineName').first().text().trim().slice(0, 6) || 'XX',
        fltNo: card.find('.flight-no, .flt-no').first().text().trim() || 'UNKNOWN',
        origin, destination,
        deptDate: date,
        deptTime: card.find('.departure-time, .dept-time').first().text().trim().slice(0, 5) || '00:00',
        arrvTime: card.find('.arrival-time, .arrvl-time').first().text().trim().slice(0, 5) || null,
        totalFare: price,
      });
    });

    console.log(`[Ixigo] HTML scrape found ${flights.length} flights`);
    return normalise('Ixigo', flights);

  } catch (err) {
    console.error(`[Ixigo] Error: ${err.message}`);
    return [];
  }
}

module.exports = { scrapeIxigo };
