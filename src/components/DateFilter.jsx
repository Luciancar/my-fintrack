import React from 'react'
import { endOfMonth, format } from 'date-fns'

export default function DateFilter({ year, month, selectedDate, onSelectDate }) {
  const monthStart = format(new Date(year, month - 1, 1), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd')
  const maxDate = monthEnd
  const hasFilter = Boolean(selectedDate)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      // Bỏ minHeight và fit-content — dùng padding giống MonthPicker
      background: hasFilter ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${hasFilter ? 'rgba(99,102,241,0.45)' : 'var(--border)'}`,
      borderRadius: 14,
      padding: '7px 12px',           // ← khớp với MonthPicker
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      color: hasFilter ? '#a5b4fc' : 'var(--text-muted)',
    }}>
      <span style={{ fontSize: 15, lineHeight: 1, userSelect: 'none' }}>📅</span>

      <input
        type="date"
        value={selectedDate || ''}
        min={monthStart}
        max={maxDate}
        onChange={e => onSelectDate(e.target.value || null)}
        style={{
          // Fix width cố định để không bị nhảy layout
          width: 130,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: hasFilter ? '#a5b4fc' : 'var(--text-muted)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          // Ẩn spinner mặc định của Chrome/Edge
          colorScheme: 'dark',
        }}
      />

      {hasFilter && (
        <button
          onClick={() => onSelectDate(null)}
          title="Xóa bộ lọc ngày"
          style={{
            width: 20, height: 20,
            borderRadius: 6,
            border: 'none',
            background: 'rgba(255,255,255,0.12)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >×</button>
      )}
    </div>
  )
}
