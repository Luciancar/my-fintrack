import React, { useEffect, useRef, useState, useCallback } from 'react'
import { formatCurrency } from '../utils/format'

function useCountUp(target, duration = 950) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  const raf  = useRef(null)

  useEffect(() => {
    const start = prev.current
    const diff  = target - start
    const startTime = performance.now()
    cancelAnimationFrame(raf.current)
    const tick = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease     = 1 - Math.pow(1 - progress, 4)
      setDisplay(Math.round(start + diff * ease))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return display
}

function SummaryCard({ label, amount, color, glowColor, icon, sub, delay = 0 }) {
  const animated = useCountUp(amount, 900)
  const [visible, setVisible] = useState(false)
  const [tilt, setTilt]       = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  const handleMouseMove = useCallback((e) => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 16
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -16
    setTilt({ x, y })
  }, [])

  const handleMouseLeave = useCallback(() => { setTilt({ x: 0, y: 0 }); setHovered(false) }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        flex: 1, minWidth: 190, padding: '22px 24px',
        background: 'rgba(255,255,255,0.035)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${hovered ? color + '40' : 'rgba(255,255,255,0.08)'}`,
        borderTop: `2px solid ${color}60`,
        borderRadius: 20, position: 'relative', overflow: 'hidden', cursor: 'default',
        opacity: visible ? 1 : 0,
        transform: visible
          ? `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(${hovered ? '-4px' : '0'}) scale(${hovered ? 1.02 : 1})`
          : 'translateY(28px) scale(0.95)',
        transition: visible ? 'border-color 0.25s ease, opacity 0.1s' : `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.34,1.2,0.64,1) ${delay}ms`,
        boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.45), 0 0 30px ${glowColor}35` : '0 8px 32px rgba(0,0,0,0.3)',
        willChange: 'transform',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 70% 50% at ${50 + tilt.x * 3}% ${50 - tilt.y * 3}%, ${color}12 0%, transparent 70%)`, borderRadius: 'inherit' }} />
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg, transparent, ${color}80, transparent)`, opacity: hovered ? 1 : 0.4 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: 5 }}>{label}</span>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'transform 0.35s cubic-bezier(0.34,1.4,0.64,1)', transform: hovered ? 'scale(1.2) rotate(8deg)' : 'scale(1)' }}>{icon}</div>
        </div>
        <div style={{ fontSize: 27, fontWeight: 800, color, letterSpacing: '-1.2px', lineHeight: 1, marginBottom: 7, fontVariantNumeric: 'tabular-nums', textShadow: hovered ? `0 0 20px ${color}60` : 'none' }}>
          {formatCurrency(animated)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, opacity: 0.7, boxShadow: `0 0 6px ${color}` }} />
          {sub}
        </div>
      </div>
    </div>
  )
}

export default function SummaryCards({ income, expense, saving, balance }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      <SummaryCard label="Thu nhập"  amount={income}   color="#10b981" glowColor="#10b981" icon="💹" sub="Tổng trong tháng" delay={0}   />
      <SummaryCard label="Chi tiêu"  amount={expense}  color="#ef4444" glowColor="#ef4444" icon="💸" sub="Tổng trong tháng" delay={90}  />
      <SummaryCard label="Tiết kiệm" amount={saving}   color="#06b6d4" glowColor="#06b6d4" icon="🏦" sub={saving > 0 ? 'Đang tốt 🎉' : 'Chưa có'} delay={180} />
      <SummaryCard label="Số dư"     amount={Math.abs(balance)} color={balance >= 0 ? '#818cf8' : '#f87171'} glowColor={balance >= 0 ? '#818cf8' : '#f87171'} icon={balance >= 0 ? '✨' : '⚠️'} sub={balance >= 0 ? 'Thu > Chi ✓' : 'Vượt ngân sách'} delay={270} />
    </div>
  )
}
