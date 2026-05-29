import React from 'react';
import SearchBar from './components/SearchBar';
import ResultsTable from './components/ResultsTable';
import { useSearch } from './hooks/useSearch';

export default function App() {
  const search = useSearch();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
        select, input, button { font-family: inherit; }
        a { text-decoration: none; }
      `}</style>

      {/* Header */}
      <header style={{
        background: '#fff',
        borderBottom: '0.5px solid #e5e7eb',
        padding: '18px 0',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>✈ FlightDeal</span>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '2px 8px',
              background: '#eff6ff', color: '#1d4ed8', borderRadius: 20,
            }}>India</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            Real price after every discount — cards, coupons, all platforms
          </p>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 900, margin: '28px auto', padding: '0 20px', width: '100%' }}>
        <SearchBar
          origin={search.origin}
          setOrigin={search.setOrigin}
          destination={search.destination}
          setDestination={search.setDestination}
          date={search.date}
          setDate={search.setDate}
          selectedCards={search.selectedCards}
          toggleCard={search.toggleCard}
          loading={search.loading}
          search={search.search}
          swapRoute={search.swapRoute}
          AVAILABLE_CARDS={search.AVAILABLE_CARDS}
        />

        <ResultsTable
          results={search.results}
          loading={search.loading}
          error={search.error}
          hasSearched={search.hasSearched}
          stats={search.stats}
        />
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        fontSize: 12,
        color: '#9ca3af',
        borderTop: '0.5px solid #e5e7eb',
      }}>
        FlightDeal · Post-discount flight comparison for India · Prices include all applicable card and coupon savings
      </footer>
    </div>
  );
}
