/**
 * MMT Scraper — uses ScraperAPI directly via axios + cheerio
 * Much faster than routing Playwright through a proxy URL
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { normalise } = require('../engine/normaliser');

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const SCRAPER_API_URL = 'http://api.scraperapi.com';

function buildMmtUrl(origin, destination, date) {
  const [year, month, day] = date.split('-');
  return `https://www.makemytrip.com/flight/search?tripType=O&itinerary=${origin}-${destination}-${day}/${month}/${year}&paxType=A-1_C-0_I-0&cabinClass=E&forwardFlowRequired=true&mtype=O`;
}

async function fetchWithScraperApi(url) {
  const response = await axios.get(SCRAPER_API_URL, {
    params: {
      api_key: SCRAPER_API_KEY,
      url,
      render: true,
      country_code: 'in',
      wait_for_selector: '[data-testid="flight-card"]',
    },
    timeout: 60000,
    maxContentLength: 10 * 1024 * 1024,
  });
  return response.data;
}

async function fetchDirect(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-IN,en;q=0.9',
    },
    timeout: 20000,
  });
  return response.data;
}

function parseFlights(html, origin, destination, date) {
  const $ = cheerio.load(html);
  const flights = [];

  // Try multiple possible selectors MMT uses
  const cardSelectors = [
    '[data-testid="flight-card"]',
    '.listingCard',
    '.flight-listing',
    '.fli-list .listItem',
  ];

  let cards = $();
  for (const sel of cardSelectors) {
    cards = $(sel);
    if (cards.length > 0) break;
  }

  cards.each((i, el) => {
    const card = $(el);

    const priceText = card.find('[class*="price"], .actual-price, [class*="fare"]').first().text().replace(/[^0-9]/g, '');
    const price = parseInt(priceText, 10);
    if (!price || price < 500 || price > 200000) return;

    const airline = card.find('[class*="airline-name"], .airlineName').first().text().trim();
    const flightNo = card.find('[class*="flight-number"], .flt-no').first().text().trim().replace(/\s/g, '');
    const deptTime = card.find('[class*="dept-time"], .depTime').first().text().trim().slice(0, 5);
    const arrvTime = card.find('[class*="arrvl-time"], .arrTime').first().text().trim().slice(0, 5);
    const duration = card.find('[class*="duration"], .flightDuration').first().text().trim();

    flights.push({
      carrier: airline.slice(0, 6) || 'XX',
      flightNumber: flightNo || 'UNKNOWN',
      origin, destination,
      departureDate: date,
      departureTime: deptTime || '00:00',
      arrivalTime: arrvTime || null,
      duration: duration || null,
      totalFare: price,
    });
  });

  return flights;
}

async function scrapeMmt(origin, destination, date) {
  console.log(`[MMT] Fetching ${origin}→${destination} on ${date}`);
  const url = buildMmtUrl(origin, destination, date);

  try {
    let html;

    if (SCRAPER_API_KEY) {
      console.log('[MMT] Using ScraperAPI');
      html = await fetchWithScraperApi(url);
    } else {
      console.log('[MMT] No ScraperAPI key — trying direct fetch');
      html = await fetchDirect(url);
    }

    const raw = parseFlights(html, origin, destination, date);
    console.log(`[MMT] Parsed ${raw.length} flights from HTML`);

    if (raw.length === 0) {
      // MMT returns JSON in some cases — try to extract it
      const jsonMatch = html.match(/"flights"\s*:\s*(\[.*?\])/s);
      if (jsonMatch) {
        try {
          const jsonFlights = JSON.parse(jsonMatch[1]);
          console.log(`[MMT] Found ${jsonFlights.length} flights in JSON`);
          return normalise('MMT', jsonFlights);
        } catch {}
      }
    }

    return normalise('MMT', raw);

  } catch (err) {
    console.error(`[MMT] Error: ${err.message}`);
    return [];
  }
}

module.exports = { scrapeMmt };
