/**
 * Price Normaliser
 * Each platform returns data in a different format.
 * This module normalises everything into a standard shape.
 */

/**
 * Generate a canonical flight fingerprint.
 * This is how we know "IndiGo 6E-204 DEL→BOM 25Jun 06:15"
 * is the same flight on MMT, Ixigo, and IndiGo.com.
 */
function buildFingerprint({ carrier, flightNumber, origin, destination, departureDate, departureTime }) {
  const date = new Date(departureDate).toISOString().split('T')[0];
  const time = departureTime?.replace(':', '') || '0000';
  return `${carrier}_${flightNumber}_${origin}_${destination}_${date}_${time}`.toUpperCase();
}

/**
 * Normalise a raw MMT flight result.
 */
function normaliseMmt(raw) {
  return {
    carrier: raw.airlineCode || raw.carrier,
    flight_number: raw.flightNumber,
    origin: raw.origin || raw.src,
    destination: raw.destination || raw.dst,
    departure_date: raw.departureDate,
    departure_time: raw.departureTime,
    arrival_time: raw.arrivalTime,
    duration_mins: raw.durationMinutes || parseDuration(raw.duration),
    platform: 'MMT',
    base_price: parseInt(raw.fare || raw.price || raw.totalFare, 10),
    seats_left: raw.seatsLeft || null,
    raw
  };
}

/**
 * Normalise a raw Ixigo flight result.
 */
function normaliseIxigo(raw) {
  return {
    carrier: raw.airlineCode,
    flight_number: raw.fltNo || raw.flightNumber,
    origin: raw.origin,
    destination: raw.destination,
    departure_date: raw.deptDate || raw.departureDate,
    departure_time: raw.deptTime || raw.departureTime,
    arrival_time: raw.arrvTime || raw.arrivalTime,
    duration_mins: raw.duration ? parseDuration(raw.duration) : null,
    platform: 'Ixigo',
    base_price: parseInt(raw.totalFare || raw.fare, 10),
    seats_left: raw.seatsAvailable || null,
    raw
  };
}

/**
 * Normalise a raw Cleartrip result.
 */
function normaliseCleartrip(raw) {
  return {
    carrier: raw.carrier_code || raw.airline,
    flight_number: raw.flight_number,
    origin: raw.origin,
    destination: raw.destination,
    departure_date: raw.depart_date,
    departure_time: raw.depart_time,
    arrival_time: raw.arrive_time,
    duration_mins: raw.duration_minutes || null,
    platform: 'Cleartrip',
    base_price: parseInt(raw.total_amount || raw.price, 10),
    seats_left: raw.available_seats || null,
    raw
  };
}

/**
 * Normalise a raw Goibibo result.
 */
function normaliseGoibibo(raw) {
  return {
    carrier: raw.airline_code || raw.al,
    flight_number: raw.fn || raw.flight_number,
    origin: raw.src || raw.origin,
    destination: raw.dst || raw.destination,
    departure_date: raw.dt?.split('T')[0] || raw.departure_date,
    departure_time: raw.dt?.split('T')[1]?.slice(0, 5) || raw.departure_time,
    arrival_time: raw.at?.split('T')[1]?.slice(0, 5) || raw.arrival_time,
    duration_mins: raw.duration || null,
    platform: 'Goibibo',
    base_price: parseInt(raw.fare?.tf || raw.totalFare || raw.price, 10),
    seats_left: raw.sc || null,
    raw
  };
}

/**
 * Normalise a raw EaseMyTrip result.
 */
function normaliseEaseMyTrip(raw) {
  return {
    carrier: raw.AirlineCode || raw.airlineCode,
    flight_number: raw.FlightNumber || raw.flightNumber,
    origin: raw.Origin || raw.origin,
    destination: raw.Destination || raw.destination,
    departure_date: raw.DepartureDate || raw.departureDate,
    departure_time: raw.DepartureTime || raw.departureTime,
    arrival_time: raw.ArrivalTime || raw.arrivalTime,
    duration_mins: raw.Duration ? parseDuration(raw.Duration) : null,
    platform: 'EaseMyTrip',
    base_price: parseInt(raw.TotalFare || raw.totalFare || raw.Price, 10),
    seats_left: raw.SeatsLeft || null,
    raw
  };
}

/**
 * Add fingerprint to a normalised result.
 */
function addFingerprint(normalised) {
  return {
    ...normalised,
    flight_fingerprint: buildFingerprint(normalised)
  };
}

/**
 * Parse a duration string like "2h 15m" or "135" into minutes.
 */
function parseDuration(str) {
  if (!str) return null;
  if (typeof str === 'number') return str;

  const hMatch = str.match(/(\d+)\s*h/);
  const mMatch = str.match(/(\d+)\s*m/);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const mins = mMatch ? parseInt(mMatch[1], 10) : 0;

  if (hours === 0 && mins === 0) return parseInt(str, 10) || null;
  return hours * 60 + mins;
}

/**
 * Validate a normalised result — filter out junk data.
 */
function isValid(result) {
  return (
    result.carrier &&
    result.flight_number &&
    result.origin &&
    result.destination &&
    result.departure_date &&
    result.base_price > 0 &&
    !isNaN(result.base_price)
  );
}

const normalisers = {
  MMT: normaliseMmt,
  Ixigo: normaliseIxigo,
  Cleartrip: normaliseCleartrip,
  Goibibo: normaliseGoibibo,
  EaseMyTrip: normaliseEaseMyTrip
};

function normalise(platform, rawResults) {
  const fn = normalisers[platform];
  if (!fn) throw new Error(`No normaliser for platform: ${platform}`);

  return rawResults
    .map(fn)
    .map(addFingerprint)
    .filter(isValid);
}

module.exports = { normalise, buildFingerprint, parseDuration };
