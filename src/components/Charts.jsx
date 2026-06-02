import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { formatShortCurrency, formatCurrency } from '../utils/format'

/* ── Shared tooltip style ── */
const TooltipBox = ({ children }) => (
  <div style={{
    background: 'rgba(10,22,40,0.95)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: '10px 16px',
    backdropFilter: 'blur(12px)',
    fontSize: 13,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  }}>{children}</div>
)

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <TooltipBox>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#f1f5f9', fontSize: 12 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 3, display: 'flex', justifyContent: 'space-between', gap: 20 }}>
          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </TooltipBox>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <TooltipBox>
      <div style={{ fontWeight: 700, color: item.payload.color, marginBottom: 4 }}>{item.name}</div>
      <div style={{ color: '#f1f5f9', fontWeight: 700 }}>{formatCurrency(item.value)}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{item.payload.percent}% chi tiêu</div>
    </TooltipBox>
  )
}

/* ── Custom Bar shape with rounded top ── */
const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props
  if (!height || height <= 0) return null
  const r = Math.min(5, width / 2)
  return (
    <path
      d={`M${x + r},${y} h${width - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${height - r} h-${width} v-${height - r} a${r},${r} 0 0 1 ${r},-${r}z`}
      fill={fill}
      style={{ transition: 'all 0.3s ease', filter: `drop-shadow(0 2px 6px ${fill}60)` }}
    />
  )
}

/* ── Active dot for pie ── */
const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function BarChartSection({ data }) {
  return (
    <div
      className="glass-card"
      style={{ flex: 3, padding: '22px 24px', minWidth: 280, animation: 'slideInLeft 0.6s cubic-bezier(0.34,1.1,0.64,1) both', animationDelay: '0.15s' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
            Thu nhập vs Chi tiêu
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>6 tháng gần nhất</p>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {[
            { color: '#10b981', label: 'Thu' },
            { color: '#ef4444', label: 'Chi' },
          ].map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
              {d.label}
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={3} barCategoryGap="30%">
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="shortMonth"
            stroke="transparent"
            tick={{ fill: '#8fadc8', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: '#7a9bbf', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatShortCurrency}
            width={44}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }} />
          <Bar dataKey="income" name="Thu nhập" fill="url(#incomeGrad)" shape={<RoundedBar />} />
          <Bar dataKey="expense" name="Chi tiêu" fill="url(#expenseGrad)" shape={<RoundedBar />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PieChartSection({ data }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const total = data.reduce((s, d) => s + d.amount, 0)
  const withPercent = data.map(d => ({
    ...d,
    percent: total > 0 ? ((d.amount / total) * 100).toFixed(1) : 0,
  }))

  if (data.length === 0) {
    return (
      <div className="glass-card" style={{
        flex: 2, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, minWidth: 220, gap: 12,
        animation: 'fadeInUp 0.6s ease both', animationDelay: '0.2s',
      }}>
        <div style={{ fontSize: 44, animation: 'float 3s ease-in-out infinite' }}>📭</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>
          Chưa có dữ liệu chi tiêu<br/>trong tháng này
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{
      flex: 2, padding: '22px 24px', minWidth: 220,
      animation: 'slideInRight 0.6s cubic-bezier(0.34,1.1,0.64,1) both', animationDelay: '0.2s',
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Phân bổ chi tiêu</h3>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>Tháng này</p>

      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <defs>
            {withPercent.map((d, i) => (
              <filter key={i} id={`glow-${i}`}>
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>
          <Pie
            data={withPercent}
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={activeIndex !== null ? 78 : 72}
            paddingAngle={3}
            dataKey="amount"
            nameKey="label"
            labelLine={false}
            label={renderCustomLabel}
            onMouseEnter={(_, i) => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{ transition: 'outer-radius 0.3s ease', outline: 'none' }}
          >
            {withPercent.map((entry, i) => (
              <Cell
                key={entry.categoryId}
                fill={entry.color}
                stroke={activeIndex === i ? '#fff' : 'transparent'}
                strokeWidth={1.5}
                style={{
                  filter: activeIndex === i ? `drop-shadow(0 0 8px ${entry.color})` : 'none',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 6 }}>
        {withPercent.map((d, i) => (
          <div
            key={d.categoryId}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
              opacity: activeIndex === null || activeIndex === i ? 1 : 0.4,
              transition: 'opacity 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: d.color, flexShrink: 0,
              boxShadow: `0 0 6px ${d.color}80`,
            }} />
            <span style={{ flex: 1, color: 'var(--text-muted)' }}>{d.label}</span>
            <span style={{ color: d.color, fontWeight: 700 }}>{d.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
