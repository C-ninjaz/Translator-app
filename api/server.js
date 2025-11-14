import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Startup warning if RAPIDAPI_KEY missing in environment (common on new deploys)
const _startupEnv = getEnv();
if (!_startupEnv.apiKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[server] RAPIDAPI_KEY is not set. Set RAPIDAPI_KEY in your Render/host environment variables to enable translation proxy."
  );
}

// In-memory cache and sliding-window rate limiter (single-instance only)
const RATE_LIMIT_WINDOW_MS =
  Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 60; // requests per window per IP
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS) || 60 * 60 * 1000; // 1 hour
const SERVER_FETCH_TIMEOUT_MS =
  Number(process.env.SERVER_FETCH_TIMEOUT_MS) || 15000;

const rateMap = new Map(); // ip -> [timestamp, timestamp, ...]
const cacheMap = new Map(); // key -> { value, expiresAt }

function recordRequestAndCheck(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const arr = rateMap.get(ip) || [];
  // keep only timestamps inside the sliding window
  const filtered = arr.filter((ts) => ts > windowStart);
  filtered.push(now);
  rateMap.set(ip, filtered);
  const remaining = Math.max(0, RATE_LIMIT_MAX - filtered.length);
  const resetAt =
    filtered.length === 0
      ? now + RATE_LIMIT_WINDOW_MS
      : (filtered[0] || now) + RATE_LIMIT_WINDOW_MS;
  return {
    allowed: filtered.length <= RATE_LIMIT_MAX,
    remaining,
    limit: RATE_LIMIT_MAX,
    resetAt,
  };
}

function getCache(key) {
  const e = cacheMap.get(key);
  if (!e) return null;
  if (e.expiresAt <= Date.now()) {
    cacheMap.delete(key);
    return null;
  }
  return e.value;
}

function setCache(key, value, ttl = CACHE_TTL_MS) {
  cacheMap.set(key, { value, expiresAt: Date.now() + ttl });
}

// Periodic cleanup of expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of cacheMap.entries()) {
    if (v.expiresAt <= now) cacheMap.delete(k);
  }
  // Optionally prune old rateMap entries to keep memory in check
  for (const [ip, arr] of rateMap.entries()) {
    const filtered = arr.filter((ts) => ts > now - RATE_LIMIT_WINDOW_MS);
    if (filtered.length === 0) rateMap.delete(ip);
    else rateMap.set(ip, filtered);
  }
}, Math.max(1000, Math.min(60000, RATE_LIMIT_WINDOW_MS)));

function getEnv() {
  return {
    apiKey: process.env.RAPIDAPI_KEY,
    apiHost: process.env.RAPIDAPI_HOST || "google-translator9.p.rapidapi.com",
    translatePath: process.env.RAPIDAPI_TRANSLATE_PATH || "/v2",
    detectPath: process.env.RAPIDAPI_DETECT_PATH || "/v2/detect",
    languagesPath: process.env.RAPIDAPI_LANGUAGES_PATH || "/v2/languages",
  };
}

function makeHeaders(apiKey, apiHost) {
  return {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": apiHost,
  };
}

