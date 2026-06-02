import React, { useState } from 'react'
import ParticleBackground from './ParticleBackground'

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '12px 16px',
  color: '#f1f5f9',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  fontFamily: 'Inter, sans-serif',
}

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode]       = useState('login')   // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [focused, setFocused] = useState(null)

  const focusStyle = { borderColor: 'rgba(99,102,241,0.6)', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'register' && password !== confirm) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    if (mode === 'login') {
      const { error } = await onSignIn(email, password)
      if (error) setError(error.message === 'Invalid login credentials'
        ? 'Email hoặc mật khẩu không đúng'
        : error.message)
    } else {
      const { error } = await onSignUp(email, password)
      if (error) setError(error.message)
      else setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div style={outerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>📧</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Kiểm tra email!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
            Chúng tôi đã gửi link xác nhận tới<br />
            <strong style={{ color: '#818cf8' }}>{email}</strong><br />
            Vào email bấm xác nhận rồi đăng nhập lại nhé.
          </p>
          <button
            onClick={() => { setMode('login'); setDone(false) }}
            style={primaryBtn}
          >Về đăng nhập</button>
        </div>
      </div>
    )
  }

  return (
    <div style={outerStyle}>
      <ParticleBackground />
      <div style={cardStyle}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
            animation: 'float 4s ease-in-out infinite',
          }}>💰</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.3px' }}>
              Fin<span style={{ color: '#818cf8' }}>Track</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>QUẢN LÝ CHI TIÊU</div>
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          borderRadius: 12, padding: 4, marginBottom: 24,
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          {[
            { value: 'login',    label: 'Đăng nhập' },
            { value: 'register', label: 'Đăng ký' },
          ].map(t => (
            <button key={t.value} type="button"
              onClick={() => { setMode(t.value); setError('') }}
              style={{
                flex: 1, padding: '9px 0',
                borderRadius: 9, border: 'none',
                background: mode === t.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: mode === t.value ? '#f1f5f9' : 'var(--text-dim)',
                fontWeight: mode === t.value ? 700 : 400,
                fontSize: 14,
                transition: 'all 0.2s ease',
                boxShadow: mode === t.value ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
              }}
            >{t.label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="ten@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ ...inputStyle, ...(focused === 'email' ? focusStyle : {}) }}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Mật khẩu</label>
            <input
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, ...(focused === 'password' ? focusStyle : {}) }}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
          </div>

          {/* Confirm password (register only) */}
          {mode === 'register' && (
            <div style={{ animation: 'slideDown 0.2s ease both' }}>
              <label style={labelStyle}>Xác nhận mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                style={{ ...inputStyle, ...(focused === 'confirm' ? focusStyle : {}) }}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: '#f87171',
              animation: 'slideDown 0.2s ease both',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryBtn,
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'scale(0.98)' : 'scale(1)',
              marginTop: 4,
            }}
          >
            {loading
              ? '⏳ Đang xử lý...'
              : mode === 'login' ? '🔓 Đăng nhập' : '🚀 Tạo tài khoản'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)', marginTop: 18 }}>
          Dữ liệu được mã hoá và lưu trữ an toàn trên cloud ☁️
        </p>
      </div>
    </div>
  )
}

const outerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
}

const cardStyle = {
  background: 'rgba(12,24,44,0.97)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 24,
  padding: '32px 28px',
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
  animation: 'fadeInUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both',
  position: 'relative',
  overflow: 'hidden',
}

const labelStyle = {
  display: 'block',
  fontSize: 12, fontWeight: 600,
  color: 'var(--text-dim)',
  marginBottom: 7,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const primaryBtn = {
  width: '100%',
  padding: '13px 0',
  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
  color: '#fff',
  border: 'none',
  borderRadius: 13,
  fontSize: 15, fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.01em',
}
