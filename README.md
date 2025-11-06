# Translator App (React + Vite + Tailwind)

Translate English text to many languages via RapidAPI and generate random strings, wrapped in a modern Tailwind UI with dark mode and client-side routing.

## ✨ Features

- Text Translator powered by RapidAPI (default host: `google-translator9.p.rapidapi.com`)
- Random String Generator (length + character set controls)
- Client-side routing with `react-router-dom`
- Modern UI: Inter font, dark mode toggle, cards, buttons, and polished forms
- Speak translated text via Web Speech API with automatic voice matching and optional voice selector
- Transliteration for Cyrillic targets (e.g., Russian “Привет” → “Privet”)

## 🧩 Tech stack

- React 18 + Vite
- Tailwind CSS (+ `@tailwindcss/forms`)
- React Router (v6)

## ⚙️ Prerequisites

- Node.js 18+ installed
- A RapidAPI account and key

## 🚀 Setup (Windows cmd)

1. Install dependencies

```cmd
npm install
```

2. Configure environment variables

- Copy `.env.example` to `.env`
- Set your key: `VITE_RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY`
- Optional overrides (defaults already work with the Google Translator 9 API):
  - `VITE_RAPIDAPI_HOST=google-translator9.p.rapidapi.com`
  - `VITE_RAPIDAPI_TRANSLATE_PATH=/v2`
  - `VITE_RAPIDAPI_DETECT_PATH=/v2/detect`
  - `VITE_RAPIDAPI_LANGUAGES_PATH=/v2/languages`

3. Start the dev server

```cmd
npm run dev
```

Then open the URL printed in the terminal.

## 🔑 Translation API

Provider: Google Translator 9 (RapidAPI)

- Translate: POST `https://<HOST>/v2`

  - Headers: `Content-Type: application/json`, `X-RapidAPI-Key`, `X-RapidAPI-Host`
  - Body: `{ q: <TEXT>, target: <TARGET>, source?: <SOURCE>, format: "text" }`
  - Response (example): `{ data: { translations: [ { translatedText: "..." } ] } }`

- Detect language: POST `https://<HOST>/v2/detect`

  - Body: `{ q: <TEXT> }`

- Languages: GET `https://<HOST>/v2/languages?target=en`
  - Response (example): `{ data: { languages: [ { language: "es", name: "Spanish" } ] } }`

You can change host/paths via `.env` if you pick a different provider.

## 🔊 Speech & transliteration

- Speech uses the browser’s Web Speech API. Voices are loaded asynchronously, and the app auto-selects the best match for the target language. If multiple voices are available (e.g., ar-SA, ar-EG), a small dropdown appears next to the output Speak button.
- If the Speak button is disabled for a language, install a matching voice in your OS and restart the browser (on Windows: Settings → Time & Language → Language & region → Add a language; ensure speech is installed).
- Transliteration currently supports Cyrillic languages and displays a romanized hint beneath the translated text when applicable.

## 📚 In-depth guide

Want a deeper explanation for interviews or documentation? See:

- INTERVIEW_GUIDE.md — architecture, data flow, API details, speech/transliteration, trade-offs, performance, and how to extend.

## 🧪 Build & Preview

```cmd
npm run build
npm run preview
```

## 📝 Notes

- If you add/change `.env` while the dev server is running, restart it so Vite picks up new values.
- The Random String Generator uses `useState`, `useCallback`, and `useEffect` as required.
- Tailwind content paths are configured for Vite. Adjust `tailwind.config.js` if you move files.
