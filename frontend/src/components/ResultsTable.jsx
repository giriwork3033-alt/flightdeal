import React, { useMemo, useState } from 'react';
import DealCard from './DealCard';
import FlightGroup from './FlightGroup';

const fmt = n => n != null && !isNaN(n) ? '₹' + Math.round(n).toLocaleString('en-IN') : '—';
const fmtTime = t => t ? t.slice(0, 5) : '—';
const fmtDur = m => m ? `${Math.floor(m / 60)}h ${m % 60}m` : '';

const AIRLINES = {
  '6E': { name: 'IndiGo',    color: '#4f46e5', bg: '#eef2ff', short: 'IN' },
  'SG': { name: 'SpiceJet',  color: '#dc2626', bg: '#fef2f2', short: 'SJ' },
  'AI': { name: 'Air India', color: '#b91c1c', bg: '#fff1f2', short: 'AI' },
  'UK': { name: 'Vistara',   color: '#7c3aed', bg: '#f5f3ff', short: 'VS' },
  'G8': { name: 'Go First',  color: '#0369a1', bg: '#f0f9ff', short: 'GF' },
  'QP': { name: 'Akasa Air', color: '#d97706', bg: '#fffbeb', short: 'AK' },
};
const getAirline = c => AIRLINES[c] || { name: c, color: '#6b7280', bg: '#f9fafb', short: c?.slice(0,2).toUpperCase() };

