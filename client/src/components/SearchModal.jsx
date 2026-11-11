import React, { useState, useEffect } from "react";
import { Search, X, Star } from "lucide-react";
import { searchMedia } from "../services/api";

export function SearchModal({ isOpen, onClose, onSelectMedia }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const data = await searchMedia(query);
      setResults(data);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const filteredResults = activeCategory === "all"
    ? results
    : results.filter((r) => r.type === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col p-6 md:p-12 animate-fadeIn">
      {/* Top Search Bar */}
      <div className="max-w-4xl w-full mx-auto">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Movies, shows, anime and more..."
            className="w-full bg-[#121926] border border-blue-500/40 focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder-slate-400 text-base md:text-lg outline-none shadow-xl transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-12 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-3 ml-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Filter Tabs */}
        <div className="flex items-center gap-2 mt-4">
          {[
            { id: "all", label: "All" },
            { id: "movie", label: "Movies" },
            { id: "tv", label: "TV Shows" },
            { id: "anime", label: "Anime" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-4xl w-full mx-auto mt-8 flex-1 overflow-y-auto">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectMedia(item);
                  onClose();
                }}
                className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 border border-white/10 hover:border-blue-500 transition-all cursor-pointer transform hover:scale-105"
              >
                <img
                  src={item.poster || item.backdrop}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-white text-xs font-bold truncate">{item.title}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{item.releaseYear}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg font-medium text-slate-300">No results found for "{query}"</p>
            <p className="text-sm mt-1 text-slate-500">Try searching for movies like Interstellar, Stranger Things, or Jujutsu Kaisen.</p>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 text-sm">
            Type anything above to search the Hotstar Vidly streaming catalog
          </div>
        )}
      </div>
    </div>
  );
}
