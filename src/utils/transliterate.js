// Simple transliteration helpers. Currently supports Cyrillic (ru, uk, bg, sr).
// Returns a transliterated string or null when unsupported or not needed.

const CYRILLIC_MAP = {
  А: "A",
  а: "a",
  Б: "B",
  б: "b",
  В: "V",
  в: "v",
  Г: "G",
  г: "g",
  Д: "D",
  д: "d",
  Е: "E",
  е: "e",
  Ё: "Yo",
  ё: "yo",
  Ж: "Zh",
  ж: "zh",
  З: "Z",
  з: "z",
  И: "I",
  и: "i",
  Й: "Y",
  й: "y",
  К: "K",
  к: "k",
  Л: "L",
  л: "l",
  М: "M",
  м: "m",
  Н: "N",
  н: "n",
  О: "O",
  о: "o",
  П: "P",
  п: "p",
  Р: "R",
  р: "r",
  С: "S",
  с: "s",
  Т: "T",
  т: "t",
  У: "U",
  у: "u",
  Ф: "F",
  ф: "f",
  Х: "Kh",
  х: "kh",
  Ц: "Ts",
  ц: "ts",
  Ч: "Ch",
  ч: "ch",
  Ш: "Sh",
  ш: "sh",
  Щ: "Shch",
  щ: "shch",
  Ы: "Y",
  ы: "y",
  Ъ: "",
  ъ: "",
  Ь: "'",
  ь: "'",
  Э: "E",
  э: "e",
  Ю: "Yu",
  ю: "yu",
  Я: "Ya",
  я: "ya",
};

const CYRILLIC_LANGS = new Set(["ru", "uk", "bg", "sr", "mk", "kk", "ky"]);

export function transliterate(text, lang) {
  if (!text || !lang) return null;
  // Normalize lang (e.g., zh-CN -> zh)
  const norm = lang.toLowerCase().split("-")[0];
  if (!CYRILLIC_LANGS.has(norm)) return null;
  let out = "";
  for (const ch of text) {
    out += CYRILLIC_MAP[ch] ?? ch;
  }
  return out;
}
