import React, { useState } from "react";
import { X, Play, Plus, Check, Star, Calendar, Clock, Film } from "lucide-react";

export function MediaDetailModal({ media, onClose, onPlay, onToggleWatchlist, inWatchlist }) {
  const [selectedSeason, setSelectedSeason] = useState(1);

  if (!media) return null;

  const seasons = media.seasons || [];
  const currentSeasonData = seasons.find((s) => s.seasonNumber === selectedSeason) || seasons[0];
  const episodes = media.episodes || currentSeasonData?.episodes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c111b] border border-white/10 rounded-2xl overflow-y-auto shadow-2xl text-white scrollbar-thin scrollbar-thumb-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Backdrop Banner */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img
            src={media.backdrop || media.poster}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c111b] via-[#0c111b]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c111b] via-transparent to-transparent" />

          {/* Banner bottom info */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              {media.badge && (
                <span className="inline-block px-2.5 py-0.5 mb-2 rounded bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-semibold uppercase tracking-wider">
                  {media.badge}
                </span>
              )}
              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                {media.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {/* Metadata Bar & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-300">
              <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {media.rating}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {media.releaseYear}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/10 border border-white/15">
                {media.certification}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {media.duration || `${media.seasonsCount || 1} Season(s)`}
              </span>
              <span className="text-slate-400">{media.genres?.join(", ")}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onPlay(media)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Now</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(media.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/10 transition-colors cursor-pointer"
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Watchlisted</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Synopsis */}
          <div className="my-6">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Storyline
            </h3>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
              {media.overview}
            </p>
          </div>

          {/* Cast & Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-white/10 text-xs text-slate-400">
            {media.cast && (
              <div>
                <span className="text-slate-200 font-semibold block mb-1">Starring:</span>
                <span>{media.cast.join(", ")}</span>
              </div>
            )}
            <div>
              <span className="text-slate-200 font-semibold block mb-1">Audio & Subtitles:</span>
              <span>Languages: {media.languages?.join(", ")}</span>
            </div>
          </div>

          {/* Series & Anime Episode Selector */}
          {(media.type === "tv" || media.type === "anime") && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-blue-400" />
                  <span>Episodes</span>
                </h3>

                {seasons.length > 1 && (
                  <div className="flex gap-2">
                    {seasons.map((s) => (
                      <button
                        key={s.seasonNumber}
                        onClick={() => setSelectedSeason(s.seasonNumber)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          selectedSeason === s.seasonNumber
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 hover:bg-white/10 text-slate-400"
                        }`}
                      >
                        Season {s.seasonNumber}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Episode items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {episodes.map((ep) => (
                  <div
                    key={ep.episodeNumber}
                    onClick={() =>
                      onPlay({
                        ...media,
                        currentSeason: selectedSeason,
                        currentEpisode: ep.episodeNumber
                      })
                    }
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/40 transition-all cursor-pointer group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-400">
                          EP {ep.episodeNumber}
                        </span>
                        <span className="text-xs text-slate-400">• {ep.duration}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1 group-hover:text-blue-300 truncate">
                        {ep.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-normal">
                        {ep.overview}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-white/10 group-hover:bg-blue-600 text-white transition-colors ml-3 flex-none">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
