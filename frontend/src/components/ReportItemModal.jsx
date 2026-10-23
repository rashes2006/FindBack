import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  MapPin,
  Calendar,
  Image as ImageIcon,
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

const PRESET_IMAGES = [
  {
    label: 'AirPods / Earphones',
    url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Calculator',
    url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Keys & Lanyard',
    url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Leather Wallet',
    url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Water Bottle',
    url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'MacBook / Laptop',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
  }
];

const CAMPUS_ZONES = [
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

const CATEGORIES = [
  'Electronics',
  'IDs & Cards',
  'Keys & Wallets',
  'Books & Stationery',
  'Clothing & Accessories',
  'Bags',
  'Personal Essentials',
  'Others'
];

export const ReportItemModal = ({ isOpen, onClose, onItemCreated }) => {
  const { user } = useAuth();

  const [type, setType] = useState('found');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [campusZone, setCampusZone] = useState('Central Library');
  const [specificSpot, setSpecificSpot] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dateOccurred, setDateOccurred] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Anti-fraud verification questions (at least 1 for found items)
  const [clues, setClues] = useState([
    {
      question: 'What is a distinctive sticker, mark, or characteristic on this item?',
      expectedAnswerHint: ''
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddClue = () => {
    if (clues.length >= 3) return;
    setClues([...clues, { question: '', expectedAnswerHint: '' }]);
  };

  const handleRemoveClue = (index) => {
    setClues(clues.filter((_, i) => i !== index));
  };

  const handleClueChange = (index, field, value) => {
    const updated = [...clues];
    updated[index][field] = value;
    setClues(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and description.');
      return;
    }

    if (type === 'found' && clues.some((c) => !c.question.trim())) {
      setError('Please fill in all security verification questions.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type,
        title,
        category,
        description,
        location: {
          campusZone,
          specificSpot: specificSpot || 'General area'
        },
        dateOccurred: new Date(dateOccurred),
        imageUrl: imageUrl || PRESET_IMAGES[0].url,
        verificationClues: type === 'found' ? clues : []
      };

      const res = await apiClient('/items', { body: payload });
      if (res.success) {
        onItemCreated(res.item);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Report an Item
            </h2>
            <p className="text-xs text-slate-500">
              {type === 'found'
                ? 'Help an owner recover their belongings with anti-fraud protection'
                : 'Broadcast your missing item across campus departments'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Selector (Found vs Lost) */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('found')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                type === 'found'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎉 I Found an Item
            </button>
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                type === 'lost'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔍 I Lost an Item
            </button>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Item Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apple AirPods Pro with white case"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campus Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Campus Zone *
              </label>
              <select
                value={campusZone}
                onChange={(e) => setCampusZone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition bg-white"
              >
                {CAMPUS_ZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Specific Spot
              </label>
              <input
                type="text"
                value={specificSpot}
                onChange={(e) => setSpecificSpot(e.target.value)}
                placeholder="e.g. 2nd floor desk 14"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date {type === 'found' ? 'Found' : 'Lost'} *
              </label>
              <input
                type="date"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition bg-white"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              General Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe color, general brand, and where it was situated. (Do NOT give away private serial numbers or secret markings here!)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition"
              required
            />
          </div>

          {/* Photo URL or Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Item Photo URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or pick a preset below"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-500 text-xs outline-none transition mb-2"
            />

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium py-1">
                Quick photo presets:
              </span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    imageUrl === preset.url
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ANTI-FRAUD SECURITY QUESTIONS (Only for Found items) */}
          {type === 'found' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-blue-50/70 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Anti-Fraud Verification Clues
                  </h3>
                </div>
                {clues.length < 3 && (
                  <button
                    type="button"
                    onClick={handleAddClue}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                Set questions that <strong>only the true owner would know</strong> (e.g. *"What is the lock screen wallpaper?"*, *"What name is inside?"*). The expected answer stays strictly private to you and campus security!
              </p>

              <div className="space-y-3">
                {clues.map((clue, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-indigo-200/80 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-[11px] font-bold text-slate-700">
                        Question #{idx + 1} *
                      </label>
                      {clues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveClue(idx)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={clue.question}
                      onChange={(e) =>
                        handleClueChange(idx, 'question', e.target.value)
                      }
                      placeholder="e.g. What sticker or engraved mark is on the back?"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                      required
                    />

                    <div>
                      <input
                        type="text"
                        value={clue.expectedAnswerHint}
                        onChange={(e) =>
                          handleClueChange(idx, 'expectedAnswerHint', e.target.value)
                        }
                        placeholder="Private Hint / Answer (visible only to you and security officers)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none text-slate-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 transition active:scale-95"
              id="submit-item-report-btn"
            >
              {loading ? 'Publishing Report...' : 'Publish Item Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
