import React from 'react'

const pillStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  backdropFilter: 'blur(12px)',
  borderRadius: 12,
  padding: '0 14px',
  height: 42,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
}

export default function DateFilter({ year, month, selectedDate, onSelectDate }) {
  const hasFilter = Boolean(selectedDate)

  return (
    <div style={{
      ...pillStyle,
      background: hasFilter ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${hasFilter ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.1)'}`,
    }}>
      <span style={{ fontSize: 14, userSelect: 'none', lineHeight: 1 }}>📅</span>
      <input
        type="date"
        value={selectedDate || ''}
        onChange={e => onSelectDate(e.target.value || null)}
        style={{
          width: 124,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: hasFilter ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          colorScheme: 'dark',
        }}
      />
      {hasFilter && (
        <button
          onClick={() => onSelectDate(null)}
          title="Xóa lọc ngày"
          style={{
            width: 18, height: 18, borderRadius: 5, border: 'none',
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            cursor: 'pointer', fontSize: 12, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >×</button>
      )}
    </div>
  )
}
