import React, { useState, useRef, useEffect } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isFuture } from 'date-fns'

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function DateFilter({ year, month, selectedDate, onSelectDate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const monthStart = startOfMonth(new Date(year, month - 1))
  const monthEnd = endOfMonth(new Date(year, month - 1))
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Padding before first day (0=Sun → offset 0, 1=Mon → offset 1...)
  const firstDayOfWeek = getDay(monthStart) // 0=Sun
  const paddingDays = firstDayOfWeek

  const selected = selectedDate ? parseISO(selectedDate) : null

  const handleDay = (day) => {
    const str = format(day, 'yyyy-MM-dd')
    if (selectedDate === str) {
      onSelectDate(null) // deselect = show all month
    } else {
      onSelectDate(str)
    }
    setOpen(false)
  }

  const hasFilter = !!selectedDate

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: hasFilter ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${hasFilter ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.09)'}`,
          borderRadius: 14,
          padding: '7px 14px',
          color: hasFilter ? '#818cf8' : 'var(--text-muted)',
          fontSize: 13,
          fontWeight: hasFilter ? 700 : 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: hasFilter ? '0 0 12px rgba(99,102,241,0.2)' : 'none',
          height: 48,
        }}
        onMouseOver={e => { if (!hasFilter) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
        onMouseOut={e => { if (!hasFilter) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
      >
        <span style={{ fontSize: 15 }}>📅</span>
        <span>
          {hasFilter
            ? format(parseISO(selectedDate), 'dd/MM/yyyy')
            : 'Lọc theo ngày'}
        </span>
        {hasFilter && (
          <span
            onClick={(e) => { e.stopPropagation(); onSelectDate(null) }}
            style={{
              marginLeft: 2,
              width: 18, height: 18,
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: '#818cf8',
              transition: 'background 0.15s',
              flexShrink: 0,
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(99,102,241,0.5)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(99,102,241,0.3)'}
          >✕</span>
        )}
        <span style={{
          fontSize: 10, color: 'var(--text-dim)',
          marginLeft: 2,
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease',
          display: 'inline-block',
        }}>▾</span>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          zIndex: 200,
          background: 'rgba(8,18,36,0.98)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          padding: '16px',
          width: 272,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          animation: 'slideDown 0.18s cubic-bezier(0.34,1.2,0.64,1) both',
        }}>
          {/* Month label */}
          <div style={{
            textAlign: 'center', marginBottom: 12,
            fontSize: 13, fontWeight: 700, color: 'var(--text)',
            letterSpacing: '-0.2px',
          }}>
            Tháng {month}/{year}
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {DAYS_OF_WEEK.map(d => (
              <div key={d} style={{
                textAlign: 'center', fontSize: 10, fontWeight: 700,
                color: d === 'CN' || d === 'T7' ? 'rgba(99,102,241,0.6)' : 'var(--text-dim)',
                padding: '3px 0',
              }}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {/* Padding */}
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {days.map(day => {
              const str = format(day, 'yyyy-MM-dd')
              const isSelected = selected && isSameDay(day, selected)
              const isCurrentDay = isToday(day)
              const isFutureDay = isFuture(day)
              const dayOfWeek = getDay(day)
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

              return (
                <button
                  key={str}
                  onClick={() => !isFutureDay && handleDay(day)}
                  disabled={isFutureDay}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: 9,
                    border: isCurrentDay && !isSelected
                      ? '1px solid rgba(99,102,241,0.4)'
                      : '1px solid transparent',
                    background: isSelected
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : 'transparent',
                    color: isSelected
                      ? '#fff'
                      : isFutureDay
                        ? 'var(--text-dim)'
                        : isCurrentDay
                          ? '#818cf8'
                          : isWeekend
                            ? 'rgba(129,140,248,0.7)'
                            : 'var(--text-muted)',
                    fontSize: 12,
                    fontWeight: isSelected || isCurrentDay ? 700 : 400,
                    cursor: isFutureDay ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    opacity: isFutureDay ? 0.25 : 1,
                    boxShadow: isSelected ? '0 2px 12px rgba(99,102,241,0.5)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseOver={e => { if (!isFutureDay && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                  onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          {/* Clear button */}
          {hasFilter && (
            <button
              onClick={() => { onSelectDate(null); setOpen(false) }}
              style={{
                marginTop: 12, width: '100%',
                padding: '8px 0',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                color: 'var(--text-muted)',
                fontSize: 12, fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              ✕ Bỏ lọc — xem cả tháng
            </button>
          )}
        </div>
      )}
    </div>
  )
}
