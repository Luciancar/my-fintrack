import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { formatShortCurrency, formatCurrency } from '../utils/format'

const TooltipBox = ({ children }) => (
  <div style={{
    background: 'var(--tooltip-bg)',
    border: '1px solid var(--border)',
    borderRadius: 12, padding: '10px 16px',
    backdropFilter: 'blur(12px)', fontSize: 13,
    boxShadow: 'var(--shadow)',
  }}>{children}</div>
)

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <TooltipBox>
      <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)', fontSize: 12 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ marginBottom: 3, display: 'flex', justifyContent: 'space-between', gap: 20 }}>
          <span style={{ color: 'var(--text-dim)' }}>{p.name}</span>
          <span style={{ fontWeight: 700, color: p.color }}>{formatCurrency(p.value)}</span>
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
      <div style={{ color: 'var(--text)', fontWeight: 700 }}>{formatCurrency(item.value)}</div>
      <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 2 }}>{item.payload.percent}% chi tiêu</div>
    </TooltipBox>
  )
}

const RoundedBar = (props) => {
  const { x, y, width, height, fill } = props
  if (!height || !isFinite(height) || Math.abs(height) < 1) return null
  const h = Math.abs(height)
  const top = height < 0 ? y + height : y
  const r = Math.min(5, width / 2)
  return (
    <path
      d={`M${x+r},${top} h${width-2*r} a${r},${r} 0 0 1 ${r},${r} v${h-r} h-${width} v-${h-r} a${r},${r} 0 0 1 ${r},-${r}z`}
      fill={fill}
      style={{ transition: 'all 0.3s ease', filter: `drop-shadow(0 2px 6px ${fill}60)` }}
    />
  )
}

export function BarChartSection({ data }) {
  return (
    <div className="glass-card" style={{ flex: 3, padding: '22px 24px', minWidth: 280 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Thu nhập vs Chi tiêu</h3>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>6 tháng gần nhất</p>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {[{ color: '#10b981', label: 'Thu' }, { color: '#ef4444', label: 'Chi' }].map(d => (
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
          <CartesianGrid strokeDasharray="2 4" stroke="var(--grid-line)" vertical={false} />
          <XAxis dataKey="shortMonth" stroke="transparent" tick={{ fill: 'var(--axis-label)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis stroke="transparent" tick={{ fill: 'var(--axis-tick)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatShortCurrency} width={44} />
          <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--bg-glass)', radius: 8 }} />
          <Bar dataKey="income" name="Thu nhập" fill="url(#incomeGrad)" shape={<RoundedBar />} />
          <Bar dataKey="expense" name="Chi tiêu" fill="url(#expenseGrad)" shape={<RoundedBar />} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function YearChartSection({ data, year }) {
  return (
    <div className="glass-card" style={{ width: '100%', padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Thu nhập & Chi tiêu theo năm</h3>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>12 tháng năm {year}</p>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {[{ color: '#10b981', label: 'Thu nhập' }, { color: '#ef4444', label: 'Chi tiêu' }].map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
              {d.label}
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="yIncomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="yExpenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="var(--grid-line)" vertical={false} />
          <XAxis dataKey="month" stroke="transparent" tick={{ fill: 'var(--axis-label)', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis stroke="transparent" tick={{ fill: 'var(--axis-tick)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatShortCurrency} width={48} />
          <Tooltip content={<BarTooltip />} cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1 }} />
          <Area type="monotone" dataKey="income" name="Thu nhập" stroke="#10b981" strokeWidth={2} fill="url(#yIncomeGrad)" dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          <Area type="monotone" dataKey="expense" name="Chi tiêu" stroke="#ef4444" strokeWidth={2} fill="url(#yExpenseGrad)" dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MultiYearChartSection({ data }) {
  return (
    <div className="glass-card" style={{ width: '100%', padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>So sánh Thu nhập & Chi tiêu</h3>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Tổng theo từng năm</p>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          {[{ color: '#10b981', label: 'Thu nhập' }, { color: '#ef4444', label: 'Chi tiêu' }].map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
              {d.label}
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={4} barCategoryGap="35%">
          <defs>
            <linearGradient id="myIncomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="myExpenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="var(--grid-line)" vertical={false} />
          <XAxis dataKey="year" stroke="transparent" tick={{ fill: 'var(--axis-label)', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis stroke="transparent" tick={{ fill: 'var(--axis-tick)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={formatShortCurrency} width={52} />
          <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--bg-glass)', radius: 8 }} />
          <Bar dataKey="income" name="Thu nhập" fill="url(#myIncomeGrad)" shape={<RoundedBar />} />
          <Bar dataKey="expense" name="Chi tiêu" fill="url(#myExpenseGrad)" shape={<RoundedBar />} />
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
    percent: total > 0 ? ((d.amount / total) * 100).toFixed(1) : '0.0',
  }))

  if (data.length === 0) {
    return (
      <div className="glass-card" style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, minWidth: 220, gap: 12 }}>
        <div style={{ fontSize: 44 }}>📭</div>
        <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center' }}>Chưa có dữ liệu chi tiêu<br/>trong tháng này</div>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ flex: 2, padding: '22px 24px', minWidth: 220 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: 'var(--text)' }}>Phân bổ chi tiêu</h3>
      <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>Tháng này</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={withPercent}
            cx="50%" cy="50%"
            innerRadius={52} outerRadius={activeIndex !== null ? 82 : 76}
            paddingAngle={3}
            dataKey="amount" nameKey="label"
            labelLine={false}
            onMouseEnter={(_, i) => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{ outline: 'none' }}
          >
            {withPercent.map((entry, i) => (
              <Cell
                key={entry.categoryId}
                fill={entry.color}
                stroke={activeIndex === i ? 'var(--text)' : 'transparent'}
                strokeWidth={1.5}
                style={{ filter: activeIndex === i ? `drop-shadow(0 0 8px ${entry.color})` : 'none', cursor: 'pointer', outline: 'none' }}
              />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {withPercent.map((d, i) => (
          <div key={d.categoryId}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, opacity: activeIndex === null || activeIndex === i ? 1 : 0.35, transition: 'opacity 0.2s', cursor: 'default' }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0, boxShadow: `0 0 6px ${d.color}80` }} />
