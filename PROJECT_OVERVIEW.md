# Project Overview

This React + Vite application provides two simple tools in a clean, modern UI:

- Translate English text into several target languages using RapidAPI’s Google Translator 9 provider (default host: `google-translator9.p.rapidapi.com`).
- Generate random strings with configurable length and character sets.

## Key features

- Client-side routing with a top navbar for quick navigation
- Modern Tailwind design with dark mode toggle
- Reusable UI components (cards, buttons, alerts, spinner)
- Speak translated text via Web Speech API with automatic voice matching and an optional voice selector (when multiple voices exist)
- Transliteration for Cyrillic targets (e.g., Russian “Привет” → “Privet”)

## Tech stack

- React 18, Vite, Tailwind CSS (+ `@tailwindcss/forms`), React Router

## Quick start (Windows cmd)

```cmd
npm install
copy .env.example .env
# Edit .env and set VITE_RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY
npm run dev
```

Open the printed URL and use the navbar to access the Translator and Random String tools. For best TTS results (e.g., Arabic), ensure your OS/browser has a matching voice installed.

For a detailed technical deep-dive you can share in interviews, see `INTERVIEW_GUIDE.md`.
