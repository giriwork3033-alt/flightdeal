import { useState, useCallback } from 'react';
import axios from 'axios';

const POPULAR_ROUTES = [
  { origin: 'DEL', destination: 'BOM', label: 'Delhi → Mumbai' },
  { origin: 'BLR', destination: 'DEL', label: 'Bangalore → Delhi' },
  { origin: 'HYD', destination: 'BOM', label: 'Hyderabad → Mumbai' },
  { origin: 'MAA', destination: 'DEL', label: 'Chennai → Delhi' },
  { origin: 'DEL', destination: 'BLR', label: 'Delhi → Bangalore' },
];

const AVAILABLE_CARDS = [
  'HDFC Regalia',
  'HDFC Millennia',
  'SBI SimplyCLICK',
  'SBI Card Prime',
  'Axis Ace',
  'Axis Flipkart',
  'ICICI Coral',
  'ICICI Sapphiro',
  'Kotak 811',
  'Amex Gold',
];

export function useSearch() {
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('BOM');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [selectedCards, setSelectedCards] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleCard = useCallback((card) => {
    setSelectedCards(prev =>
      prev.includes(card) ? prev.filter(c => c !== card) : [...prev, card]
    );
  }, []);

  const swapRoute = useCallback(() => {
    setOrigin(destination);
    setDestination(origin);
  }, [origin, destination]);

  const search = useCallback(async () => {
    if (!origin || !destination || !date) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const API = process.env.REACT_APP_API_URL || 'https://flightdeal-wko3.onrender.com';
      const response = await axios.post(`${API}/api/search`, {
        origin,
        destination,
        date,
        cards: selectedCards
      });

      if (response.data.success) {
        setResults(response.data.results || []);
        setStats(response.data.stats);
      } else {
        setError(response.data.errors?.join(', ') || 'Search failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [origin, destination, date, selectedCards]);

  return {
    origin, setOrigin,
    destination, setDestination,
    date, setDate,
    selectedCards, toggleCard,
    results, loading, error,
    stats, hasSearched,
    search, swapRoute,
    POPULAR_ROUTES, AVAILABLE_CARDS
  };
}
