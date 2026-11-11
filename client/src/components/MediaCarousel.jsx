import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Star, Plus, Check } from "lucide-react";

export function MediaCarousel({
  title,
  type = "standard",
  items = [],
  onPlay,
  onSelectDetails,
  onToggleWatchlist,
  watchlistIds = []
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -600 : 600;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/carousel my-8 px-6 md:px-12 pl-24 md:pl-28">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h2>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-16 md:left-20 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 border border-white/10 shadow-xl cursor-pointer"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 border border-white/10 shadow-xl cursor-pointer"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, index) => {
          const inWatchlist = watchlistIds.includes(item.id || item.mediaId);

          // Type 1: Continue Watching Card
          if (type === "continue-watching") {
            return (
              <div
                key={item.mediaId || index}
                onClick={() => onPlay(item)}
                className="relative flex-none w-64 md:w-72 bg-[#121926] rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              >
                <div className="relative h-36 w-full overflow-hidden">
                  <img
                    src={item.backdrop || item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${item.progressPercent || 25}%` }}
                    />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-semibold truncate">{item.title}</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    {item.season ? `S${item.season} E${item.episode} • ` : ""}
                    Resume at {Math.floor((item.currentTime || 0) / 60)}m
                  </p>
                </div>
              </div>
            );
          }

          // Type 2: Hotstar Top 10 Ranked Row with Big Numbers
          if (type === "ranked") {
            const rank = index + 1;
            return (
              <div
                key={item.id}
                className="relative flex-none flex items-center group cursor-pointer"
                onClick={() => onSelectDetails(item)}
              >
                {/* Big Stylized Hotstar Number */}
                <div className="w-20 md:w-28 -mr-6 md:-mr-8 select-none pointer-events-none z-10">
                  <span
                    className="text-8xl md:text-9xl font-black italic tracking-tighter text-transparent block leading-none"
                    style={{
                      WebkitTextStroke: "3px rgba(255, 255, 255, 0.35)",
                      fontFamily: "sans-serif"
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Poster Card */}
                <div className="relative w-36 sm:w-44 md:w-48 aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-white/10 group-hover:border-blue-400/80 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                  <img
                    src={item.poster || item.backdrop}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <p className="text-white text-xs font-bold leading-tight truncate">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(item);
                        }}
                        className="p-2 rounded-full bg-white text-black hover:bg-slate-200 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(item.id);
                        }}
                        className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                      >
                        {inWatchlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Type 3: Standard Hotstar Poster Card
          return (
            <div
              key={item.id}
              onClick={() => onSelectDetails(item)}
              className="relative flex-none w-36 sm:w-44 md:w-48 aspect-[2/3] rounded-xl overflow-hidden bg-[#121926] border border-white/5 hover:border-blue-400/80 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer group"
            >
              <img
                src={item.poster || item.backdrop}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Top rating badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-400 border border-white/10">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{item.rating}</span>
              </div>

              {/* Hover detail reveal */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c111b] via-[#0c111b]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <h3 className="text-white text-xs md:text-sm font-bold truncate">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 mt-0.5">
                  <span>{item.releaseYear}</span>
                  <span>•</span>
                  <span>{item.certification}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(item);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Watch</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(item.id);
                    }}
                    className="p-1.5 rounded-lg bg-white/15 hover:bg-white/30 text-white transition-colors"
                  >
                    {inWatchlist ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
