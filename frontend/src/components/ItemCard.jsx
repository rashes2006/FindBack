import React from 'react';
import { MapPin, Calendar, ShieldAlert, ArrowRight, Tag } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const ItemCard = ({ item, onSelect }) => {
  const isFound = item.type === 'found';

  // Fallback image based on category
  const defaultImage =
    item.imageUrl ||
    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';

  const formattedDate = new Date(item.dateOccurred || item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
      id={`item-card-${item._id}`}
    >
      {/* Image container */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={defaultImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
              isFound
                ? 'bg-blue-600 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {isFound ? 'Found Item' : 'Lost Item'}
          </span>
          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {item.category}
          </span>
        </div>

        {/* Status badge at bottom right of image */}
        <div className="absolute bottom-3 right-3 shadow-sm">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
            {item.title}
          </h3>

          <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location?.campusZone}</span>
            {item.location?.specificSpot && item.location?.specificSpot !== 'General area' && (
              <span className="text-slate-400 text-[11px] truncate">
                • {item.location.specificSpot}
              </span>
            )}
          </div>

          {/* Date & Action */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
