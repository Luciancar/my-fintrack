import React from 'react'
import { useTheme } from './ThemeContext'

const TABS = [
  { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
  { id: 'yearview', label: 'Theo năm', icon: '📅' },
  { id: 'plans', label: 'Kế hoạch', icon: '🎯' },
]

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }) {
  const { tokens, isDark, toggle } = useTheme()
  const width = collapsed ? 76 : 220

  return (
    <aside style={{
      width, flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: tokens.headerBg, backdropFilter: 'blur(32px)', borderRight: `1px solid ${tokens.border}`,
      display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease', overflow: 'hidden', zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '20px 0' : '20px 18px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💰</div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: tokens.text, letterSpacing: '-0.5px', lineHeight: 1 }}>FinTrack</div>
            <div style={{ fontSize: 9, color: tokens.textFaint, letterSpacing: '1.5px', marginTop: 2 }}>QUẢN LÝ CHI TIÊU</div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              title={collapsed ? tab.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '12px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? tokens.accentSoft : 'transparent', border: 'none', borderRadius: 10,
                color: active ? tokens.accentText : tokens.textDim, cursor: 'pointer', fontSize: 14,
                fontWeight: active ? 700 : 500, position: 'relative', transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: 17 }}>{tab.icon}</span>
              {!collapsed && <span>{tab.label}</span>}
              {active && (
                <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: 2, background: tokens.accentText }} />
              )}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: 12, borderTop: `1px solid ${tokens.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={toggle}
          title={collapsed ? (isDark ? 'Chế độ sáng' : 'Chế độ tối') : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 10,
            color: tokens.textDim, cursor: 'pointer', fontSize: 13,
          }}
        >
          <span style={{ fontSize: 15 }}>{isDark ? '🌙' : '☀️'}</span>
          {!collapsed && <span>{isDark ? 'Chế độ tối' : 'Chế độ sáng'}</span>}
        </button>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Mở rộng' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '10px 0' : '9px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent', border: 'none', borderRadius: 10,
            color: tokens.textFaint, cursor: 'pointer', fontSize: 13,
          }}
        >
          <span style={{ fontSize: 15, display: 'inline-block', transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>◀</span>
          {!collapsed && <span>Thu gọn</span>}
        </button>
      </div>
    </aside>
  )
}
