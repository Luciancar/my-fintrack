import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { computeMonthStats, computeCategoryBreakdown, computeLast6Months } from './utils/stats'
import SummaryCards from './components/SummaryCards'
import MonthPicker from './components/MonthPicker'
import DateFilter from './components/DateFilter'
import { BarChartSection, PieChartSection } from './components/Charts'
import TransactionList from './components/TransactionList'
import TransactionModal from './components/TransactionModal'
import AuthScreen from './components/AuthScreen'
import ParticleBackground from './components/ParticleBackground'
import { supabase } from './lib/supabase'

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { transactions, syncing, addTransaction, deleteTransaction, updateTransaction } = useTransactions(user)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData]   = useState(null)
  const [btnHover, setBtnHover]   = useState(false)

  const now = new Date()
  const [year, setYear]               = useState(now.getFullYear())
  const [month, setMonth]             = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)

  const handleMonthChange = (y, m) => { setYear(y); setMonth(m); setSelectedDate(null) }

  // Show loading spinner while checking auth
  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: 40, marginBottom: 12, animation: 'spin-slow 2s linear infinite', display: 'inline-block' }}>⚙️</div>
        <div style={{ fontSize: 14 }}>Đang tải...</div>
      </div>
    </div>
  )

  // Show auth screen if Supabase is configured but user not logged in
  if (supabase && !user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  const { income, expense, balance, transactions: monthTxs } = computeMonthStats(transactions, year, month)

  // Apply day filter on top of month transactions
  const filteredTxs = selectedDate
    ? monthTxs.filter(t => t.date === selectedDate)
    : monthTxs

  // Stats for the selected day (or full month if no day selected)
  const dayIncome  = filteredTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const dayExpense = filteredTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const dayBalance = dayIncome - dayExpense

  const displayIncome  = selectedDate ? dayIncome  : income
  const displayExpense = selectedDate ? dayExpense : expense
  const displayBalance = selectedDate ? dayBalance : balance

  const categoryBreakdown = computeCategoryBreakdown(filteredTxs)
  const last6Months = computeLast6Months(transactions)

  const handleEdit = (tx) => { setEditData(tx); setModalOpen(true) }
  const handleSave = (data) => {
    if (editData) updateTransaction(editData.id, data)
    else addTransaction(data)
    setEditData(null)
  }
  const handleCloseModal = () => { setModalOpen(false); setEditData(null) }
  const handleDelete = (id) => deleteTransaction(id)

  const totalExpense = categoryBreakdown.reduce((s, d) => s + d.amount, 0)

  return (
    <div style={{ minHeight: '100vh' }}>
      <ParticleBackground />
      {/* ── Header ── */}
      <header style={{
        background: 'rgba(4,10,22,0.8)',
        backdropFilter: 'blur(28px) saturate(1.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
        animation: 'slideDown 0.5s cubic-bezier(0.34,1.1,0.64,1) both',
      }}>
        <div style={{
          maxWidth: 1120, margin: '0 auto', padding: '0 24px',
          height: 62,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 19,
              boxShadow: '0 4px 16px rgba(99,102,241,0.45)',
              animation: 'float 4s ease-in-out infinite',
            }}>💰</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>
                Fin<span style={{ color: '#818cf8' }}>Track</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 500, letterSpacing: '0.04em' }}>
                QUẢN LÝ CHI TIÊU
              </div>
            </div>
          </div>

          {/* Add button + user info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Sync indicator */}
            {syncing && (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ animation: 'spin-slow 1.5s linear infinite', display: 'inline-block' }}>🔄</span>
                Đang đồng bộ...
              </div>
            )}

            {/* User badge + logout */}
            {user && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '5px 12px 5px 8px',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {user.email[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  title="Đăng xuất"
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--text-dim)', fontSize: 14,
                    cursor: 'pointer', padding: '2px 4px',
                    borderRadius: 5,
                    transition: 'color 0.15s',
                    marginLeft: 2,
                  }}
                  onMouseOver={e => e.currentTarget.style.color = '#f87171'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >⏏</button>
              </div>
            )}

            <button
              onClick={() => setModalOpen(true)}
              onMouseOver={() => setBtnHover(true)}
              onMouseOut={() => setBtnHover(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: btnHover
                  ? 'linear-gradient(135deg, #818cf8, #6366f1)'
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                borderRadius: 11,
                padding: '9px 20px',
                fontSize: 14, fontWeight: 700,
                transition: 'all 0.22s cubic-bezier(0.34,1.2,0.64,1)',
                boxShadow: btnHover
                  ? '0 6px 24px rgba(99,102,241,0.6)'
                  : '0 4px 16px rgba(99,102,241,0.4)',
                transform: btnHover ? 'translateY(-1px) scale(1.03)' : 'translateY(0) scale(1)',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span>
              Thêm giao dịch
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Page title + Month picker + Date filter */}
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 24, flexWrap: 'wrap', gap: 14,
          animation: 'slideDown 0.4s ease both',
        }}>
          <div>
            <h1 style={{
              fontSize: 26, fontWeight: 800,
              letterSpacing: '-0.5px', lineHeight: 1.1,
              marginBottom: 4,
            }}>
              Tổng quan tài chính
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 400 }}>
              {selectedDate
                ? `Đang xem ngày ${selectedDate.split('-').reverse().join('/')}`
                : 'Theo dõi thu chi — kiểm soát ngân sách cá nhân'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <MonthPicker year={year} month={month} onChange={handleMonthChange} />
            <DateFilter
              year={year}
              month={month}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div style={{ marginBottom: 20 }}>
          <SummaryCards income={displayIncome} expense={displayExpense} balance={displayBalance} />
        </div>

        {/* ── Charts row ── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <BarChartSection data={last6Months} />
          <PieChartSection data={categoryBreakdown} />
        </div>

        {/* ── Bottom row: Category breakdown + Transactions ── */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Category sidebar */}
          <div
            className="glass-card"
            style={{
              width: 272, flexShrink: 0, padding: '20px 22px',
              animation: 'fadeInUp 0.6s ease both', animationDelay: '0.25s',
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Chi tiêu theo danh mục</h3>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 16 }}>Tháng này</p>

            {categoryBreakdown.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8, animation: 'float 3s ease-in-out infinite' }}>📊</div>
                Chưa có dữ liệu
              </div>
            ) : categoryBreakdown.map((d, i) => {
              const pct = totalExpense > 0 ? (d.amount / totalExpense) * 100 : 0
              return (
                <div
                  key={d.categoryId}
                  style={{
                    marginBottom: 14,
                    animation: `fadeInUp 0.4s ease both`,
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: d.color,
                        display: 'inline-block',
                        boxShadow: `0 0 6px ${d.color}80`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize: 12, color: d.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {new Intl.NumberFormat('vi-VN').format(d.amount)}đ
                    </span>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 6, height: 6, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: `linear-gradient(90deg, ${d.color}cc, ${d.color})`,
                      borderRadius: 6,
                      boxShadow: `0 0 10px ${d.color}70`,
                      transition: 'width 1s cubic-bezier(0.34,1.1,0.64,1)',
                      animationDelay: `${i * 80}ms`,
                    }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Transaction list */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <TransactionList
              transactions={filteredTxs}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      {/* ── Modal ── */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editData={editData}
      />
    </div>
  )
}
