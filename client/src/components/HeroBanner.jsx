import React, { useState, useEffect } from "react";
import { Play, Plus, Check, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";

export function HeroBanner({ items = [], onPlay, onSelectDetails, onToggleWatchlist, watchlistIds = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [items]);

  if (!items.length) return null;
  const current = items[currentIndex] || items[0];
  const inWatchlist = watchlistIds.includes(current.id);

  return (
    <div className="relative w-full h-[78vh] min-h-[520px] max-h-[780px] overflow-hidden select-none">
      {/* Background with dark overlay & subtle gradient vignette */}
      <div className="absolute inset-0">
        <img
          src={current.backdrop || current.poster}
          alt={current.title}
          className="w-full h-full object-cover object-center transition-all duration-1000 transform scale-105"
        />
        {/* Hotstar Multi-Directional Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c111b] via-[#0c111b]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c111b] via-[#0c111b]/80 to-transparent w-3/4" />
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#0c111b]/80 to-transparent" />
      </div>

      {/* Hero content overlay */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-20 pl-24 md:pl-28">
        {/* Badge */}
        {current.badge && (
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md w-max">
            <span>★</span>
            <span>{current.badge}</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl drop-shadow-md">
          {current.title}
        </h1>

        {/* Metadata pills */}
        <div className="flex flex-wrap items-center gap-3 mt-4 text-xs md:text-sm text-slate-300 font-medium">
          <div className="flex items-center gap-1 text-amber-400 font-bold bg-black/40 px-2 py-0.5 rounded border border-white/10">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{current.rating}</span>
          </div>
          <span>•</span>
          <span>{current.releaseYear}</span>
          <span>•</span>
          <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-white/10 text-slate-200 border border-white/10">
            {current.certification}
          </span>
          <span>•</span>
          <span>{current.duration || `${current.seasonsCount} Seasons`}</span>
          <span>•</span>
          <span className="text-slate-400">{current.genres?.join(", ")}</span>
        </div>

        {/* Overview text */}
        <p className="mt-3 text-sm md:text-base text-slate-300/90 line-clamp-3 max-w-2xl font-normal leading-relaxed drop-shadow">
          {current.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => onPlay(current)}
            className="flex items-center gap-2.5 px-7 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm md:text-base tracking-wide transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            <span>Watch Now</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(current.id)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer"
          >
            {inWatchlist ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Watchlist</span>
              </>
            )}
          </button>

          <button
            onClick={() => onSelectDetails(current)}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            title="More Information"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel indicators & slide controls */}
        <div className="absolute right-8 md:right-16 bottom-16 flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? "w-6 bg-blue-500" : "w-1.5 bg-white/30"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-slate-300 hover:text-white border border-white/10 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
