import React, { useState } from "react";
import { Search, Home, Tv, Film, Compass, User, Sparkles } from "lucide-react";

export function Sidebar({ currentTab, onSelectTab, onOpenSearch }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: "search", label: "Search", icon: Search, action: onOpenSearch },
    { id: "home", label: "Home", icon: Home },
    { id: "tv", label: "TV", icon: Tv },
    { id: "movies", label: "Movies", icon: Film },
    { id: "anime", label: "Anime", icon: Compass },
    { id: "myspace", label: "My Space", icon: User }
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-gradient-to-r from-[#070b13] via-[#090f19] to-transparent transition-all duration-300 ease-in-out flex flex-col justify-between py-6 ${
        isExpanded ? "w-64 bg-[#090f19]/95 backdrop-blur-md shadow-2xl" : "w-20"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Brand logo & Hotstar VIP accent */}
      <div className="px-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-amber-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {isExpanded && (
            <div className="animate-fadeIn">
              <span className="font-extrabold tracking-wider text-white text-lg block leading-none">
                HOTSTAR
              </span>
              <span className="text-[10px] tracking-widest text-amber-400 font-semibold uppercase">
                Vidly Pro
              </span>
            </div>
          )}
        </div>

        {/* Subscribe / VIP badge */}
        <div className="mt-6">
          <button className="w-full bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-500/40 hover:border-amber-400 rounded-full py-1.5 px-3 flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold tracking-wide transition-all duration-200 group">
            <span className="text-amber-400">★</span>
            {isExpanded ? (
              <span className="truncate">VIP STREAM</span>
            ) : (
              <span className="sr-only">VIP</span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  onSelectTab(item.id);
                }
              }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative ${
                isActive
                  ? "text-white bg-blue-600/30 border border-blue-500/30 shadow-md shadow-blue-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                }`}
              />
              {isExpanded && (
                <span className="truncate transition-opacity duration-200">{item.label}</span>
              )}
              {/* Hotstar indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="px-5 text-slate-400 text-xs flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold">
            <User className="w-4 h-4" />
          </div>
          {isExpanded && (
            <div className="truncate">
              <p className="text-slate-200 text-xs font-medium">Guest User</p>
              <p className="text-slate-500 text-[10px]">Vidly Free Edition</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
