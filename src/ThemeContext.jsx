import React, { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'fintrack-theme'
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') return saved
      return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  // This is the only thing the theme needs to do: flip an attribute on <html>.
  // All actual colors live in src/index.css as CSS variables (--text, --bg-card, etc),
  // already overridden for [data-theme='light']. No component needs per-theme JS logic.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    try { localStorage.setItem(STORAGE_KEY, mode) } catch {}
  }, [mode])

  const toggle = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
