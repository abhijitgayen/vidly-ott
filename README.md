# Vidly Hotstar OTT Platform

A full-stack, Disney+ Hotstar inspired OTT streaming web platform powered by the **[Vidly.pro API](https://vidly.pro/#api)**. Built with a separate Express backend and a React/Vite/Tailwind CSS frontend.

---

## 📸 UI Showcase & Screenshots

### 1. Hotstar Homepage & Hero Billboard
Dynamic hero banner with synopsis, metadata badges (HD, 4K, Dolby 5.1), and Top 10 numbered ranking carousels.
![Hotstar Homepage](screenshots/01-hotstar-homepage.png)

---

### 2. Media Detail & Episode Picker
Modal view with backdrop artwork, rating, genre tags, quick actions (Add to Watchlist, Play), and season/episode selector rails for TV shows and anime.
![Media Details Modal](screenshots/02-media-detail-modal.png)

---

### 3. Integrated Vidly.pro Embed Player
Embedded Vidly player iframe supporting custom theme options (`theme=hotstar`, `color=00ed82`, `autoplay`), start timestamp offsets, and live postMessage sync.
![Vidly Embed Player](screenshots/03-vidly-pro-player.png)

---

### 4. Live Search & Filter Overlay
Real-time instant search with Hotstar category pills (Movies, Shows, Anime, Action, Sci-Fi) and responsive card grid.
![Search Overlay](screenshots/04-search-overlay.png)

---

### 5. My Space (Watchlist & Vidly Playback History)
Dedicated profile hub tracking user watchlists and synchronized Vidly playback timestamps with percent progress bars.
![My Space](screenshots/05-my-space-watchlist.png)

---

## 🌟 Key Features

1. **Disney+ Hotstar OTT Aesthetic**:
   - Signature midnight palette (`#0c111b`, `#141b29`, `#00ed82`, `#0078f2`).
   - Collapsible left sidebar navigation (Home, TV, Movies, Anime, My Space, Search).
   - Top 10 numbered ranking badges and horizontal scrolling rails.
   - Glassmorphic modal overlays and responsive card zoom animations.

2. **Vidly.pro API Integration**:
   - **Movies**: `https://vidly.pro/embed/movie/{tmdb_id}`
   - **TV Shows**: `https://vidly.pro/embed/tv/{tmdb_id}/{season}/{episode}`
   - **Anime**: `https://vidly.pro/embed/anime/{id}/{ep}/{audio}` (sub/dub selector)
   - Custom parameters: `theme=hotstar`, `color=00ed82`, `autoplay=true`, `startAt={seconds}`
   - **Real-time Synchronization**: Listens for window `message` events (`SYNC_HISTORY` and `VIDLY_PLAYER_EVENT`) to automatically record current watch progress into backend and localStorage.

3. **Separate Backend Architecture**:
   - Express server (`server/`) with endpoints for catalog listing, trending rails, search filtering, media details, watchlist mutations, and playback history.
   - 100% test coverage using Node.js native test runner (`server/test/api.test.js`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
# Root concurrent scripts
npm install

# Backend dependencies
npm --prefix server install

# Frontend dependencies
npm --prefix client install
```

### 2. Run Both Backend and Frontend in Development Mode
```bash
npm run dev
```
- **Backend API**: `http://localhost:5001`
- **Frontend App**: `http://localhost:5173`

### 3. Run Automated Tests
```bash
npm test
# Or: npm --prefix server test
```

### 4. Build Frontend for Production
```bash
npm run build
```

---

## 📡 API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/catalog` | Filterable catalog by `type` (movie, tv, anime) and `genre` |
| `GET` | `/api/trending` | Structured sections: Hero item, Top 10 ranking, and category rows |
| `GET` | `/api/search?q=:query` | Live search by title, actor, or genre |
| `GET` | `/api/media/:type/:id` | Detailed media item with episode lists and metadata |
| `GET` | `/api/vidly/embed-url` | Constructs proper Vidly.pro embed route with parameters |
| `GET / POST` | `/api/history` | Retrieves and synchronizes playback progress from Vidly player |
| `GET / POST / DELETE` | `/api/watchlist` | User watchlist management |

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React icons
- **Backend**: Express.js, CORS, Morgan, Node.js native test runner
- **Player API**: [Vidly.pro](https://vidly.pro/#api)
