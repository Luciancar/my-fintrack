import React, { useEffect, useRef, useState } from 'react'
import { formatCurrency } from '../utils/format'

/**
 * Animated counting number hook
 */
function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = prev.current
    const diff = target - start
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * ease))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = target
    }
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return display
}

function SummaryCard({ label, amount, color, glowVar, icon, sub, delay = 0 }) {
  const animated = useCountUp(amount, 800)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className="glass-card"
      style={{
        padding: '22px 26px',
        flex: 1,
        minWidth: 200,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.34,1.2,0.64,1) ${delay}ms`,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `var(--shadow), ${glowVar}`,
        borderTop: `1.5px solid ${color}40`,
      }}
    >
      {/* Subtle gradient glow behind */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 10% 0%, ${color}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon + label row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {label}
          </span>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${color}20`,
            border: `1px solid ${color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
            transition: 'transform 0.3s ease',
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.12) rotate(5deg)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
          >
            {icon}
          </div>
        </div>

        {/* Amount */}
        <div
          className="animated-value"
          style={{
            fontSize: 26, fontWeight: 800,
            color,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            marginBottom: 6,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatCurrency(animated)}
        </div>

        {/* Sub label */}
        <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>
          {sub}
        </div>
      </div>
    </div>
  )
}

export default function SummaryCards({ income, expense, balance }) {
  const saving = balance >= 0 ? balance : 0

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      <SummaryCard
        label="Thu nhập"
        amount={income}
        color="#10b981"
        glowVar="var(--shadow-glow-green)"
        icon="💹"
        sub="Tổng trong tháng"
        delay={0}
      />
      <SummaryCard
        label="Chi tiêu"
        amount={expense}
        color="#ef4444"
        glowVar="var(--shadow-glow-red)"
        icon="💸"
        sub="Tổng trong tháng"
        delay={80}
      />
      <SummaryCard
        label="Tiết kiệm"
        amount={saving}
        color="#06b6d4"
        glowVar="var(--shadow-glow-blue)"
        icon="🏦"
        sub={saving > 0 ? 'Đang tiết kiệm tốt 🎉' : 'Chưa có tiết kiệm'}
        delay={160}
      />
      <SummaryCard
        label="Số dư còn lại"
        amount={Math.abs(balance)}
        color={balance >= 0 ? '#818cf8' : '#f87171'}
        glowVar={balance >= 0 ? 'var(--shadow-glow-purple)' : 'var(--shadow-glow-red)'}
        icon={balance >= 0 ? '✨' : '⚠️'}
        sub={balance >= 0 ? 'Thu > Chi ✓' : 'Chi vượt thu nhập'}
        delay={240}
      />
    </div>
  )
}
