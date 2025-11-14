// Google Translator 9 (RapidAPI) integration
// Endpoints:
// - POST /v2             -> translate
// - POST /v2/detect      -> language detection
// - GET  /v2/languages   -> supported languages

const DEFAULT_HOST = "google-translator9.p.rapidapi.com";
const DEFAULT_TRANSLATE_PATH = "/v2";
const DEFAULT_DETECT_PATH = "/v2/detect";
const DEFAULT_LANGUAGES_PATH = "/v2/languages";

// Use proxy when in production or when explicitly requested via VITE_USE_PROXY
const USE_PROXY =
  import.meta.env.MODE === "production" ||
  import.meta.env.VITE_USE_PROXY === "true";
const PROXY_BASE = import.meta.env.VITE_PROXY_BASE || "/api";

// Timeout for fetch calls (ms). Configurable via VITE_FETCH_TIMEOUT_MS
const FETCH_TIMEOUT_MS = Number(import.meta.env.VITE_FETCH_TIMEOUT_MS) || 15000;

// Optionally allow falling back to direct RapidAPI from the client
// when the proxy fails and a client key is present. Disabled by default.
const ALLOW_DIRECT_FALLBACK =
  import.meta.env.VITE_ALLOW_DIRECT_FALLBACK === "true";

function getHost() {
  return import.meta.env.VITE_RAPIDAPI_HOST || DEFAULT_HOST;
}

function getPaths() {
  return {
    translate:
      import.meta.env.VITE_RAPIDAPI_TRANSLATE_PATH || DEFAULT_TRANSLATE_PATH,
    detect: import.meta.env.VITE_RAPIDAPI_DETECT_PATH || DEFAULT_DETECT_PATH,
    languages:
      import.meta.env.VITE_RAPIDAPI_LANGUAGES_PATH || DEFAULT_LANGUAGES_PATH,
  };
}

function getHeaders(apiHost) {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  if (!apiKey) {
    // If client is using proxy (recommended in production), the client key
    // is not required. Only throw when attempting direct RapidAPI calls.
    if (USE_PROXY) {
      return { "Content-Type": "application/json" };
    }
    throw new Error(
      "RapidAPI key is not set. Define VITE_RAPIDAPI_KEY in your .env file."
    );
  }
  return {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": apiHost,
  };
}

// Helper fetch with timeout using AbortController
async function fetchWithTimeout(
  resource,
  options = {},
  timeout = FETCH_TIMEOUT_MS
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function translateText({ text, target, source = "en" }) {
  if (!text || !target) {
    const e = new Error("Missing required parameters: text and target");
    e.status = 400;
    throw e;
  }

  const tryDirectApi = async () => {
    const apiHost = getHost();
    const { translate } = getPaths();
    const url = `https://${apiHost}${translate}`;
    const headers = getHeaders(apiHost);
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        q: text,
        target,
        ...(source ? { source } : {}),
        format: "text",
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      const err = new Error(`Translation API error (${res.status}): ${t}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json().catch(() => ({}));
    const translated =
      data?.data?.translations?.[0]?.translatedText ||
      data?.data?.translated_text ||
      data?.translated_text ||
      data?.translation ||
      data?.result ||
      data?.text ||
      data?.output;
    if (!translated || typeof translated !== "string") {
      const err = new Error("Unexpected API response format");
      err.status = 502;
      err.details = data;
      throw err;
    }
    return translated;
  };

  if (USE_PROXY) {
    const url = `${PROXY_BASE}/translate`;
    try {
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target, source }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        const err = new Error(`Translate proxy error (${res.status}): ${t}`);
        err.status = res.status;
        throw err;
      }
      const data = await res.json().catch(() => ({}));
      if (!data?.translated) {
        const e = new Error("Unexpected proxy response");
        e.status = 502;
        e.details = data;
        throw e;
      }
      return data.translated;
    } catch (proxyErr) {
      // Optionally attempt fallback to direct API when explicitly allowed
      if (ALLOW_DIRECT_FALLBACK && import.meta.env.VITE_RAPIDAPI_KEY) {
        // eslint-disable-next-line no-console
        console.warn(
          "Proxy failed, falling back to direct RapidAPI (client key)",
          proxyErr?.message || proxyErr
        );
        return tryDirectApi();
      }
      throw proxyErr;
    }
  }

  return tryDirectApi();
}

export async function detectLanguage(text) {
  if (!text) return null;

  const tryDirectDetect = async () => {
    const apiHost = getHost();
    const { detect } = getPaths();
    const url = `https://${apiHost}${detect}`;
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: getHeaders(apiHost),
      body: JSON.stringify({ q: text }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const first =
      data?.data?.detections?.[0]?.[0] || data?.data?.detections?.[0];
    return first?.language || null;
  };

  if (USE_PROXY) {
    const url = `${PROXY_BASE}/detect`;
    try {
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({}));
      return data?.language || null;
    } catch (err) {
      if (ALLOW_DIRECT_FALLBACK && import.meta.env.VITE_RAPIDAPI_KEY)
        return tryDirectDetect();
      return null;
    }
  }

  return tryDirectDetect();
}

export async function getSupportedLanguages(target = "en") {
  if (USE_PROXY) {
    const url = `/api/languages?target=${encodeURIComponent(target)}`;
    const res = await fetchWithTimeout(url, { method: "GET" });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      const err = new Error(`Languages proxy error (${res.status}): ${t}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json().catch(() => ({}));
    return data?.languages || [];
  }

  const apiHost = getHost();
  const { languages } = getPaths();
  const url = new URL(`https://${apiHost}${languages}`);
  if (target) url.searchParams.set("target", target);

  const res = await fetchWithTimeout(url.toString(), {
    method: "GET",
    headers: getHeaders(apiHost),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    const err = new Error(`Languages API error (${res.status}): ${t}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  return data?.data?.languages || [];
}