async function proxyPost(
  url,
  headers,
  body,
  timeout = SERVER_FETCH_TIMEOUT_MS
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(id);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

app.post("/api/translate", async (req, res) => {
  try {
    const { text, target, source = "en" } = req.body || {};
    if (!text || !target)
      return res.status(400).json({ error: "Missing required: text,target" });

    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const rl = recordRequestAndCheck(ip);
    res.setHeader("X-RateLimit-Limit", String(rl.limit));
    res.setHeader("X-RateLimit-Remaining", String(rl.remaining));
    res.setHeader("X-RateLimit-Reset", new Date(rl.resetAt).toISOString());
    if (!rl.allowed)
      return res.status(429).json({ error: "Rate limit exceeded" });

    // Simple cache key
    const cacheKey = `translate:${source}:${target}:${text}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json({ translated: cached, cached: true });
    }
    res.setHeader("X-Cache", "MISS");

    const env = getEnv();
    if (!env.apiKey)
      return res.status(503).json({
        error: "Server misconfiguration: RAPIDAPI_KEY not set",
        help: "Set RAPIDAPI_KEY in your Render (or host) environment variables and redeploy",
      });

    const url = `https://${env.apiHost}${env.translatePath}`;
    const { ok, status, data } = await proxyPost(
      url,
      makeHeaders(env.apiKey, env.apiHost),
      { q: text, target, source, format: "text" }
    );
    if (!ok)
      return res
        .status(Math.max(500, status))
        .json({ error: "Upstream error" });

    const translated =
      data?.data?.translations?.[0]?.translatedText ||
      data?.data?.translated_text ||
      data?.translated_text ||
      data?.translation ||
      null;
    if (!translated)
      return res.status(502).json({ error: "Unexpected upstream shape" });

    try {
      setCache(cacheKey, translated);
    } catch {}

    return res.json({ translated });
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "Upstream request timed out"
        : err?.message || "Server error";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/detect", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing required: text" });

    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const rl = recordRequestAndCheck(ip);
    res.setHeader("X-RateLimit-Limit", String(rl.limit));
    res.setHeader("X-RateLimit-Remaining", String(rl.remaining));
    res.setHeader("X-RateLimit-Reset", new Date(rl.resetAt).toISOString());
    if (!rl.allowed)
      return res.status(429).json({ error: "Rate limit exceeded" });

    const env = getEnv();
    if (!env.apiKey)
      return res.status(503).json({
        error: "Server misconfiguration: RAPIDAPI_KEY not set",
        help: "Set RAPIDAPI_KEY in your Render (or host) environment variables and redeploy",
      });

    const url = `https://${env.apiHost}${env.detectPath}`;
    const { ok, status, data } = await proxyPost(
      url,
      makeHeaders(env.apiKey, env.apiHost),
      { q: text }
    );
    if (!ok)
      return res
        .status(Math.max(500, status))
        .json({ error: "Upstream error" });

    const first =
      data?.data?.detections?.[0]?.[0] || data?.data?.detections?.[0];
    return res.json({
      language: first?.language || null,
      confidence: first?.confidence || null,
    });
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "Upstream request timed out"
        : err?.message || "Server error";
    return res.status(500).json({ error: message });
  }
});

app.get("/api/languages", async (req, res) => {
  try {
    const target = req.query.target || "en";
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const rl = recordRequestAndCheck(ip);
    res.setHeader("X-RateLimit-Limit", String(rl.limit));
    res.setHeader("X-RateLimit-Remaining", String(rl.remaining));
    res.setHeader("X-RateLimit-Reset", new Date(rl.resetAt).toISOString());
    if (!rl.allowed)
      return res.status(429).json({ error: "Rate limit exceeded" });

    const cacheKey = `languages:${target}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json({ languages: cached, cached: true });
    }
    res.setHeader("X-Cache", "MISS");

    const env = getEnv();
    if (!env.apiKey)
      return res.status(503).json({
        error: "Server misconfiguration: RAPIDAPI_KEY not set",
        help: "Set RAPIDAPI_KEY in your Render (or host) environment variables and redeploy",
      });

    const url = new URL(`https://${env.apiHost}${env.languagesPath}`);
    url.searchParams.set("target", target);

    const r = await fetch(url.toString(), {
      method: "GET",
      headers: makeHeaders(env.apiKey, env.apiHost),
      signal: undefined,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok)
      return res
        .status(Math.max(500, r.status))
        .json({ error: "Upstream error" });

    const languages = data?.data?.languages || [];
    try {
      setCache(cacheKey, languages);
    } catch {}
    return res.json({ languages });
  } catch (err) {
    const message =
      err?.name === "AbortError"
        ? "Upstream request timed out"
        : err?.message || "Server error";
    return res.status(500).json({ error: message });
  }
});

// Health endpoint
app.get("/api/health", (req, res) => {
  let version = "unknown";
  try {
    const pj = fs.readFileSync(
      path.join(__dirname, "..", "package.json"),
      "utf8"
    );
    version = JSON.parse(pj).version || version;
  } catch {}
  return res.json({
    status: "ok",
    uptime: process.uptime(),
    version,
    cacheItems: cacheMap.size,
    rateMapEntries: rateMap.size,
    rateLimit: { windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX },
  });
});

// Serve static files from dist
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
