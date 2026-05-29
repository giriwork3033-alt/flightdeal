import React from 'react';

const AIRPORT_CODES = [
  { code: 'DEL', name: 'Delhi' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'BLR', name: 'Bangalore' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'CCU', name: 'Kolkata' },
  { code: 'PNQ', name: 'Pune' },
  { code: 'AMD', name: 'Ahmedabad' },
  { code: 'GOI', name: 'Goa' },
  { code: 'COK', name: 'Kochi' },
];

export default function SearchBar({
  origin, setOrigin,
  destination, setDestination,
  date, setDate,
  selectedCards, toggleCard,
  loading, search, swapRoute,
  AVAILABLE_CARDS
}) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={styles.container}>
      {/* Route row */}
      <div style={styles.routeRow}>
        <div style={styles.field}>
          <label style={styles.label}>From</label>
          <select
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            style={styles.select}
          >
            {AIRPORT_CODES.map(a => (
              <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>

        <button onClick={swapRoute} style={styles.swapBtn} title="Swap">
          ⇄
        </button>

        <div style={styles.field}>
          <label style={styles.label}>To</label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            style={styles.select}
          >
            {AIRPORT_CODES.map(a => (
              <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Date</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={e => setDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {/* Card selector */}
      <div style={styles.cardSection}>
        <label style={styles.label}>Your cards (select all you have)</label>
        <div style={styles.cardGrid}>
          {AVAILABLE_CARDS.map(card => (
            <button
              key={card}
              onClick={() => toggleCard(card)}
              style={{
                ...styles.cardChip,
                ...(selectedCards.includes(card) ? styles.cardChipActive : {})
              }}
            >
              {selectedCards.includes(card) ? '✓ ' : ''}{card}
            </button>
          ))}
        </div>
        {selectedCards.length === 0 && (
          <p style={styles.hint}>
            Select your cards to see personalised post-discount prices
          </p>
        )}
      </div>

      {/* Search button */}
      <button
        onClick={search}
        disabled={loading || origin === destination}
        style={{
          ...styles.searchBtn,
          ...(loading ? styles.searchBtnLoading : {})
        }}
      >
        {loading ? 'Searching all platforms...' : 'Find best price'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: 16,
    padding: '24px',
    border: '1px solid #e5e7eb',
    marginBottom: 24,
  },
  routeRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: 1,
    minWidth: 140,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 15,
    background: '#fff',
    cursor: 'pointer',
  },
  dateInput: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 15,
  },
  swapBtn: {
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: 18,
    marginBottom: 2,
  },
  cardSection: {
    marginBottom: 20,
  },
  cardGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  cardChip: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.15s',
    color: '#374151',
  },
  cardChipActive: {
    background: '#eff6ff',
    border: '1px solid #3b82f6',
    color: '#1d4ed8',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  searchBtn: {
    width: '100%',
    padding: '14px',
    background: '#1d4ed8',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  searchBtnLoading: {
    background: '#93c5fd',
    cursor: 'not-allowed',
  },
};
