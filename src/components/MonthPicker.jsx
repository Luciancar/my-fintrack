import React, { useState } from 'react'

const MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'
]

export default function MonthPicker({ year, month, onChange }) {
  const [pressing, setPressing] = useState(null)

  const handlePrev = () => {
    setPressing('prev')
    setTimeout(() => setPressing(null), 200)
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  }

  const handleNext = () => {
    const now = new Date()
    const nextY = month === 12 ? year + 1 : year
    const nextM = month === 12 ? 1 : month + 1
    if (nextY > now.getFullYear() || (nextY === now.getFullYear() && nextM > now.getMonth() + 1)) return
    setPressing('next')
    setTimeout(() => setPressing(null), 200)
    onChange(nextY, nextM)
  }

  const isCurrentMonth = (() => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
  })()

  const btnBase = (side) => ({
    background: pressing === side ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    width: 34, height: 34,
    borderRadius: 10,
    fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease',
    cursor: side === 'next' && isCurrentMonth ? 'not-allowed' : 'pointer',
    opacity: side === 'next' && isCurrentMonth ? 0.35 : 1,
    transform: pressing === side ? 'scale(0.92)' : 'scale(1)',
  })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '7px 12px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      <button
        onClick={handlePrev}
        style={btnBase('prev')}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text)' }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        aria-label="Tháng trước"
      >‹</button>

      <div style={{ textAlign: 'center', minWidth: 148 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', letterSpacing: '-0.2px' }}>
          {MONTHS[month - 1]} {year}
        </div>
        {isCurrentMonth && (
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: 'var(--primary-light)',
            marginTop: 1, letterSpacing: '0.04em',
          }}>● HIỆN TẠI</div>
        )}
      </div>

      <button
        onClick={handleNext}
        style={btnBase('next')}
        onMouseOver={e => {
          if (!isCurrentMonth) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'var(--text)'
          }
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
        aria-label="Tháng sau"
      >›</button>
    </div>
  )
}
