import React, { useState, useEffect, useRef } from 'react'
import ParticleBackground from './ParticleBackground'

/* ── Floating orb decorations ── */
function Orb({ size, color, style }) {
  return (
    <div style={{
      position: 'absolute',
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}40 0%, ${color}00 70%)`,
      filter: 'blur(1px)',
      pointerEvents: 'none',
      ...style,
    }} />
  )
}

/* ── Animated input field ── */
function AnimInput({ label, icon, type = 'text', value, onChange, placeholder, required, autoFocus }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow]       = useState(false) // for password toggle
  const isPass = type === 'password'

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: focused ? '#818cf8' : 'rgba(148,163,184,0.7)',
        marginBottom: 7,
        transition: 'color 0.25s ease',
      }}>{label}</label>
      <div style={{
        position: 'relative',
        background: focused ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.09)'}`,
        borderRadius: 13,
        transition: 'all 0.25s ease',
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12), 0 4px 20px rgba(99,102,241,0.1)' : 'none',
      }}>
        <span style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 16, pointerEvents: 'none', opacity: focused ? 1 : 0.5,
          transition: 'opacity 0.2s',
        }}>{icon}</span>
        <input
          type={isPass && !show ? 'password' : 'text'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', background: 'none', border: 'none', outline: 'none',
            color: '#f1f5f9', fontSize: 14, fontFamily: 'Inter, sans-serif',
            padding: `12px 14px 12px ${isPass ? '42px' : '42px'}`,
            paddingRight: isPass ? 44 : 14,
          }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(v => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, opacity: 0.5, transition: 'opacity 0.2s',
              color: '#f1f5f9',
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '1'}
            onMouseOut={e => e.currentTarget.style.opacity = '0.5'}
          >{show ? '🙈' : '👁️'}</button>
        )}
      </div>
    </div>
  )
}

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [btnPress, setBtnPress] = useState(false)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'register' && password !== confirm) { setError('Mật khẩu xác nhận không khớp'); return }
    if (password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return }

    setLoading(true)
    if (mode === 'login') {
      const { error } = await onSignIn(email, password)
      if (error) setError(error.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng' : error.message)
    } else {
      const { error } = await onSignUp(email, password)
      if (error) setError(error.message)
      else setDone(true)
    }
    setLoading(false)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <ParticleBackground />
      <div style={{ ...cardBase, textAlign: 'center', animation: 'fadeInScale 0.5s cubic-bezier(0.34,1.3,0.64,1) both' }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>📧</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg,#818cf8,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          Kiểm tra email!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
          Link xác nhận đã gửi tới<br />
          <strong style={{ color: '#818cf8' }}>{email}</strong><br />
          Bấm link trong email rồi đăng nhập lại.
        </p>
        <button onClick={() => { setMode('login'); setDone(false) }} style={primaryBtnStyle(false)}>
          ← Về đăng nhập
        </button>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16, position: 'relative',
    }}>
      <ParticleBackground />

      {/* Decorative orbs */}
      <Orb size={400} color="#6366f1" style={{ top: '-100px', left: '-100px', animation: 'aurora-shift 8s ease-in-out infinite' }} />
      <Orb size={300} color="#06b6d4" style={{ bottom: '-80px', right: '-80px', animation: 'aurora-shift 10s ease-in-out infinite reverse' }} />
      <Orb size={200} color="#10b981" style={{ top: '40%', left: '5%', animation: 'float 6s ease-in-out infinite' }} />

      {/* Card */}
      <div style={{
        ...cardBase,
        opacity:   mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.94)',
        transition: 'opacity 0.6s cubic-bezier(0.34,1.1,0.64,1), transform 0.6s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        {/* Top shimmer line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.8), rgba(6,182,212,0.6), transparent)',
          borderRadius: 1,
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            fontSize: 26, marginBottom: 14,
            boxShadow: '0 8px 32px rgba(99,102,241,0.55)',
            animation: 'float2 4s ease-in-out infinite',
          }}>💰</div>
          <div>
            <h1 style={{
              fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1,
              background: 'linear-gradient(135deg, #f1f5f9 30%, #818cf8 70%, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>FinTrack</h1>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.12em', marginTop: 3, textTransform: 'uppercase', fontWeight: 600 }}>
              Quản lý chi tiêu cá nhân
            </p>
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 13, padding: 4, marginBottom: 24,
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative',
        }}>
          {/* Sliding indicator */}
          <div style={{
            position: 'absolute',
            top: 4, bottom: 4,
            left: mode === 'login' ? 4 : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(79,70,229,0.2))',
            borderRadius: 10,
            border: '1px solid rgba(99,102,241,0.3)',
            transition: 'left 0.3s cubic-bezier(0.34,1.2,0.64,1)',
            boxShadow: '0 2px 12px rgba(99,102,241,0.2)',
          }} />
          {[
            { value: 'login',    label: '🔓 Đăng nhập' },
            { value: 'register', label: '🚀 Đăng ký' },
          ].map(t => (
            <button key={t.value} type="button"
              onClick={() => { setMode(t.value); setError('') }}
              style={{
                flex: 1, padding: '10px 0',
                background: 'none', border: 'none',
                color: mode === t.value ? '#f1f5f9' : 'var(--text-dim)',
                fontWeight: mode === t.value ? 700 : 400,
                fontSize: 13,
                transition: 'color 0.25s ease',
                position: 'relative', zIndex: 1,
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimInput label="Email" icon="✉️" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ten@email.com" required autoFocus />
          <AnimInput label="Mật khẩu" icon="🔑" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Ít nhất 6 ký tự" required />

          {mode === 'register' && (
            <div style={{ animation: 'slideDown 0.25s cubic-bezier(0.34,1.2,0.64,1) both' }}>
              <AnimInput label="Xác nhận mật khẩu" icon="🔒" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu" required />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 11, padding: '10px 14px', fontSize: 13, color: '#f87171',
              animation: 'slideDown 0.2s ease both',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseDown={() => setBtnPress(true)}
            onMouseUp={() => setBtnPress(false)}
            onMouseLeave={() => setBtnPress(false)}
            style={{
              ...primaryBtnStyle(loading),
              transform: btnPress ? 'scale(0.97)' : loading ? 'scale(0.98)' : 'scale(1)',
              marginTop: 6,
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ animation: 'spin-slow 0.8s linear infinite', display: 'inline-block' }}>⟳</span>
                Đang xử lý...
              </span>
            ) : mode === 'login' ? '🔓 Đăng nhập' : '🚀 Tạo tài khoản'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
            {['🔒 Bảo mật', '☁️ Cloud sync', '📱 Mọi thiết bị'].map((f, i) => (
              <span key={i} style={{
                fontSize: 10, color: 'var(--text-dim)', fontWeight: 600,
                background: 'rgba(255,255,255,0.04)',
                padding: '3px 8px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.07)',
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const cardBase = {
  background: 'rgba(8,16,34,0.92)',
  backdropFilter: 'blur(32px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(32px) saturate(1.8)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: '36px 32px 28px',
  width: '100%', maxWidth: 420,
  boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
  position: 'relative', overflow: 'hidden',
  zIndex: 1,
}

const primaryBtnStyle = (loading) => ({
  width: '100%', padding: '14px 0',
  background: loading
    ? 'rgba(99,102,241,0.4)'
    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
  backgroundSize: '200% 200%',
  color: '#fff', border: 'none', borderRadius: 13,
  fontSize: 15, fontWeight: 700,
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
  boxShadow: loading ? 'none' : '0 6px 24px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.02em',
  animation: loading ? 'none' : 'border-flow 3s ease infinite',
})