export default function ResultsTable({ results, loading, error, hasSearched, stats }) {

  const [showAll, setShowAll] = useState(false);

  // Group by fingerprint
  const grouped = useMemo(() => {
    if (!results?.length) return [];
    const map = {};
    for (const r of results) {
      const fp = r.flight_fingerprint;
      if (!map[fp]) {
        map[fp] = {
          flight_fingerprint: fp, carrier: r.carrier,
          flight_number: r.flight_number, origin: r.origin,
          destination: r.destination, departure_time: r.departure_time,
          arrival_time: r.arrival_time, duration_mins: r.duration_mins,
          platforms: [],
        };
      }
      map[fp].platforms.push({
        platform: r.platform, base_price: r.base_price,
        net_price: r.net_price, total_saving: r.total_saving,
        coupon_code: r.coupon_code, coupon_saving: r.coupon_saving,
        card_name: r.card_name, card_saving: r.card_saving,
        best_combination: r.best_combination, seats_left: r.seats_left,
        ultimate_net_price: r.ultimate_net_price,
        ultimate_card_name: r.ultimate_card_name,
        ultimate_coupon_code: r.ultimate_coupon_code,
        ultimate_card_saving: r.ultimate_card_saving,
        ultimate_coupon_saving: r.ultimate_coupon_saving,
        has_ultimate_upgrade: r.has_ultimate_upgrade,
        upgrade_saving: r.upgrade_saving,
        ultimate_combination: r.ultimate_combination,
      });
    }
    return Object.values(map).sort((a, b) =>
      Math.min(...a.platforms.map(p => p.net_price)) -
      Math.min(...b.platforms.map(p => p.net_price))
    );
  }, [results]);

  const overallBest = useMemo(() =>
    results?.length ? results.reduce((b, r) => !b || r.net_price < b.net_price ? r : b, null) : null
  , [results]);

  const overallUltimate = useMemo(() => {
    if (!results?.length) return null;
    const valid = results.filter(r => r.ultimate_net_price > 0 && !isNaN(r.ultimate_net_price));
    return valid.length ? valid.reduce((b, r) => !b || r.ultimate_net_price < b.ultimate_net_price ? r : b, null) : null;
  }, [results]);

  const ultimateIsBetter = overallUltimate && overallBest &&
    overallUltimate.ultimate_net_price < overallBest.net_price;

  const showUpgradePrompt = overallUltimate?.ultimate_card_name &&
    (ultimateIsBetter || !overallBest?.card_name);

  // Flatten all platform results sorted by net_price for the alternatives list
  const allResults = useMemo(() => {
    if (!results?.length) return [];
    return [...results].sort((a, b) => a.net_price - b.net_price);
  }, [results]);

  // — Loading —
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <div style={spinner}/>
      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)', margin: '16px 0 4px' }}>
        Searching all platforms simultaneously...
      </p>
      <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
        Applying your card offers and coupons
      </p>
    </div>
  );

  if (error) return (
    <div style={{ background: 'var(--color-background-danger)', border: '0.5px solid var(--color-border-danger)', borderRadius: 10, padding: 16 }}>
      <p style={{ color: 'var(--color-text-danger)', fontSize: 14, margin: 0 }}>{error}</p>
    </div>
  );

  if (!hasSearched) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, margin: 0 }}>
        Enter your route, date and cards above to see the real cheapest price
      </p>
    </div>
  );

  if (!grouped.length) return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, margin: 0 }}>No flights found for this route and date</p>
    </div>
  );

  const best = overallBest;
  const bestAirline = getAirline(best.carrier);
  const hasCards = best.card_name || best.coupon_code;

  return (
    <div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ZONE 1 — THE ANSWER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        background: '#f0fdf4',
        border: '2px solid #1d9e75',
        borderRadius: 14,
        padding: '20px 22px',
        marginBottom: 16,
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>

          {/* Left: price + details */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Best deal
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 38, fontWeight: 500, color: '#14532d', lineHeight: 1 }}>
                {fmt(best.net_price)}
              </span>
              {best.total_saving > 0 && (
                <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through' }}>
                  {fmt(best.base_price)}
                </span>
              )}
            </div>

            {/* Saving */}
            {best.total_saving > 0 && (
              <div style={{ fontSize: 13, color: '#16a34a', marginBottom: 12, fontWeight: 500 }}>
                You save {fmt(best.total_saving)}
                {best.coupon_code && ` · coupon ${best.coupon_code}`}
                {best.card_name && ` · ${best.card_name}`}
              </div>
            )}

            {!hasCards && (
              <div style={{ fontSize: 13, color: '#15803d', marginBottom: 12 }}>
                Select your cards above to unlock further savings
              </div>
            )}

            {/* Flight chip */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#fff', borderRadius: 10, padding: '10px 14px',
              border: '0.5px solid #bbf7d0',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                background: bestAirline.bg,
                border: `1.5px solid ${bestAirline.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: bestAirline.color }}>
                  {bestAirline.short}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#14532d' }}>
                  {bestAirline.name} {best.flight_number} · {fmtTime(best.departure_time)} → {fmtTime(best.arrival_time)}
                  {best.duration_mins ? ` · ${fmtDur(best.duration_mins)}` : ''}
                </div>
                <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
                  Book on <strong>{best.platform}</strong>
                  {best.coupon_code && <> · Apply <strong>{best.coupon_code}</strong> at checkout</>}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Book button + seats */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <a
              href={({'MMT':'https://www.makemytrip.com/flights','Ixigo':'https://www.ixigo.com/flights','Cleartrip':'https://www.cleartrip.com/flights','Goibibo':'https://www.goibibo.com/flights','EaseMyTrip':'https://www.easemytrip.com','Yatra':'https://www.yatra.com/flights','Paytm':'https://travel.paytm.com/flights'})[best.platform] || '#'}
              target="_blank" rel="noopener noreferrer"
              style={{
                background: '#15803d', color: '#fff',
                padding: '13px 28px', borderRadius: 10,
                fontSize: 16, fontWeight: 500,
                textDecoration: 'none', whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              Book now →
            </a>
            {best.seats_left > 0 && best.seats_left <= 5 && (
              <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
                Only {best.seats_left} seats left
              </span>
            )}
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {allResults.length} results checked
            </span>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ZONE 3 — UPGRADE PROMPT (shown early, before alternatives)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showUpgradePrompt && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
          padding: '12px 16px',
          background: '#faf5ff',
          border: '0.5px solid #d8b4fe',
          borderRadius: 10,
          marginBottom: 16,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#5b21b6', marginBottom: 2 }}>
              Unlock {fmt(overallUltimate.ultimate_net_price)} with {overallUltimate.ultimate_card_name}
            </div>
            <div style={{ fontSize: 12, color: '#7c3aed' }}>
              {ultimateIsBetter
                ? `Save ${fmt(best.net_price - overallUltimate.ultimate_net_price)} more than your current best · ${overallUltimate.platform}`
                : `Get this card to unlock the lowest price on ${overallUltimate.platform}`}
            </div>
          </div>
          <button style={{
            background: '#7c3aed', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '8px 18px', fontSize: 13, fontWeight: 500,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            Get this card
          </button>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          ZONE 2 — OTHER OPTIONS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div style={{
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--color-background-primary)',
        marginBottom: 16,
      }}>
        {/* Section header */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--color-background-secondary)',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            Other options
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {allResults.length - 1} alternatives · sorted by price
          </span>
        </div>

        {/* Alt rows — show top 4 by default, rest on "show all" */}
        {allResults.slice(1, showAll ? allResults.length : 5).map((r, i) => {
          const al = getAirline(r.carrier);
          const diff = r.net_price - best.net_price;
          return (
            <div key={`${r.flight_fingerprint}-${r.platform}`} style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 16px',
              borderTop: i > 0 ? '0.5px solid var(--color-border-tertiary)' : 'none',
              gap: 12, flexWrap: 'wrap',
              cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-background-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Airline + flight */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  background: al.bg, border: `1px solid ${al.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: al.color }}>{al.short}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {al.name} · {r.platform}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>
                    {fmtTime(r.departure_time)} → {fmtTime(r.arrival_time)}
                    {r.duration_mins ? ` · ${fmtDur(r.duration_mins)}` : ''}
                  </div>
                </div>
              </div>

              {/* Offers */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                {r.coupon_code && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#fef9c3', color: '#713f12' }}>
                    {r.coupon_code}
                  </span>
                )}
                {r.card_name && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#eff6ff', color: '#1d4ed8' }}>
                    {r.card_name}
                  </span>
                )}
                {!r.coupon_code && !r.card_name && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f3f4f6', color: '#9ca3af' }}>
                    No offer
                  </span>
                )}
              </div>

              {/* Price */}
              <div style={{ textAlign: 'right', minWidth: 100 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {fmt(r.net_price)}
                </div>
                <div style={{ fontSize: 11, color: '#dc2626', marginTop: 1 }}>
                  +{fmt(diff)} vs best
                </div>
              </div>

              {/* Book */}
              <a
                href={({'MMT':'https://www.makemytrip.com/flights','Ixigo':'https://www.ixigo.com/flights','Cleartrip':'https://www.cleartrip.com/flights','Goibibo':'https://www.goibibo.com/flights','EaseMyTrip':'https://www.easemytrip.com','Yatra':'https://www.yatra.com/flights','Paytm':'https://travel.paytm.com/flights'})[r.platform] || '#'}
                target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  background: 'var(--color-background-secondary)',
                  border: '0.5px solid var(--color-border-secondary)',
                  color: 'var(--color-text-primary)',
                  padding: '6px 14px', borderRadius: 7,
                  fontSize: 12, fontWeight: 500,
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                Book →
              </a>
            </div>
          );
        })}

        {/* Show all toggle */}
        {allResults.length > 5 && (
          <div
            onClick={() => setShowAll(s => !s)}
            style={{
              textAlign: 'center', padding: '11px',
              borderTop: '0.5px solid var(--color-border-tertiary)',
              fontSize: 13, color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              background: 'var(--color-background-secondary)',
            }}
          >
            {showAll ? 'Show less ▲' : `Show all ${allResults.length - 1} results ▼`}
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 16 }}>
        Prices verified at time of search · Card offers subject to bank T&C · Confirm at checkout
      </p>
    </div>
  );
}

const spinner = {
  width: 36, height: 36,
  border: '3px solid var(--color-border-secondary)',
  borderTop: '3px solid #3b82f6',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  margin: '0 auto',
};
