import { useEffect, useState } from 'react'

function setHtmlDark(dark) {
  const root = document.documentElement
  if (dark) root.classList.add('dark')
  else root.classList.remove('dark')
}

export default function ThemeToggle({ className = '' }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Initialize from localStorage or system preference
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored ? stored === 'dark' : prefersDark
    setIsDark(dark)
    setHtmlDark(dark)
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    setHtmlDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition ${className}`}
    >
      {isDark ? (
        // Sun icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          <path d="M12 2.25a.75.75 0 0 1 .75.75V5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Zm0 15a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Zm9-6a.75.75 0 0 1-.75.75H18a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75Zm-15 0A.75.75 0 0 1 6.75 12H4.5a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6.75 12Zm11.72 6.72a.75.75 0 0 1-1.06 0l-1.59-1.59a.75.75 0 1 1 1.06-1.06l1.59 1.59a.75.75 0 0 1 0 1.06Zm-8.59-8.59a.75.75 0 1 1-1.06-1.06L7.28 6.47a.75.75 0 0 1 1.06 1.06L9.88 9.12Zm8.59-6.12a.75.75 0 0 1 0 1.06l-1.59 1.59A.75.75 0 1 1 13.35 5l1.59-1.59a.75.75 0 0 1 1.06 0ZM9.88 15.88a.75.75 0 0 1 0 1.06L8.29 18.53a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0Z" />
        </svg>
      ) : (
        // Moon icon
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M21.752 15.002A9.718 9.718 0 0 1 12 21.75 9.75 9.75 0 0 1 8.998 2.248a.75.75 0 0 1 .832 1.18A8.25 8.25 0 1 0 20.57 14.17a.75.75 0 0 1 1.182.832Z" />
        </svg>
      )}
    </button>
  )
}
