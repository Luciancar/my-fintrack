import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const STORAGE_KEY = 'fintrack-notifications'
const NotificationContext = createContext(null)
let idCounter = 0

export function NotificationProvider({ children }) {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
  })
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50))) } catch {}
  }, [history])

  // notify({ title, message, icon, type }) — call this anywhere a new event happens
  // (new transaction, savings milestone, spend alert, etc).
  const notify = useCallback((notification) => {
    const entry = { id: ++idCounter, time: Date.now(), read: false, ...notification }
    setHistory((prev) => [entry, ...prev].slice(0, 50))
    setToasts((prev) => [...prev, entry])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== entry.id)), 4500)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const markAllRead = useCallback(() => {
    setHistory((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearHistory = useCallback(() => setHistory([]), [])
  const unreadCount = history.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider value={{ history, toasts, notify, dismissToast, markAllRead, clearHistory, unreadCount }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>')
  return ctx
}

function ToastStack({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: 'var(--header-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start',
          boxShadow: 'var(--shadow)', animation: 'fintrack-toast-in 0.25s ease',
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon || '🔔'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.title}</div>
            {t.message && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{t.message}</div>}
          </div>
          <button onClick={() => onDismiss(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-label)', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>✕</button>
        </div>
      ))}
      <style>{`@keyframes fintrack-toast-in { from { opacity:0; transform: translateX(20px) } to { opacity:1; transform: translateX(0) } }`}</style>
    </div>
  )
}

export function NotificationBell() {
  const { history, unreadCount, markAllRead, clearHistory } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleOpen = () => {
    setOpen((v) => !v)
    if (!open) markAllRead()
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={handleOpen} style={{
        position: 'relative', width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)',
        border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8,
            background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320,
          background: 'var(--header-bg)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)',
          borderRadius: 14, zIndex: 200, boxShadow: 'var(--shadow)', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Thông báo</span>
            {history.length > 0 && (
              <button onClick={clearHistory} style={{ background: 'none', border: 'none', color: 'var(--text-label)', fontSize: 12, cursor: 'pointer' }}>Xóa hết</button>
            )}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {history.length === 0 ? (
              <div style={{ padding: '24px 14px', textAlign: 'center', color: 'var(--text-label)', fontSize: 13 }}>Chưa có thông báo nào</div>
            ) : history.map((n) => (
              <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon || '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
                  {n.message && <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 1 }}>{n.message}</div>}
                  <div style={{ fontSize: 10.5, color: 'var(--text-label)', marginTop: 3 }}>{relativeTime(n.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function relativeTime(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return `${Math.floor(diff / 86400)} ngày trước`
}
