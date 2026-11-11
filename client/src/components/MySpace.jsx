import React, { useState } from "react";
import { User, Bookmark, History, Play, Trash2 } from "lucide-react";
import { CATALOG } from "../services/catalogData";

export function MySpace({ watchlistIds = [], watchHistory = [], onPlay, onSelectDetails, onToggleWatchlist }) {
  const [activeTab, setActiveTab] = useState("watchlist");

  const watchlistItems = CATALOG.filter((item) => watchlistIds.includes(item.id));

  return (
    <div className="min-h-screen text-white pt-10 pb-20 px-6 md:px-12 pl-24 md:pl-28 max-w-7xl">
      {/* Profile Header */}
      <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-transparent border border-white/10 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
          <User className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">My Space</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              VIP Member
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Manage your saved watchlist and watch progress synchronized with Vidly.pro
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-8">
        <button
          onClick={() => setActiveTab("watchlist")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "watchlist"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Watchlist ({watchlistItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "history"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
              : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Watch History ({watchHistory.length})</span>
        </button>
      </div>

      {/* Tab Content: Watchlist */}
      {activeTab === "watchlist" && (
        <div>
          {watchlistItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectDetails(item)}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-blue-500 transition-all cursor-pointer transform hover:scale-105"
                >
                  <img
                    src={item.poster || item.backdrop}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 flex flex-col justify-end">
                    <span className="text-white text-xs font-bold truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{item.type === "movie" ? "Movie" : "TV Series"}</span>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(item);
                        }}
                        className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(item.id);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Bookmark className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-base font-semibold text-slate-300">Your Watchlist is empty</p>
              <p className="text-xs text-slate-500 mt-1">Explore movies and TV shows and click "+ Watchlist" to save them here.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Watch History */}
      {activeTab === "history" && (
        <div>
          {watchHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {watchHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onPlay(item)}
                  className="bg-[#121926] rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
                >
                  <div className="relative h-36 w-full">
                    <img
                      src={item.backdrop || item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${item.progressPercent || 20}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm font-semibold truncate">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.season ? `S${item.season} E${item.episode} • ` : ""}
                      {item.progressPercent || 0}% watched ({Math.floor((item.currentTime || 0) / 60)} mins)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <History className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-base font-semibold text-slate-300">No watch history yet</p>
              <p className="text-xs text-slate-500 mt-1">Start watching any title and your progress will sync automatically via Vidly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
