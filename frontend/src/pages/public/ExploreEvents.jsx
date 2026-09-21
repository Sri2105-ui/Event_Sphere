import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { EventCard } from '../../components/EventCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Calendar,
  Compass,
  DollarSign
} from 'lucide-react';

export const ExploreEvents = ({ initialFilters = {}, onSelectEvent }) => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || 'all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceType, setPriceType] = useState('all');
  const [venueType, setVenueType] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedType !== 'all') params.append('eventType', selectedType);
      if (priceType !== 'all') params.append('priceType', priceType);
      if (venueType !== 'all') params.append('venueType', venueType);
      if (sortBy) params.append('sort', sortBy);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [keyword, selectedCategory, selectedType, priceType, venueType, sortBy]);

  const handleReset = () => {
    setKeyword('');
    setSelectedCategory('all');
    setSelectedType('all');
    setPriceType('all');
    setVenueType('all');
    setSortBy('date-asc');
  };

  const eventTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'hackathon', label: 'Hackathons' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'seminar', label: 'Seminars' },
    { id: 'cultural', label: 'Cultural Fests' },
    { id: 'competition', label: 'Competitions' },
    { id: 'conference', label: 'Conferences' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">
          <Compass className="w-4 h-4" />
          <span>Discover Campus Life</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-white">
          Explore All Events
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Filter by category, event type, ticket pricing, and format.
        </p>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by title, topic, or keyword..."
            className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
          >
            <option value="date-asc">Upcoming First</option>
            <option value="date-desc">Newest Added</option>
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          <button
            onClick={handleReset}
            title="Reset Filters"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row 1: Event Types */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {eventTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === t.id
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter Row 2: Faceted Categories & Secondary Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">Category:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Price & Venue Selectors */}
        <div className="flex items-center gap-2">
          {/* Price Selector */}
          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Prices</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>

          {/* Venue Mode Selector */}
          <select
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Formats</option>
            <option value="in-person">In-Person</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-xl text-white">No Events Match Your Search</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords, switching categories, or clearing active filters to view all campus activities.
          </p>
          <button
            onClick={handleReset}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {events.map((evt) => (
            <EventCard key={evt._id} event={evt} onSelect={onSelectEvent} />
          ))}
        </div>
      )}
    </div>
  );
};
