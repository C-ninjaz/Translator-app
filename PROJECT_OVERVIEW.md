# Project Overview

This React + Vite application provides two simple tools in a clean, modern UI:

- Translate English text into several target languages using a RapidAPI-powered endpoint (default host: `free-google-translator.p.rapidapi.com`).
- Generate random strings with configurable length and character sets.

## Key features

- Client-side routing with a top navbar for quick navigation
- Modern Tailwind design with dark mode toggle
- Reusable UI components (cards, buttons, alerts, spinner)

## Tech stack

- React 18, Vite, Tailwind CSS (+ `@tailwindcss/forms`), React Router

## Quick start (Windows cmd)

```cmd
npm install
copy .env.example .env
# Edit .env and set VITE_RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY
npm run dev
```

Open the printed URL and use the navbar to access the Translator and Random String tools.
