import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { HeroBanner } from "./components/HeroBanner";
import { MediaCarousel } from "./components/MediaCarousel";
import { MediaDetailModal } from "./components/MediaDetailModal";
import { VidlyPlayer } from "./components/VidlyPlayer";
import { SearchModal } from "./components/SearchModal";
import { MySpace } from "./components/MySpace";
import {
  fetchTrending,
  fetchCatalog,
  getLocalWatchHistory,
  getLocalWatchlist,
  toggleLocalWatchlist
} from "./services/api";

export function App() {
  const [currentTab, setCurrentTab] = useState("home");
  const [trendingData, setTrendingData] = useState({ hero: [], sections: [] });
  const [catalogItems, setCatalogItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [activePlayingMedia, setActivePlayingMedia] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const trending = await fetchTrending();
      setTrendingData(trending);

      const history = getLocalWatchHistory();
      setWatchHistory(history);

      const watchlist = getLocalWatchlist();
      setWatchlistIds(watchlist);
    }
    loadData();
  }, []);

  // Filter catalog when switching tabs (tv, movies, anime)
  useEffect(() => {
    if (["tv", "movies", "anime"].includes(currentTab)) {
      const typeMap = { movies: "movie", tv: "tv", anime: "anime" };
      fetchCatalog({ type: typeMap[currentTab] }).then((res) => {
        setCatalogItems(res.items || []);
      });
    }
  }, [currentTab]);

  const handleToggleWatchlist = (mediaId) => {
    const updated = toggleLocalWatchlist(mediaId);
    setWatchlistIds(updated);
  };

  const handlePlayMedia = (media) => {
    setActivePlayingMedia(media);
    setSelectedMedia(null);
  };

  return (
    <div className="min-h-screen bg-[#0c111b] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Hotstar Left Vertical Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === "home" && (
          <>
            {/* Dynamic Hero Carousel */}
            <HeroBanner
              items={trendingData.hero}
              onPlay={handlePlayMedia}
              onSelectDetails={(item) => setSelectedMedia(item)}
              onToggleWatchlist={handleToggleWatchlist}
              watchlistIds={watchlistIds}
            />

            {/* Content Carousels */}
            <div className="-mt-12 relative z-20 space-y-4">
              {/* Continue watching row */}
              {watchHistory.length > 0 && (
                <MediaCarousel
                  title="Continue Watching"
                  type="continue-watching"
                  items={watchHistory}
                  onPlay={handlePlayMedia}
                  onSelectDetails={(item) => setSelectedMedia(item)}
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlistIds={watchlistIds}
                />
              )}

              {/* Standard curated sections */}
              {trendingData.sections?.map((section) => {
                if (section.type === "continue-watching") return null;
                return (
                  <MediaCarousel
                    key={section.id}
                    title={section.title}
                    type={section.type}
                    items={section.items}
                    onPlay={handlePlayMedia}
                    onSelectDetails={(item) => setSelectedMedia(item)}
                    onToggleWatchlist={handleToggleWatchlist}
                    watchlistIds={watchlistIds}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Tab Views: TV, Movies, Anime */}
        {["tv", "movies", "anime"].includes(currentTab) && (
          <div className="pt-10 px-6 md:px-12 pl-24 md:pl-28">
            <h1 className="text-2xl md:text-3xl font-extrabold capitalize mb-6 text-white flex items-center gap-2">
              <span>
                {currentTab === "movies"
                  ? "Blockbuster Movies"
                  : currentTab === "tv"
                  ? "Popular TV Series"
                  : "Trending Anime"}
              </span>
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {catalogItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-blue-500 transition-all cursor-pointer transform hover:scale-105"
                >
                  <img
                    src={item.poster || item.backdrop}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 flex flex-col justify-end">
                    <span className="text-white text-xs font-bold truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400">{item.releaseYear} • {item.genres?.[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab View: My Space */}
        {currentTab === "myspace" && (
          <MySpace
            watchlistIds={watchlistIds}
            watchHistory={watchHistory}
            onPlay={handlePlayMedia}
            onSelectDetails={(item) => setSelectedMedia(item)}
            onToggleWatchlist={handleToggleWatchlist}
          />
        )}
      </main>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <MediaDetailModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onPlay={handlePlayMedia}
          onToggleWatchlist={handleToggleWatchlist}
          inWatchlist={watchlistIds.includes(selectedMedia.id)}
        />
      )}

      {/* Vidly Pro Streaming Player */}
      {activePlayingMedia && (
        <VidlyPlayer
          media={activePlayingMedia}
          initialSeason={activePlayingMedia.currentSeason || 1}
          initialEpisode={activePlayingMedia.currentEpisode || 1}
          onClose={() => {
            setActivePlayingMedia(null);
            setWatchHistory(getLocalWatchHistory());
          }}
        />
      )}

      {/* Global Search Dialog */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMedia={(item) => setSelectedMedia(item)}
      />
    </div>
  );
}

export default App;
