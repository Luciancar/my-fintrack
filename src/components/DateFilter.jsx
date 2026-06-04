import React from 'react'
import { endOfMonth, format } from 'date-fns'

export default function DateFilter({ year, month, selectedDate, onSelectDate }) {
  const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')
  const today = format(new Date(), 'yyyy-MM-dd')
  const maxDate = monthEnd < today ? monthEnd : today
  const hasFilter = Boolean(selectedDate)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minHeight: 44, // Chuẩn UX mobile chống vỡ layout
      background: hasFilter ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${hasFilter ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.09)'}`,
      borderRadius: 14,
      padding: '6px 12px',
      color: hasFilter ? '#a5b4fc' : 'var(--text-muted)',
      width: 'fit-content', // Đảm bảo không chiếm toàn màn hình vô lý
      maxWidth: '100%', // Chống tràn tuyệt đối trên thiết bị nhỏ
      boxSizing: 'border-box',
    }}>
      <span style={{ fontSize: 15, flexShrink: 0, userSelect: 'none' }}>📅</span>
      <input
        type="date"
        value={selectedDate || ''}
        min={monthStart}
        max={maxDate}
        onChange={e => onSelectDate(e.target.value || null)}
        aria-label="Lọc theo ngày"
        style={{
          width: '100%', // Để input tự co giãn theo container
          maxWidth: 130, // Khống chế độ rộng tối đa vừa đủ nhìn
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'inherit',
          fontSize: 13,
          fontWeight: 700,
          colorScheme: 'dark',
          cursor: 'pointer',
        }}
      />
      {hasFilter && (
        <button
          type="button"
          onClick={() => onSelectDate(null)}
          aria-label="Bỏ lọc ngày"
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.06)',
            color: '#c7d2fe',
            fontSize: 14,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          ×
        </button>
      )}
    </div>
  )
}