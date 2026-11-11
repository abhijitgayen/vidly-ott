/**
 * IndexedDB Storage Service for Vidly OTT Platform
 * Stores user Watchlist and Playback History offline in the browser.
 */

const DB_NAME = "vidly_ott_db";
const DB_VERSION = 1;
const STORES = {
  HISTORY: "history",
  WATCHLIST: "watchlist"
};

const DEFAULT_HISTORY = [
  {
    id: "m-1010581",
    mediaId: "m-1010581",
    type: "movie",
    mediaType: "movie",
    title: "My Fault (Culpa mía)",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    progressPercent: 68,
    currentTime: 4773,
    duration: 7020,
    updatedAt: Date.now() - 3600000
  },
  {
    id: "tv-66732",
    mediaId: "tv-66732",
    type: "tv",
    mediaType: "tv",
    title: "Stranger Things",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    progressPercent: 42,
    currentTime: 1210,
    duration: 2880,
    season: 1,
    episode: 2,
    updatedAt: Date.now() - 7200000
  }
];

const DEFAULT_WATCHLIST = ["m-693134", "tv-94997"];

function isIndexedDBSupported() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

export function openDb() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      return reject(new Error("IndexedDB is not supported"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.HISTORY)) {
        const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: "mediaId" });
        historyStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.WATCHLIST)) {
        db.createObjectStore(STORES.WATCHLIST, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function getAllHistory() {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.HISTORY, "readonly");
      const store = tx.objectStore(STORES.HISTORY);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        if (results.length === 0) {
          // Initialize with default items into IndexedDB
          DEFAULT_HISTORY.forEach((item) => putHistoryItem(item).catch(() => {}));
          resolve(DEFAULT_HISTORY);
        } else {
          // Sort most recent first
          results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(results);
        }
      };
      request.onerror = () => resolve(DEFAULT_HISTORY);
    });
  } catch {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem("vidly_ott_history");
      return raw ? JSON.parse(raw) : DEFAULT_HISTORY;
    } catch {
      return DEFAULT_HISTORY;
    }
  }
}

export async function putHistoryItem(item) {
  const normalizedItem = {
    ...item,
    mediaId: item.mediaId || item.id,
    updatedAt: Date.now()
  };

  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.HISTORY, "readwrite");
      const store = tx.objectStore(STORES.HISTORY);
      const request = store.put(normalizedItem);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
  }

  // Also maintain localStorage as fallback sync
  try {
    const raw = localStorage.getItem("vidly_ott_history");
    const current = raw ? JSON.parse(raw) : [];
    const filtered = current.filter((h) => h.mediaId !== normalizedItem.mediaId);
    filtered.unshift(normalizedItem);
    localStorage.setItem("vidly_ott_history", JSON.stringify(filtered.slice(0, 25)));
  } catch {}

  return normalizedItem;
}

export async function getAllWatchlist() {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.WATCHLIST, "readonly");
      const store = tx.objectStore(STORES.WATCHLIST);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        if (results.length === 0) {
          DEFAULT_WATCHLIST.forEach((id) => addToWatchlist(id).catch(() => {}));
          resolve(DEFAULT_WATCHLIST);
        } else {
          resolve(results.map((r) => r.id));
        }
      };
      request.onerror = () => resolve(DEFAULT_WATCHLIST);
    });
  } catch {
    try {
      const raw = localStorage.getItem("vidly_ott_watchlist");
      return raw ? JSON.parse(raw) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  }
}

export async function addToWatchlist(id) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.WATCHLIST, "readwrite");
      const store = tx.objectStore(STORES.WATCHLIST);
      const request = store.put({ id, addedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {}

  try {
    const raw = localStorage.getItem("vidly_ott_watchlist");
    const current = raw ? JSON.parse(raw) : [];
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem("vidly_ott_watchlist", JSON.stringify(current));
    }
  } catch {}
}

export async function removeFromWatchlist(id) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.WATCHLIST, "readwrite");
      const store = tx.objectStore(STORES.WATCHLIST);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {}

  try {
    const raw = localStorage.getItem("vidly_ott_watchlist");
    const current = raw ? JSON.parse(raw) : [];
    const filtered = current.filter((item) => item !== id);
    localStorage.setItem("vidly_ott_watchlist", JSON.stringify(filtered));
  } catch {}
}
