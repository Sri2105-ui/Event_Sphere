import React from 'react';
import { Calendar, MapPin, Users, ArrowUpRight, Sparkles, Star } from 'lucide-react';
import { Tilt3D } from './Tilt3D';

export const EventCard = ({ event, onSelect }) => {
  if (!event) return null;

  const isFree = event.price === 0;
  const isFull = event.registeredCount >= event.capacity;
  const fillPercentage = Math.min(
    Math.round(((event.registeredCount || 0) / (event.capacity || 100)) * 100),
    100
  );

  const startDate = new Date(event.startDate);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <Tilt3D maxTilt={10} perspective={1000} scale={1.02} glare={true} className="h-full">
      <div
        onClick={() => onSelect && onSelect(event)}
        className="glass-panel glass-panel-hover rounded-2xl overflow-hidden cursor-pointer group flex flex-col h-full border border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/65 shadow-md hover:shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-brand-500/50 hover:shadow-brand-500/10 dark:hover:shadow-brand-500/25 preserve-3d"
      >
        {/* Banner & Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
          <img
            src={event.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent dark:from-slate-950 dark:via-slate-950/30 dark:to-transparent" />

          {/* Category & Status Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
            {event.category && (
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-md text-white"
                style={{
                  backgroundColor: `${event.category.color || '#6366F1'}ee`
                }}
              >
                {event.category.name}
              </span>
            )}
            {event.featured && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
          </div>

          {/* Price Tag */}
          <div className="absolute top-3 right-3 z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold backdrop-blur-md shadow-md ${
                isFree
                  ? 'bg-emerald-500 text-slate-950 font-mono tracking-wide'
                  : 'bg-brand-600 text-white font-mono tracking-wide'
              }`}
            >
              {isFree ? 'FREE' : `$${event.price}`}
            </span>
          </div>

          {/* Venue Mode Pill */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700/60 uppercase">
              {event.venueType}
            </span>
          </div>

          {/* Rating Badge if available */}
          {event.averageRating > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold border border-slate-700/60 z-10">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{event.averageRating}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Date & Time */}
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate} • {formattedTime}</span>
            </div>

            {/* Title */}
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug mb-2">
              {event.title}
            </h3>

            {/* Short Description */}
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
              {event.shortDescription}
            </p>
          </div>

          <div>
            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{event.venueName}</span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  {isFull ? (
                    <span className="text-rose-500 dark:text-rose-400 font-semibold">Event Full (Waitlist Open)</span>
                  ) : (
                    <span>{event.registeredCount || 0} / {event.capacity} Registered</span>
                  )}
                </span>
                <span className={fillPercentage >= 90 ? 'text-rose-500 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                  {fillPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    fillPercentage >= 95
                      ? 'bg-rose-500'
                      : fillPercentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-brand-500'
                  }`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>

            {/* Card Footer: Organizer & Action Button */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={event.organizer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&q=80'}
                  alt={event.organizer?.name || 'Organizer'}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[130px]">
                  {event.organizer?.name || 'Campus Club'}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:text-brand-500 dark:group-hover:text-brand-300 group-hover:translate-x-0.5 transition-all">
                <span>Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Tilt3D>
  );
};
