import express from "express";
import cors from "cors";
import { CATALOG, GENRES } from "./catalog.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // In-memory user state
  const watchHistory = [
    {
      mediaId: "m-1010581",
      mediaType: "movie",
      title: "My Fault (Culpa mía)",
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
      backdrop: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1920&q=80",
      progressPercent: 68,
      currentTime: 4773,
      duration: 7020,
      season: null,
      episode: null,
      lastUpdated: new Date(Date.now() - 3600000).toISOString()
    },
    {
      mediaId: "tv-66732",
      mediaType: "tv",
      title: "Stranger Things",
      poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      progressPercent: 42,
      currentTime: 1210,
      duration: 2880,
      season: 1,
      episode: 2,
      lastUpdated: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const watchlist = new Set(["m-693134", "tv-94997"]);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      platform: "Vidly OTT Hotstar Edition",
      timestamp: new Date().toISOString()
    });
  });

  // Catalog listing with filters
  app.get("/api/catalog", (req, res) => {
    const { type, genre, q } = req.query;
    let list = [...CATALOG];

    if (type && type !== "all") {
      list = list.filter((item) => item.type === type);
    }

    if (genre && genre !== "All") {
      list = list.filter((item) =>
        item.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (q) {
      const term = q.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.overview.toLowerCase().includes(term) ||
          (item.cast && item.cast.some((c) => c.toLowerCase().includes(term)))
      );
    }

    res.json({
      total: list.length,
      genres: GENRES,
      items: list
    });
  });

  // Trending / Home page curation structure
  app.get("/api/trending", (req, res) => {
    const heroItems = CATALOG.filter((i) => i.featured).slice(0, 5);
    const top10 = [...CATALOG]
      .sort((a, b) => a.trendingRank - b.trendingRank)
      .slice(0, 10);
    const blockbusterMovies = CATALOG.filter((i) => i.type === "movie");
    const popularSeries = CATALOG.filter((i) => i.type === "tv");
    const animeHits = CATALOG.filter((i) => i.type === "anime");

    res.json({
      hero: heroItems,
      sections: [
        {
          id: "continue-watching",
          title: "Continue Watching",
          type: "continue-watching"
        },
        {
          id: "top-10",
          title: "Top 10 in India Today - Hindi & English",
          type: "ranked",
          items: top10
        },
        {
          id: "blockbusters",
          title: "Blockbuster Movies",
          type: "standard",
          items: blockbusterMovies
        },
        {
          id: "tv-series",
          title: "Popular TV Shows",
          type: "standard",
          items: popularSeries
        },
        {
          id: "anime",
          title: "Trending Anime",
          type: "standard",
          items: animeHits
        }
      ]
    });
  });

  // Search
  app.get("/api/search", (req, res) => {
    const query = (req.query.q || "").trim().toLowerCase();
    if (!query) {
      return res.json({ results: [] });
    }

    const matches = CATALOG.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const originalTitleMatch = item.originalTitle && item.originalTitle.toLowerCase().includes(query);
      const genreMatch = item.genres.some((g) => g.toLowerCase().includes(query));
      const castMatch = item.cast && item.cast.some((c) => c.toLowerCase().includes(query));
      return titleMatch || originalTitleMatch || genreMatch || castMatch;
    });

    res.json({
      query,
      results: matches
    });
  });

  // Media detail by ID
  app.get("/api/media/:type/:id", (req, res) => {
    const { id } = req.params;
    const media = CATALOG.find(
      (m) =>
        m.id === id ||
        m.tmdbId?.toString() === id ||
        m.malId?.toString() === id
    );

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json(media);
  });

  // Vidly Embed URL Generator
  app.get("/api/vidly/embed-url", (req, res) => {
    const {
      type,
      tmdbId,
      malId,
      id,
      season = 1,
      episode = 1,
      audio = "sub",
      theme,
      color,
      autoplay = 1,
      startAt = 0
    } = req.query;

    let path = "";
    const targetType = type || "movie";

    if (targetType === "movie") {
      const movieId = tmdbId || id;
      if (!movieId) {
        return res.status(400).json({ error: "Missing tmdbId for movie" });
      }
      path = `/movie/${movieId}`;
    } else if (targetType === "tv") {
      const tvId = tmdbId || id;
      if (!tvId) {
        return res.status(400).json({ error: "Missing tmdbId for tv" });
      }
      path = `/tv/${tvId}/${season}/${episode}`;
    } else if (targetType === "anime") {
      const animeId = malId || id;
      if (!animeId) {
        return res.status(400).json({ error: "Missing malId/id for anime" });
      }
      path = `/anime/${animeId}/${episode}/${audio}`;
    }

    const params = new URLSearchParams();
    if (theme) params.append("theme", theme);
    if (color) params.append("color", color);
    if (autoplay !== undefined) params.append("autoplay", autoplay.toString());
    if (startAt && Number(startAt) > 0) params.append("startAt", startAt.toString());

    const queryString = params.toString();
    const embedUrl = `https://vidly.pro/embed${path}${queryString ? `?${queryString}` : ""}`;

    res.json({
      embedUrl,
      path,
      query: Object.fromEntries(params)
    });
  });

  // Watch history endpoints (Sync with Vidly postMessage SYNC_HISTORY)
  app.get("/api/history", (req, res) => {
    res.json({
      history: watchHistory
    });
  });

  app.post("/api/history", (req, res) => {
    const { mediaId, mediaType, title, poster, currentTime, duration, season, episode } = req.body;

    if (!mediaId) {
      return res.status(400).json({ error: "mediaId is required" });
    }

    const progressPercent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

    const existingIndex = watchHistory.findIndex((h) => h.mediaId === mediaId);
    const historyItem = {
      mediaId,
      mediaType: mediaType || "movie",
      title: title || "Unknown Title",
      poster: poster || "",
      progressPercent,
      currentTime: Math.round(currentTime || 0),
      duration: Math.round(duration || 0),
      season: season || null,
      episode: episode || null,
      lastUpdated: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      watchHistory[existingIndex] = historyItem;
    } else {
      watchHistory.unshift(historyItem);
    }

    res.json({
      success: true,
      historyItem
    });
  });

  // Watchlist endpoints
  app.get("/api/watchlist", (req, res) => {
    const list = CATALOG.filter((item) => watchlist.has(item.id));
    res.json({
      watchlist: list,
      ids: Array.from(watchlist)
    });
  });

  app.post("/api/watchlist", (req, res) => {
    const { mediaId } = req.body;
    if (!mediaId) {
      return res.status(400).json({ error: "mediaId is required" });
    }
    watchlist.add(mediaId);
    res.json({
      success: true,
      watchlist: Array.from(watchlist)
    });
  });

  app.delete("/api/watchlist/:id", (req, res) => {
    const { id } = req.params;
    watchlist.delete(id);
    res.json({
      success: true,
      watchlist: Array.from(watchlist)
    });
  });

  return app;
}
