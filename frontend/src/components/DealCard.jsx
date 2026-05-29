import React, { useState } from 'react';

const PLATFORM_LINKS = {
  MMT: 'https://www.makemytrip.com/flights',
  Ixigo: 'https://www.ixigo.com/flights',
  Cleartrip: 'https://www.cleartrip.com/flights',
  Goibibo: 'https://www.goibibo.com/flights',
  EaseMyTrip: 'https://www.easemytrip.com',
  Yatra: 'https://www.yatra.com/flights',
  Paytm: 'https://travel.paytm.com/flights',
};

const PLATFORM_COLORS = {
  MMT: '#e53935', Ixigo: '#ff6f00', Cleartrip: '#1565c0',
  Goibibo: '#00897b', EaseMyTrip: '#6a1b9a',
  Yatra: '#e91e63', Paytm: '#002970',
};

const fmt = n => n != null ? '₹' + Math.round(n).toLocaleString('en-IN') : '—';

function Pill({ children, bg, color, bold }) {
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 20,
      background: bg, color, fontWeight: bold ? 600 : 400,
      whiteSpace: 'nowrap', display: 'inline-block',
    }}>{children}</span>
  );
}

function Row({ label, value, green, bold }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      fontSize: 13, padding: bold ? '7px 0 3px' : '3px 0',
      color: green ? '#16a34a' : bold ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      fontWeight: bold ? 500 : 400,
      borderTop: bold ? '0.5px solid var(--color-border-tertiary)' : 'none',
      marginTop: bold ? 4 : 0,
    }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

export default function DealCard({ result, isOverallBest, nested }) {
  const [open, setOpen] = useState(isOverallBest || false);
  const hasSaving = result.total_saving > 0;
  const hasOffer = result.card_name || result.coupon_code;
  const color = PLATFORM_COLORS[result.platform] || '#888';
  const showUpgrade = result.has_ultimate_upgrade && result.upgrade_saving > 0;
  const [showUltimate, setShowUltimate] = useState(false);

  return (
    <div style={{

      border: !nested ? (isOverallBest ? '2px solid #1d9e75' : '0.5px solid var(--color-border-tertiary)') : 'none',
      borderRadius: !nested ? 12 : 0,
      background: isOverallBest ? '#fafffe' : 'var(--color-background-primary)',
      overflow: 'hidden',
    }}>

      {/* Platform header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: isOverallBest ? '#f0fdf4' : 'var(--color-background-secondary)',
          cursor: 'pointer', gap: 12, flexWrap: 'wrap',
        }}
      >
        {/* Left: platform + pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: color, display: 'inline-block', flexShrink: 0,
          }}/>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', minWidth: 80 }}>
            {result.platform}
          </span>
          {result.coupon_code && <Pill bg="#fef9c3" color="#713f12">{result.coupon_code}</Pill>}
          {result.card_name && <Pill bg="#eff6ff" color="#1d4ed8">{result.card_name}</Pill>}
          {!hasOffer && <Pill bg="#f3f4f6" color="#9ca3af">No offer</Pill>}
          {result.best_combination?.stacked && <Pill bg="#f0fdf4" color="#15803d">Stacked</Pill>}
          {isOverallBest && <Pill bg="#dcfce7" color="#14532d" bold>Best deal</Pill>}
        </div>

        {/* Right: price + book */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            {hasSaving && (
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textDecoration: 'line-through', marginRight: 6 }}>
                {fmt(result.base_price)}
              </span>
            )}
            <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {fmt(result.net_price)}
            </span>
            {hasSaving && (
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 500, marginLeft: 6 }}>
                −{fmt(result.total_saving)}
              </span>
            )}
          </div>
          <a
            href={PLATFORM_LINKS[result.platform] || '#'}
            target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1d4ed8', color: '#fff',
              padding: '7px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}
          >Book →</a>
          <span style={{
            fontSize: 11, color: 'var(--color-text-secondary)',
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>▼</span>
        </div>
      </div>

      {/* Expanded breakdown */}
      {open && (
        <div style={{ padding: '14px 16px' }}>

          {/* Price breakdown */}
          <div style={{ marginBottom: 10 }}>
            <div style={{
              fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
            }}>
              Your price {hasOffer ? '(with your cards)' : '(no offer available)'}
            </div>
            <Row label="Base price" value={fmt(result.base_price)} />
            {result.coupon_saving > 0 && (
              <Row label={`Coupon: ${result.coupon_code}`} value={`−${fmt(result.coupon_saving)}`} green />
            )}
            {result.card_saving > 0 && (
              <Row label={`Card: ${result.card_name}`} value={`−${fmt(result.card_saving)}`} green />
            )}
            <Row label="You pay" value={fmt(result.net_price)} bold />
          </div>

          {/* Coupon instruction */}
          {result.coupon_code && (
            <div style={{
              padding: '8px 12px', background: '#fefce8',
              border: '0.5px solid #fde68a', borderRadius: 8,
              fontSize: 12, color: '#713f12', marginBottom: 10,
            }}>
              Apply coupon <strong>{result.coupon_code}</strong> at checkout on {result.platform}
              {!result.best_combination?.stacked && result.card_saving > 0 &&
                ' · Cannot stack with other coupons'}
            </div>
          )}

          {/* Ultimate price upgrade */}
          {showUpgrade && (
            <div>
              <div
                onClick={() => setShowUltimate(s => !s)}
                style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: '#faf5ff',
                  border: '0.5px solid #d8b4fe',
                  borderRadius: showUltimate ? '8px 8px 0 0' : 8,
                  cursor: 'pointer', marginBottom: 0,
                }}
              >
                <div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed' }}>
                    Ultimate lowest price
                  </span>
                  <span style={{ fontSize: 12, color: '#6d28d9', marginLeft: 8 }}>
                    {fmt(result.ultimate_net_price)}
                  </span>
                  <span style={{ fontSize: 12, color: '#16a34a', marginLeft: 8, fontWeight: 500 }}>
                    (save {fmt(result.upgrade_saving)} more with {result.ultimate_card_name})
                  </span>
                </div>
                <span style={{
                  fontSize: 11, color: '#7c3aed',
                  transform: showUltimate ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s', display: 'inline-block',
                }}>▼</span>
              </div>

              {showUltimate && (
                <div style={{
                  padding: '12px',
                  background: '#faf5ff',
                  border: '0.5px solid #d8b4fe',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  marginBottom: 10,
                }}>
                  <Row label="Base price" value={fmt(result.base_price)} />
                  {result.ultimate_coupon_saving > 0 && (
                    <Row label={`Coupon: ${result.ultimate_coupon_code}`} value={`−${fmt(result.ultimate_coupon_saving)}`} green />
                  )}
                  {result.ultimate_card_saving > 0 && (
                    <Row label={`Card: ${result.ultimate_card_name}`} value={`−${fmt(result.ultimate_card_saving)}`} green />
                  )}
                  <Row label="Ultimate price" value={fmt(result.ultimate_net_price)} bold />
                  <div style={{
                    marginTop: 10, padding: '8px 10px',
                    background: '#ede9fe', borderRadius: 6,
                    fontSize: 12, color: '#5b21b6',
                  }}>
                    Get <strong>{result.ultimate_card_name}</strong> to unlock — save an extra <strong>{fmt(result.upgrade_saving)}</strong> on this booking
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Seats urgency */}
          {result.seats_left > 0 && result.seats_left <= 5 && (
            <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 500, marginTop: 8 }}>
              Only {result.seats_left} seats left at this price
            </div>
          )}
        </div>
      )}
    </div>
  );
}
