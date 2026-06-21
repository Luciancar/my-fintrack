import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

// Design tokens for each theme. Keep this as the single source of truth for color —
// any component that wants to support both modes should pull from `tokens` via useTheme(),
// not hardcode hex values the way the original components currently do.
const THEMES = {
  dark: {
    bg: '#030814',
    bgGradient: 'radial-gradient(ellipse at top, #0b1224 0%, #030814 60%)',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHover: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.08)',
    text: '#ffffff',
    textDim: 'rgba(255,255,255,0.5)',
    textFaint: 'rgba(255,255,255,0.35)',
    accent: '#4f46e5',
    accentSoft: 'rgba(99,102,241,0.4)',
    accentText: '#818cf8',
    danger: '#f87171',
    headerBg: 'rgba(3,8,20,0.85)',
    shadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  light: {
    bg: '#f1f3f9',
    bgGradient: 'radial-gradient(ellipse at top, #ffffff 0%, #eef0f7 60%)',
    surface: 'rgba(15,23,42,0.035)',
    surfaceHover: 'rgba(15,23,42,0.06)',
    border: 'rgba(15,23,42,0.09)',
    text: '#0f172a',
    textDim: 'rgba(15,23,42,0.55)',
    textFaint: 'rgba(15,23,42,0.4)',
    accent: '#4f46e5',
    accentSoft: 'rgba(79,70,229,0.14)',
    accentText: '#4338ca',
    danger: '#dc2626',
    headerBg: 'rgba(255,255,255,0.85)',
    shadow: '0 8px 32px rgba(15,23,42,0.12)',
  },
}

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

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode) } catch {}
  }, [mode])

  const toggle = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'))
  const tokens = useMemo(() => THEMES[mode], [mode])

  return (
    <ThemeContext.Provider value={{ mode, isDark: mode === 'dark', toggle, tokens }}>
      <div style={{ background: tokens.bgGradient, minHeight: '100vh', transition: 'background 0.3s ease' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
