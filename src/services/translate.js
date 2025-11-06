// Google Translator 9 (RapidAPI) integration
// Endpoints:
// - POST /v2             -> translate
// - POST /v2/detect      -> language detection
// - GET  /v2/languages   -> supported languages

const DEFAULT_HOST = "google-translator9.p.rapidapi.com";
const DEFAULT_TRANSLATE_PATH = "/v2";
const DEFAULT_DETECT_PATH = "/v2/detect";
const DEFAULT_LANGUAGES_PATH = "/v2/languages";

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

export async function translateText({ text, target, source = "en" }) {
  if (!text || !target) {
    throw new Error("Missing required parameters: text and target");
  }
  const apiHost = getHost();
  const { translate } = getPaths();
  const url = `https://${apiHost}${translate}`;

  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(apiHost),
    body: JSON.stringify({
      q: text,
      target,
      ...(source ? { source } : {}),
      format: "text",
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Translation API error (${res.status}): ${t}`);
  }

  const data = await res.json();
  // Google-style response: { data: { translations: [ { translatedText: "..." } ] } }
  const translated =
    data?.data?.translations?.[0]?.translatedText ||
    data?.data?.translated_text ||
    data?.translated_text ||
    data?.translation ||
    data?.result ||
    data?.text ||
    data?.output;

  if (!translated || typeof translated !== "string") {
    throw new Error("Unexpected API response format: " + JSON.stringify(data));
  }
  return translated;
}

export async function detectLanguage(text) {
  if (!text) return null;
  const apiHost = getHost();
  const { detect } = getPaths();
  const url = `https://${apiHost}${detect}`;

  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(apiHost),
    body: JSON.stringify({ q: text }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  // Google-style: { data: { detections: [[ { language, confidence } ]] } }
  const first = data?.data?.detections?.[0]?.[0] || data?.data?.detections?.[0];
  return first?.language || null;
}

export async function getSupportedLanguages(target = "en") {
  const apiHost = getHost();
  const { languages } = getPaths();
  const url = new URL(`https://${apiHost}${languages}`);
  if (target) url.searchParams.set("target", target);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(apiHost),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Languages API error (${res.status}): ${t}`);
  }
  const data = await res.json();
  // Google-style: { data: { languages: [ { language: 'es', name: 'Spanish' }, ... ] } }
  return data?.data?.languages || [];
}
