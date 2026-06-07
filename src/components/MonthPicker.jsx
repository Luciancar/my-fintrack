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
    setPressing('next')
    setTimeout(() => setPressing(null), 200)
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  }

  const isCurrentMonth = (() => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
  })()

  const currentYear = new Date().getFullYear()
  // Cho phép chọn từ 5 năm trước đến 2 năm sau
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i)

  const btnStyle = (side) => ({
    background: pressing === side ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    width: 34, height: 34,
    borderRadius: 10,
    fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
    transform: pressing === side ? 'scale(0.92)' : 'scale(1)',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {/* Month picker */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '7px 12px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        <button onClick={handlePrev} style={btnStyle('prev')}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          aria-label="Tháng trước"
        >‹</button>

        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '-0.2px' }}>
            {MONTHS[month - 1]}
          </div>
          {isCurrentMonth && (
            <div style={{ fontSize: 10, fontWeight: 600, color: '#818cf8', marginTop: 1, letterSpacing: '0.04em' }}>
              ● HIỆN TẠI
            </div>
          )}
        </div>

        <button onClick={handleNext} style={btnStyle('next')}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          aria-label="Tháng sau"
        >›</button>
      </div>

      {/* Year picker — dropdown select */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: '7px 12px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', userSelect: 'none' }}>📅</span>
        <select
          value={year}
          onChange={e => onChange(Number(e.target.value), month)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            colorScheme: 'dark',
            appearance: 'none',
            paddingRight: 16,
          }}
        >
          {yearOptions.map(y => (
            <option key={y} value={y} style={{ background: '#0f172a' }}>{y}</option>
          ))}
        </select>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: -12, pointerEvents: 'none' }}>▾</span>
      </div>
    </div>
  )
}
