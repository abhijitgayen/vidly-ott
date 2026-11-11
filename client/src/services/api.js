/**
 * Frontend API Service
 * Communicates with the Express backend or seamlessly falls back to local data & localStorage.
 */

import { CATALOG as FALLBACK_CATALOG, GENRES as FALLBACK_GENRES } from "./catalogData.js";

const API_BASE = "http://localhost:5001/api";

const LOCAL_STORAGE_KEYS = {
  HISTORY: "vidly_ott_history",
  WATCHLIST: "vidly_ott_watchlist",
  THEME_PREF: "vidly_ott_player_theme",
  COLOR_PREF: "vidly_ott_player_color"
};

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch {
    return { status: "local-fallback", platform: "Vidly OTT Hotstar Edition" };
  }
}

export async function fetchTrending() {
  try {
    const res = await fetch(`${API_BASE}/trending`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Trending fetch failed");
    return await res.json();
  } catch {
    const hero = FALLBACK_CATALOG.filter((i) => i.featured).slice(0, 5);
    const top10 = [...FALLBACK_CATALOG].sort((a, b) => a.trendingRank - b.trendingRank).slice(0, 10);
    const blockbusterMovies = FALLBACK_CATALOG.filter((i) => i.type === "movie");
    const popularSeries = FALLBACK_CATALOG.filter((i) => i.type === "tv");
    const animeHits = FALLBACK_CATALOG.filter((i) => i.type === "anime");

    return {
      hero,
      sections: [
        { id: "continue-watching", title: "Continue Watching", type: "continue-watching" },
        { id: "top-10", title: "Top 10 in India Today - Hindi & English", type: "ranked", items: top10 },
        { id: "blockbusters", title: "Blockbuster Movies", type: "standard", items: blockbusterMovies },
        { id: "tv-series", title: "Popular TV Shows", type: "standard", items: popularSeries },
        { id: "anime", title: "Trending Anime", type: "standard", items: animeHits }
      ]
    };
  }
}

export async function fetchCatalog(filters = {}) {
  const { type, genre, q } = filters;
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (genre) params.append("genre", genre);
  if (q) params.append("q", q);

  try {
    const res = await fetch(`${API_BASE}/catalog?${params}`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("Catalog fetch failed");
    return await res.json();
  } catch {
    let list = [...FALLBACK_CATALOG];
    if (type && type !== "all") list = list.filter((i) => i.type === type);
    if (genre && genre !== "All") list = list.filter((i) => i.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
    if (q) {
      const term = q.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(term) || i.overview.toLowerCase().includes(term));
    }
    return { total: list.length, genres: FALLBACK_GENRES, items: list };
  }
}

export async function searchMedia(query) {
  if (!query?.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();
    return data.results;
  } catch {
    const term = query.toLowerCase();
    return FALLBACK_CATALOG.filter((item) =>
      item.title.toLowerCase().includes(term) ||
      (item.originalTitle && item.originalTitle.toLowerCase().includes(term)) ||
      item.genres.some((g) => g.toLowerCase().includes(term)) ||
      (item.cast && item.cast.some((c) => c.toLowerCase().includes(term)))
    );
  }
}

/**
 * Builds standard Vidly.pro player embed URL
 * Supported routes per API doc:
 *   - /movie/{tmdb_id}
 *   - /tv/{tmdb_id}/{season}/{episode}
 *   - /anime/{id}/{ep}/{audio}
 *   - Query params: theme, color, autoplay, startAt
 */
export function buildVidlyUrl({
  type = "movie",
  tmdbId,
  malId,
  id,
  season = 1,
  episode = 1,
  audio = "sub",
  theme = "aurora",
  color = "0072d2",
  autoplay = 1,
  startAt = 0
}) {
  let path = "";
  if (type === "movie") {
    const targetId = tmdbId || id;
    path = `/movie/${targetId}`;
  } else if (type === "tv") {
    const targetId = tmdbId || id;
    path = `/tv/${targetId}/${season}/${episode}`;
  } else if (type === "anime") {
    const targetId = malId || id;
    path = `/anime/${targetId}/${episode}/${audio}`;
  }

  const cleanColor = color.replace("#", "");
  const params = new URLSearchParams();
  if (theme) params.append("theme", theme);
  if (cleanColor) params.append("color", cleanColor);
  if (autoplay !== undefined) params.append("autoplay", autoplay.toString());
  if (startAt && Number(startAt) > 0) params.append("startAt", Math.floor(startAt).toString());

  return `https://vidly.pro/embed${path}?${params.toString()}`;
}

export function getLocalWatchHistory() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.HISTORY);
    if (!raw) {
      return [
        {
          mediaId: "m-1010581",
          mediaType: "movie",
          title: "My Fault (Culpa mía)",
          poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
          progressPercent: 68,
          currentTime: 4773,
          duration: 7020
        },
        {
          mediaId: "tv-66732",
          mediaType: "tv",
          title: "Stranger Things",
          poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
          progressPercent: 42,
          currentTime: 1210,
          duration: 2880,
          season: 1,
          episode: 2
        }
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalWatchHistory(item) {
  try {
    const history = getLocalWatchHistory().filter((h) => h.mediaId !== item.mediaId);
    history.unshift(item);
    localStorage.setItem(LOCAL_STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 20)));

    fetch(`${API_BASE}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    }).catch(() => {});
  } catch {
    // localstorage fallback
  }
}

export function getLocalWatchlist() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.WATCHLIST);
    return raw ? JSON.parse(raw) : ["m-693134", "tv-94997"];
  } catch {
    return ["m-693134", "tv-94997"];
  }
}

export function toggleLocalWatchlist(mediaId) {
  try {
    let list = getLocalWatchlist();
    if (list.includes(mediaId)) {
      list = list.filter((id) => id !== mediaId);
      fetch(`${API_BASE}/watchlist/${mediaId}`, { method: "DELETE" }).catch(() => {});
    } else {
      list.push(mediaId);
      fetch(`${API_BASE}/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId })
      }).catch(() => {});
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.WATCHLIST, JSON.stringify(list));
    return list;
  } catch {
    return [];
  }
}
