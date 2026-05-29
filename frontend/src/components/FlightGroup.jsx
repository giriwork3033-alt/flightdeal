import React, { useState } from 'react';
import DealCard from './DealCard';

const AIRLINES = {
  '6E': { name: 'IndiGo',    color: '#4f46e5', bg: '#eef2ff', short: 'IN' },
  'SG': { name: 'SpiceJet',  color: '#dc2626', bg: '#fef2f2', short: 'SJ' },
  'AI': { name: 'Air India', color: '#b91c1c', bg: '#fff1f2', short: 'AI' },
  'UK': { name: 'Vistara',   color: '#7c3aed', bg: '#f5f3ff', short: 'VS' },
  'G8': { name: 'Go First',  color: '#0369a1', bg: '#f0f9ff', short: 'GF' },
  'QP': { name: 'Akasa Air', color: '#d97706', bg: '#fffbeb', short: 'AK' },
  'IX': { name: 'Air Asia',  color: '#dc2626', bg: '#fef2f2', short: 'AA' },
};

const CITY_NAMES = {
  DEL: 'Delhi', BOM: 'Mumbai', BLR: 'Bangalore', HYD: 'Hyderabad',
  MAA: 'Chennai', CCU: 'Kolkata', PNQ: 'Pune', AMD: 'Ahmedabad',
  GOI: 'Goa', COK: 'Kochi', JAI: 'Jaipur', LKO: 'Lucknow',
  PAT: 'Patna', BBI: 'Bhubaneswar', IXC: 'Chandigarh',
};

function getAirline(carrier) {
  return AIRLINES[carrier] || { name: carrier, color: '#6b7280', bg: '#f9fafb', short: carrier?.slice(0, 2).toUpperCase() };
}

function fmtTime(t) { return t ? t.slice(0, 5) : '—'; }
function fmtDur(m) { return m ? `${Math.floor(m / 60)}h ${m % 60}m` : ''; }
function fmt(n) { return n != null ? '₹' + Math.round(n).toLocaleString('en-IN') : '—'; }

export default function FlightGroup({ flight, overallBestFingerprint, overallBestPlatform }) {
  const [collapsed, setCollapsed] = useState(false);
  const airline = getAirline(flight.carrier);
  const sorted = [...flight.platforms].sort((a, b) => a.net_price - b.net_price);
  const bestPrice = sorted[0]?.net_price;
  const worstPrice = sorted[sorted.length - 1]?.net_price;
  const maxSaving = worstPrice - bestPrice;
  const originCity = CITY_NAMES[flight.origin] || flight.origin;
  const destCity = CITY_NAMES[flight.destination] || flight.destination;

  return (
    <div style={{ marginBottom: 16 }}>

      {/* ── Flight header ── */}
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 16px',
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: collapsed ? 12 : '12px 12px 0 0',
          borderBottom: collapsed ? undefined : '0.5px solid var(--color-border-tertiary)',
          cursor: 'pointer',
        }}
      >
        {/* Airline badge */}
        <div style={{
          width: 46, height: 46, borderRadius: 10, flexShrink: 0,
          background: airline.bg,
          border: `1.5px solid ${airline.color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: airline.color, letterSpacing: '0.03em' }}>
            {airline.short}
          </span>
        </div>

        {/* Airline name + flight number */}
        <div style={{ minWidth: 100, flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {airline.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
            {flight.flight_number}
          </div>
        </div>

        {/* Route timeline */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>

          {/* Departure */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
              {fmtTime(flight.departure_time)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              {originCity}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', opacity: 0.6 }}>
              {flight.origin}
            </div>
          </div>

          {/* Duration line */}
          <div style={{ flex: 1, textAlign: 'center', minWidth: 60 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              {fmtDur(flight.duration_mins)}
            </div>
            <div style={{ position: 'relative', height: 1, background: 'var(--color-border-secondary)', margin: '0 8px' }}>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--color-border-primary)',
              }}/>
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 4, opacity: 0.7 }}>
              Non-stop
            </div>
          </div>

          {/* Arrival */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
              {fmtTime(flight.arrival_time)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 3 }}>
              {destCity}
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', opacity: 0.6 }}>
              {flight.destination}
            </div>
          </div>
        </div>

        {/* Price + sites count */}
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 110 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 2 }}>from</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {fmt(bestPrice)}
          </div>
          <div style={{ fontSize: 11, marginTop: 2 }}>
            {maxSaving > 0
              ? <span style={{ color: '#16a34a' }}>save up to {fmt(maxSaving)}</span>
              : <span style={{ color: 'var(--color-text-secondary)' }}>no offer gap</span>
            }
          </div>
        </div>

        {/* Site count + chevron */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: 'var(--color-text-secondary)',
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 20, padding: '2px 10px',
          }}>
            {flight.platforms.length} sites
          </span>
          <span style={{
            fontSize: 10, color: 'var(--color-text-secondary)',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s', display: 'inline-block',
          }}>▼</span>
        </div>
      </div>

      {/* ── Platform rows — enclosed in a bordered container ── */}
      {!collapsed && (
        <div style={{
          border: '0.5px solid var(--color-border-tertiary)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
          background: 'var(--color-background-primary)',
        }}>
          {sorted.map((platformResult, i) => {
            const isOverallBest =
              flight.flight_fingerprint === overallBestFingerprint &&
              platformResult.platform === overallBestPlatform;
            return (
              <div
                key={`${flight.flight_fingerprint}-${platformResult.platform}`}
                style={{ borderTop: i > 0 ? '0.5px solid var(--color-border-tertiary)' : 'none' }}
              >
                <DealCard
                  result={{ ...flight, ...platformResult }}
                  isOverallBest={isOverallBest}
                  nested
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
