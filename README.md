# Translator App (React + Vite + Tailwind)

Translate English text to many languages via RapidAPI and generate random strings, wrapped in a modern Tailwind UI with dark mode and client-side routing.

## ✨ Features

- Text Translator powered by RapidAPI (default host: `free-google-translator.p.rapidapi.com`)
- Random String Generator (length + character set controls)
- Client-side routing with `react-router-dom`
- Modern UI: Inter font, dark mode toggle, cards, buttons, and polished forms

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
- Optional overrides (defaults already work with the Free Google Translator API):
  - `VITE_RAPIDAPI_HOST=free-google-translator.p.rapidapi.com`
  - `VITE_RAPIDAPI_ENDPOINT_PATH=/external-api/free-google-translator`

3. Start the dev server

```cmd
npm run dev
```

Then open the URL printed in the terminal.

## 🔑 Translation API

The app builds a POST request like the provider’s cURL example:

- URL: `https://<HOST><PATH>?from=en&to=<TARGET>&query=<TEXT>`
- Headers: `Content-Type: application/json`, `X-RapidAPI-Key`, `X-RapidAPI-Host`
- Body: `{ "translate": "rapidapi" }`

You can change host/path via `.env` if you pick a different provider on RapidAPI.

## 🧪 Build & Preview

```cmd
npm run build
npm run preview
```

## 📝 Notes

- If you add/change `.env` while the dev server is running, restart it so Vite picks up new values.
- The Random String Generator uses `useState`, `useCallback`, and `useEffect` as required.
- Tailwind content paths are configured for Vite. Adjust `tailwind.config.js` if you move files.
