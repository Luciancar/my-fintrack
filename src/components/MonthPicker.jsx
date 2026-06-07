import React, { useState } from 'react'

const MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'
]

const pillStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '0 14px',
  height: 42,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
}

const arrowBtn = (pressing) => ({
  background: pressing ? 'rgba(255,255,255,0.1)' : 'transparent',
  border: 'none',
  color: 'rgba(255,255,255,0.6)',
  width: 24, height: 24,
  borderRadius: 6,
  fontSize: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  transform: pressing ? 'scale(0.9)' : 'scale(1)',
  transition: 'all 0.12s',
  flexShrink: 0,
})

export default function MonthPicker({ year, month, onChange }) {
  const [pressing, setPressing] = useState(null)
  const [yearInput, setYearInput] = useState(String(year))
  const [editingYear, setEditingYear] = useState(false)

  const press = (side, fn) => {
    setPressing(side)
    setTimeout(() => setPressing(null), 180)
    fn()
  }

  const prevMonth = () => press('prev', () => {
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  })

  const nextMonth = () => press('next', () => {
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  })

  const prevYear = () => press('pyear', () => {
    onChange(year - 1, month)
    setYearInput(String(year - 1))
  })

  const nextYear = () => press('nyear', () => {
    onChange(year + 1, month)
    setYearInput(String(year + 1))
  })

  const handleYearCommit = () => {
    const y = parseInt(yearInput)
    if (!isNaN(y) && y >= 1900 && y <= 2200) onChange(y, month)
    else setYearInput(String(year))
    setEditingYear(false)
  }

  const isCurrentMonth = (() => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
  })()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

      {/* Month pill */}
      <div style={pillStyle}>
        <button style={arrowBtn(pressing === 'prev')} onClick={prevMonth}
          onMouseOver={e => e.currentTarget.style.color = '#fff'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >‹</button>

        <div style={{ textAlign: 'center', minWidth: 72 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', whiteSpace: 'nowrap' }}>
            {MONTHS[month - 1]}
          </div>
          {isCurrentMonth && (
            <div style={{ fontSize: 9, color: '#818cf8', letterSpacing: '0.05em', marginTop: 1 }}>● HIỆN TẠI</div>
          )}
        </div>

        <button style={arrowBtn(pressing === 'next')} onClick={nextMonth}
          onMouseOver={e => e.currentTarget.style.color = '#fff'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >›</button>
      </div>

      {/* Year pill */}
      <div style={pillStyle}>
        <button style={arrowBtn(pressing === 'pyear')} onClick={prevYear}
          onMouseOver={e => e.currentTarget.style.color = '#fff'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >‹</button>

        <div style={{ textAlign: 'center', minWidth: 48 }}>
          {editingYear ? (
            <input
              autoFocus
              value={yearInput}
              onChange={e => setYearInput(e.target.value)}
              onBlur={handleYearCommit}
              onKeyDown={e => e.key === 'Enter' && handleYearCommit()}
              style={{
                width: 52, background: 'transparent', border: 'none',
                outline: 'none', color: '#fff', fontSize: 13,
                fontWeight: 700, textAlign: 'center',
              }}
            />
          ) : (
            <div
              onClick={() => { setEditingYear(true); setYearInput(String(year)) }}
              title="Click để nhập năm"
              style={{ fontWeight: 700, fontSize: 13, color: '#fff', cursor: 'text', userSelect: 'none' }}
            >
              {year}
            </div>
          )}
        </div>

        <button style={arrowBtn(pressing === 'nyear')} onClick={nextYear}
          onMouseOver={e => e.currentTarget.style.color = '#fff'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >›</button>
      </div>

    </div>
  )
}
