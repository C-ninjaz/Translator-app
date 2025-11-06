// Speech synthesis utilities with robust voice matching.
// Exposes: ensureVoices(), hasVoice(lang), voicesFor(lang), speakText(text, lang, opts?)

let cachedVoices = [];
let voicesLoaded = false;
let waitingPromise = null;

function refreshCachedVoices() {
  const synth = window.speechSynthesis;
  if (!synth) return [];
  const list = synth.getVoices?.() || [];
  cachedVoices = list;
  voicesLoaded = list.length > 0;
  return cachedVoices;
}

export function ensureVoices(timeoutMs = 1500) {
  if (voicesLoaded && cachedVoices.length) return Promise.resolve(cachedVoices);
  refreshCachedVoices();
  if (voicesLoaded && cachedVoices.length) return Promise.resolve(cachedVoices);

  if (!waitingPromise) {
    waitingPromise = new Promise((resolve) => {
      const onVoices = () => {
        window.speechSynthesis?.removeEventListener("voiceschanged", onVoices);
        resolve(refreshCachedVoices());
      };
      window.speechSynthesis?.addEventListener("voiceschanged", onVoices, {
        once: true,
      });
      // Fallback: resolve after timeout even if event never fires
      setTimeout(() => resolve(refreshCachedVoices()), timeoutMs);
    }).finally(() => {
      waitingPromise = null;
    });
  }
  return waitingPromise;
}

function normalizeCode(lang) {
  if (!lang) return "";
  // eg: ar -> ar, ar-SA -> ar-sa
  return String(lang).toLowerCase();
}

function languageFamily(lang) {
  // ar-sa -> ar
  return normalizeCode(lang).split("-")[0];
}

export async function hasVoice(lang) {
  await ensureVoices();
  const fam = languageFamily(lang);
  if (!fam) return false;
  return cachedVoices.some((v) => v.lang?.toLowerCase().startsWith(fam));
}

export async function voicesFor(lang) {
  await ensureVoices();
  const fam = languageFamily(lang);
  if (!fam) return [];
  const list = cachedVoices.filter((v) =>
    v.lang?.toLowerCase().startsWith(fam)
  );
  // Stable sort: prefer localService
  return list.sort((a, b) => Number(b.localService) - Number(a.localService));
}

function pickVoice(lang) {
  const fam = languageFamily(lang);
  if (!fam) return null;
  const voices = cachedVoices.filter((v) =>
    v.lang?.toLowerCase().startsWith(fam)
  );
  if (!voices.length) return null;
  // Prefer localService voices, then default
  voices.sort((a, b) => Number(b.localService) - Number(a.localService));
  return voices[0];
}

export async function speakText(text, lang, opts = {}) {
  try {
    if (!text || !window.speechSynthesis) return false;
    await ensureVoices();
    const utterance = new SpeechSynthesisUtterance(text);

    let voice = null;
    if (opts.voiceName) {
      voice = cachedVoices.find((v) => v.name === opts.voiceName) || null;
    }
    if (!voice) {
      voice = pickVoice(lang);
    }
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else if (lang) {
      // Use provided tag even if no exact match; some engines still try
      utterance.lang = lang;
    }

    if (opts.rate) utterance.rate = opts.rate;
    if (opts.pitch) utterance.pitch = opts.pitch;
    if (opts.volume) utterance.volume = opts.volume;

    window.speechSynthesis.cancel(); // stop any pending utterances
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
