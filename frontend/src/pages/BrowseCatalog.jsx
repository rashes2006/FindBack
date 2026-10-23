import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Tag,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  PackageOpen,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { ItemCard } from '../components/ItemCard';
import { apiClient } from '../api/client';

const CATEGORIES = [
  'All',
  'Electronics',
  'IDs & Cards',
  'Keys & Wallets',
  'Books & Stationery',
  'Clothing & Accessories',
  'Bags',
  'Personal Essentials',
  'Others'
];

const CAMPUS_ZONES = [
  'All',
  'Central Library',
  'Main Cafeteria',
  'Auditorium Complex',
  'Sports Arena',
  'Academic Block A',
  'Academic Block B',
  'Hostel Block 1',
  'Hostel Block 2',
  'Computer Science Lab',
  'Admin Building',
  'Campus Grounds / Parking'
];

export const BrowseCatalog = ({ onSelectItem, onOpenReport }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all'); // 'all' | 'found' | 'lost'
  const [category, setCategory] = useState('All');
  const [campusZone, setCampusZone] = useState('All');
  const [status, setStatus] = useState('All');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (type !== 'all') params.append('type', type);
      if (category !== 'All') params.append('category', category);
      if (campusZone !== 'All') params.append('campusZone', campusZone);
      if (status !== 'All') params.append('status', status);

      const res = await apiClient(`/items?${params.toString()}`);
      if (res.success) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiClient('/analytics/dashboard');
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.warn('Could not load stats:', err.message);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, type, category, campusZone, status]);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header & Live KPI Metrics */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-8 sm:p-10 shadow-2xl border border-indigo-900/40">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Anti-Fraud Verification Enabled</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3">
            Lost Something on Campus? <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">
              Recover It Securely.
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            A centralized digital lost & found registry for classrooms, libraries, hostels, and labs. Protected with private verification clues and 6-digit cryptographic handover tokens.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 active:scale-95 transition"
              id="hero-report-btn"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost or Found Item</span>
            </button>
            <button
              onClick={() => {
                setType('found');
                setStatus('open');
              }}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/10 transition"
            >
              Browse Unclaimed Items
            </button>
          </div>
        </div>

        {/* Live Metrics Cards */}
        {stats && (
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-slate-400 font-medium">Total Items</p>
              <p className="text-2xl font-black text-white mt-1">{stats.totalItems}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-slate-400 font-medium">Found Items</p>
              <p className="text-2xl font-black text-blue-400 mt-1">{stats.totalFound}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-slate-400 font-medium">Returned to Owners</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats.totalReturned}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-slate-400 font-medium">Recovery Rate</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{stats.recoveryRate}%</p>
            </div>
          </div>
        )}

        {/* Ambient background blur blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by item title, description, or specific location..."
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition bg-slate-50/50"
              id="search-input"
            />
          </div>

          {/* Type Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl shrink-0">
            <button
              onClick={() => setType('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                type === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setType('found')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                type === 'found'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Items
            </button>
            <button
              onClick={() => setType('lost')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                type === 'lost'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Reports
            </button>
          </div>
        </div>

        {/* Dropdown Filters (Campus Zone & Status) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          {/* Campus Zone */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={campusZone}
              onChange={(e) => setCampusZone(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500"
              id="zone-filter-select"
            >
              {CAMPUS_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone === 'All' ? 'All Campus Zones' : zone}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-500"
              id="status-filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="open">Available to Claim</option>
              <option value="claim_pending">Claim Under Review</option>
              <option value="approved_for_handover">Ready for OTP Pickup</option>
              <option value="returned">Returned to Owner</option>
            </select>
          </div>

          {(search || type !== 'all' || category !== 'All' || campusZone !== 'All' || status !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setType('all');
                setCategory('All');
                setCampusZone('All');
                setStatus('All');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                category === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Items Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Catalog Items
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
              {items.length}
            </span>
          </div>
          <button
            onClick={fetchItems}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition"
            title="Refresh items"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse p-4 space-y-4"
              >
                <div className="h-44 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
            <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No matching items found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              Try adjusting your search criteria or report a new lost or found item.
            </p>
            <button
              onClick={onOpenReport}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              Report an Item Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} onSelect={onSelectItem} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
