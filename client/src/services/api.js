/**
 * Frontend API Service
 * Operates purely client-side by default with instant responses from catalogData.js
 * and localStorage, while also optionally syncing with the Express backend if available.
 */

import { CATALOG as FALLBACK_CATALOG, GENRES as FALLBACK_GENRES } from "./catalogData.js";
import {
  getAllHistory,
  putHistoryItem,
  getAllWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from "./db.js";

const LOCAL_STORAGE_KEYS = {
  THEME_PREF: "vidly_ott_player_theme",
  COLOR_PREF: "vidly_ott_player_color"
};

/**
 * Builds local trending response instantly with no network delay
 */
function getLocalTrending() {
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

export async function fetchHealth() {
  return { status: "ready", storage: "IndexedDB", platform: "Vidly OTT Hotstar Edition" };
}

export async function fetchTrending() {
  // Return instant local data directly without any network blocking
  return getLocalTrending();
}

export async function fetchCatalog(filters = {}) {
  const { type, genre, q } = filters;
  let list = [...FALLBACK_CATALOG];
  if (type && type !== "all") list = list.filter((i) => i.type === type);
  if (genre && genre !== "All") list = list.filter((i) => i.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
  if (q) {
    const term = q.toLowerCase();
    list = list.filter((i) => i.title.toLowerCase().includes(term) || i.overview.toLowerCase().includes(term));
  }
  return { total: list.length, genres: FALLBACK_GENRES, items: list };
}

export async function searchMedia(query) {
  if (!query?.trim()) return [];
  const term = query.toLowerCase();
  return FALLBACK_CATALOG.filter((item) =>
    item.title.toLowerCase().includes(term) ||
    (item.originalTitle && item.originalTitle.toLowerCase().includes(term)) ||
    item.genres.some((g) => g.toLowerCase().includes(term)) ||
    (item.cast && item.cast.some((c) => c.toLowerCase().includes(term)))
  );
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

export async function getLocalWatchHistory() {
  return await getAllHistory();
}

export async function saveLocalWatchHistory(item) {
  return await putHistoryItem(item);
}

export async function getLocalWatchlist() {
  return await getAllWatchlist();
}

export async function toggleLocalWatchlist(mediaId) {
  const current = await getAllWatchlist();
  let updated = [];

  if (current.includes(mediaId)) {
    await removeFromWatchlist(mediaId);
    updated = current.filter((id) => id !== mediaId);
  } else {
    await addToWatchlist(mediaId);
    updated = [...current, mediaId];
  }

  return updated;
}
