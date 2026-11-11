import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

const app = createApp();
let server;
let baseUrl = "";

test("Vidly OTT Backend API", async (t) => {
  await t.test("setup test server", () => {
    return new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  await t.test("GET /api/health returns ok status", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "ok");
    assert.ok(data.platform.includes("Vidly OTT"));
  });

  await t.test("GET /api/catalog returns catalog items and genres", async () => {
    const res = await fetch(`${baseUrl}/api/catalog`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.total > 0);
    assert.ok(Array.isArray(data.items));
    assert.ok(data.genres.includes("Action"));
  });

  await t.test("GET /api/catalog?type=movie filters correctly", async () => {
    const res = await fetch(`${baseUrl}/api/catalog?type=movie`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.items.length > 0);
    assert.ok(data.items.every((i) => i.type === "movie"));
  });

  await t.test("GET /api/trending returns hero carousel and structured sections", async () => {
    const res = await fetch(`${baseUrl}/api/trending`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.hero.length > 0);
    assert.ok(data.sections.length >= 4);
    assert.ok(data.sections.some((s) => s.id === "top-10"));
  });

  await t.test("GET /api/search?q=stranger finds matching series", async () => {
    const res = await fetch(`${baseUrl}/api/search?q=stranger`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.results.length >= 1);
    assert.equal(data.results[0].title, "Stranger Things");
  });

  await t.test("GET /api/media/:type/:id returns media details", async () => {
    const res = await fetch(`${baseUrl}/api/media/movie/m-1726`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.title, "Iron Man");
    assert.equal(data.tmdbId, 1726);
  });

  await t.test("GET /api/vidly/embed-url generates valid Vidly embed routes", async () => {
    // Movie route
    const movieRes = await fetch(`${baseUrl}/api/vidly/embed-url?type=movie&tmdbId=1010581&theme=aurora&color=0072d2`);
    const movieData = await movieRes.json();
    assert.equal(movieData.embedUrl, "https://vidly.pro/embed/movie/1010581?theme=aurora&color=0072d2&autoplay=1");

    // TV route
    const tvRes = await fetch(`${baseUrl}/api/vidly/embed-url?type=tv&tmdbId=66732&season=2&episode=3`);
    const tvData = await tvRes.json();
    assert.equal(tvData.embedUrl, "https://vidly.pro/embed/tv/66732/2/3?autoplay=1");

    // Anime route
    const animeRes = await fetch(`${baseUrl}/api/vidly/embed-url?type=anime&malId=52991&episode=1&audio=sub`);
    const animeData = await animeRes.json();
    assert.equal(animeData.embedUrl, "https://vidly.pro/embed/anime/52991/1/sub?autoplay=1");
  });

  await t.test("POST & GET /api/history handles Vidly SYNC_HISTORY payload", async () => {
    const syncPayload = {
      mediaId: "m-550",
      mediaType: "movie",
      title: "Fight Club",
      currentTime: 1800,
      duration: 3600
    };

    const postRes = await fetch(`${baseUrl}/api/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(syncPayload)
    });
    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.equal(postData.historyItem.progressPercent, 50);

    const getRes = await fetch(`${baseUrl}/api/history`);
    const getData = await getRes.json();
    const item = getData.history.find((h) => h.mediaId === "m-550");
    assert.ok(item);
    assert.equal(item.progressPercent, 50);
  });

  await t.test("POST, GET & DELETE /api/watchlist manages watchlist", async () => {
    const postRes = await fetch(`${baseUrl}/api/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaId: "m-157336" })
    });
    assert.equal(postRes.status, 200);

    const getRes = await fetch(`${baseUrl}/api/watchlist`);
    const getData = await getRes.json();
    assert.ok(getData.ids.includes("m-157336"));

    const delRes = await fetch(`${baseUrl}/api/watchlist/m-157336`, {
      method: "DELETE"
    });
    assert.equal(delRes.status, 200);
  });

  await t.test("teardown test server", () => {
    return new Promise((resolve) => {
      server.close(() => resolve());
    });
  });
});
