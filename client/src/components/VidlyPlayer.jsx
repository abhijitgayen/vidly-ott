import React, { useState, useEffect } from "react";
import { ArrowLeft, Settings, ListVideo, Sparkles, Volume2 } from "lucide-react";
import { buildVidlyUrl, saveLocalWatchHistory } from "../services/api";

export function VidlyPlayer({ media, initialSeason = 1, initialEpisode = 1, onClose }) {
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [audio, setAudio] = useState("sub"); // 'sub' or 'dub' for anime
  const [theme, setTheme] = useState("aurora"); // 'aurora', 'slate', 'retro'
  const [color, setColor] = useState("0072d2"); // Hotstar blue
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastSyncProgress, setLastSyncProgress] = useState(null);

  // Determine current episodes list
  const currentSeasonData = media.seasons?.find((s) => s.seasonNumber === season) || media.seasons?.[0];
  const episodeList = media.episodes || currentSeasonData?.episodes || [
    { episodeNumber: 1, title: "Episode 1" }
  ];

  // Normalize IDs in case media object was passed from history or watchlist
  const resolvedType = media.type || media.mediaType || "movie";
  const resolvedTmdbId = media.tmdbId || media.mediaId || media.id;
  const resolvedMalId = media.malId || media.id;

  // Construct Vidly Embed URL
  const embedUrl = buildVidlyUrl({
    type: resolvedType,
    tmdbId: resolvedTmdbId,
    malId: resolvedMalId,
    id: media.id || media.mediaId,
    season,
    episode,
    audio,
    theme,
    color,
    autoplay: 1,
    startAt: lastSyncProgress?.currentTime || 0
  });

  // Handle postMessage events from Vidly.pro player (SYNC_HISTORY, VIDLY_PLAYER_EVENT)
  useEffect(() => {
    function handleMessage(event) {
      if (!event.data) return;

      const data = event.data;
      // Vidly message format: { type: "SYNC_HISTORY", payload: { currentTime, duration, ... } }
      if (data.type === "SYNC_HISTORY" || data.event === "sync_history" || data.currentTime) {
        const payload = data.payload || data;
        const currentTime = payload.currentTime || 0;
        const duration = payload.duration || 1;
        const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

        const syncRecord = {
          id: media.id || resolvedTmdbId,
          tmdbId: resolvedTmdbId,
          malId: resolvedMalId,
          mediaId: media.id || resolvedTmdbId,
          type: resolvedType,
          mediaType: resolvedType,
          title: media.title,
          poster: media.poster,
          backdrop: media.backdrop,
          progressPercent,
          currentTime,
          duration,
          season: resolvedType !== "movie" ? season : null,
          episode: resolvedType !== "movie" ? episode : null
        };

        setLastSyncProgress(syncRecord);
        saveLocalWatchHistory(syncRecord);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [media, season, episode]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fadeIn select-none">
      {/* Top Overlay Control Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            title="Back to Browse"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                Vidly Stream
              </span>
              <h2 className="text-white text-sm md:text-base font-bold truncate max-w-md">
                {media.title}
              </h2>
            </div>
            {media.type !== "movie" && (
              <p className="text-xs text-slate-300 mt-0.5">
                {media.type === "tv" ? `Season ${season} • ` : ""}
                Episode {episode}
                {media.type === "anime" && ` (${audio.toUpperCase()})`}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Episode Drawer Toggle */}
          {media.type !== "movie" && (
            <button
              onClick={() => {
                setIsDrawerOpen(!isDrawerOpen);
                setIsSettingsOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer ${
                isDrawerOpen
                  ? "bg-blue-600 text-white border-blue-400"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/15"
              }`}
            >
              <ListVideo className="w-4 h-4" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}

          {/* Player Settings (Theme, Color, Sub/Dub) */}
          <button
            onClick={() => {
              setIsSettingsOpen(!isSettingsOpen);
              setIsDrawerOpen(false);
            }}
            className={`p-2.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer ${
              isSettingsOpen
                ? "bg-blue-600 text-white border-blue-400"
                : "bg-white/10 hover:bg-white/20 text-white border-white/15"
            }`}
            title="Vidly Player Options"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Dropdown Popover */}
      {isSettingsOpen && (
        <div className="absolute right-4 top-16 z-40 w-72 p-4 rounded-2xl bg-[#0c111b]/95 backdrop-blur-xl border border-white/15 shadow-2xl text-white text-xs">
          <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-white/10 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
            <Sparkles className="w-4 h-4" />
            <span>Vidly Embed Options</span>
          </div>

          {/* Theme selector */}
          <div className="mb-3">
            <label className="block text-slate-400 font-medium mb-1.5">Player Skin Theme</label>
            <div className="grid grid-cols-3 gap-1.5">
              {["aurora", "slate", "retro"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`py-1.5 px-2 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                    theme === t
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "bg-white/5 hover:bg-white/10 text-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="mb-3">
            <label className="block text-slate-400 font-medium mb-1.5">Accent Accent Color</label>
            <div className="flex items-center gap-2">
              {[
                { name: "Hotstar Blue", hex: "0072d2" },
                { name: "Emerald", hex: "10b981" },
                { name: "Amber", hex: "f59e0b" },
                { name: "Rose", hex: "f43f5e" }
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    color === c.hex ? "scale-125 border-white ring-2 ring-blue-500" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: `#${c.hex}` }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Anime Audio Track */}
          {media.type === "anime" && (
            <div>
              <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Track</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["sub", "dub"].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudio(a)}
                    className={`py-1.5 px-2 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                      audio === a
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 hover:bg-white/10 text-slate-300"
                    }`}
                  >
                    {a === "sub" ? "Japanese (Sub)" : "English (Dub)"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Episode Drawer Sidebar */}
      {isDrawerOpen && media.type !== "movie" && (
        <div className="absolute right-0 top-16 bottom-0 z-40 w-80 bg-[#090f19]/95 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-sm">Episodes</h3>
            <span className="text-xs text-slate-400">{episodeList.length} Available</span>
          </div>

          <div className="flex flex-col gap-2">
            {episodeList.map((ep) => {
              const isActive = episode === ep.episodeNumber;
              return (
                <button
                  key={ep.episodeNumber}
                  onClick={() => {
                    setEpisode(ep.episodeNumber);
                    setIsDrawerOpen(false);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-blue-600/30 border-blue-500 text-white"
                      : "bg-white/5 border-transparent hover:bg-white/10 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Episode {ep.episodeNumber}</span>
                    {ep.duration && <span className="text-[10px] text-slate-400">{ep.duration}</span>}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 truncate">{ep.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Vidly iframe */}
      <div className="relative flex-1 w-full h-full bg-black">
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={media.title}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}
