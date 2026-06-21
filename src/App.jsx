import React, { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { useSavingsPlans } from './hooks/useSavingsPlans'
import { computeMonthStats, computeCategoryBreakdown, computeLast6Months, computeYearStats, computeMultiYearStats } from './utils/stats'
import SummaryCards from './components/SummaryCards'
import MonthPicker from './components/MonthPicker'
import DateFilter from './components/DateFilter'
import { BarChartSection, PieChartSection, YearChartSection, MultiYearChartSection } from './components/Charts'
import TransactionList from './components/TransactionList'
import TransactionModal from './components/TransactionModal'
import AuthScreen from './components/AuthScreen'
import ParticleBackground from './components/ParticleBackground'
import SavingsPlans from './components/SavingsPlans'
import ChatBot from './components/ChatBot'
import Sidebar from './components/Sidebar'
import { NotificationBell, NotificationProvider, useNotifications } from './components/NotificationCenter'
import { ThemeProvider, useTheme } from './ThemeContext'
import { supabase } from './lib/supabase'

function usePageMount(delay = 0) {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), delay); return () => clearTimeout(t) }, [delay])
  return ready
}

const EXPENSE_LIMIT = 10_000_000
const SIDEBAR_STORAGE_KEY = 'fintrack-sidebar-collapsed'

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ThemeProvider>
  )
}

function AppContent() {
  const { tokens } = useTheme()
  const { notify } = useNotifications()
  const { user, loading: authLoading, signIn, signUp } = useAuth()
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useTransactions(user)
  const { plans, addPlan, updatePlan, deletePlan, addSaving } = useSavingsPlans(user)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1' } catch { return false }
  })
  const pageReady = usePageMount(80)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedYears, setSelectedYears] = useState([now.getFullYear()])
  const [yearRangeBase, setYearRangeBase] = useState(now.getFullYear())

  const handleMonthChange = (y, m) => { setYear(y); setMonth(m); setSelectedDate(null); setAlertDismissed(false) }

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0') } catch {}
      return next
    })
  }

  const toggleYear = (y) => {
    setSelectedYears(prev =>
      prev.includes(y)
        ? (prev.length > 1 ? prev.filter(x => x !== y) : prev)
        : [...prev, y].sort()
    )
  }

  if (authLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: tokens.bg, color: tokens.text }}>💰</div>
  if (supabase && !user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  const { income, expense, saving, balance, transactions: monthTxs } = computeMonthStats(transactions, year, month)
  const filteredTxs = selectedDate ? transactions.filter(t => t.date === selectedDate) : monthTxs
  const categoryBreakdown = computeCategoryBreakdown(filteredTxs)
  const last6Months = computeLast6Months(transactions)
  const yearStats = computeYearStats(transactions, year)

  // Tổng cộng dồn nhiều năm
  const multiYear = computeMultiYearStats(transactions, selectedYears)

  // Dữ liệu so sánh từng năm cho bar chart (tổng cả năm)
  const multiYearChartData = selectedYears.map(y => {
    const stats = computeMultiYearStats(transactions, [y])
    return { year: String(y), income: stats.income, expense: stats.expense }
  })

  const handleEdit = (tx) => { setEditData(tx); setModalOpen(true) }
  const handleSave = (data) => {
    if (editData) {
      updateTransaction(editData.id, data)
      notify({
        title: 'Đã cập nhật giao dịch',
        message: `${data.title || data.category || 'Giao dịch'} · ${Number(data.amount || 0).toLocaleString('vi-VN')}đ`,
        icon: '✏️',
      })
    } else {
      addTransaction(data)
      notify({
        title: data.type === 'income' ? 'Khoản thu mới' : 'Khoản chi mới',
        message: `${data.title || data.category || 'Giao dịch'} · ${Number(data.amount || 0).toLocaleString('vi-VN')}đ`,
        icon: data.type === 'income' ? '💵' : '🧾',
      })
    }
    setModalOpen(false); setEditData(null)
  }

  const displayName = user?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const handleSignOut = async () => { await supabase.auth.signOut(); setUserMenuOpen(false) }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const showAlert = isCurrentMonth && expense > EXPENSE_LIMIT && !alertDismissed
  const alertPct = Math.min((expense / EXPENSE_LIMIT) * 100, 999).toFixed(0)

  const yearOptions = Array.from({ length: 9 }, (_, i) => yearRangeBase - 4 + i)

  const TAB_TITLES = {
    dashboard: { title: '📊 Tổng quan', subtitle: 'Theo dõi thu chi tháng này' },
    yearview: { title: '📅 Theo năm', subtitle: 'So sánh và cộng dồn nhiều năm' },
    plans: { title: '🎯 Kế hoạch', subtitle: 'Mục tiêu tiết kiệm của bạn' },
  }

  return (
    <div style={{ minHeight: '100vh', opacity: pageReady ? 1 : 0, transition: 'opacity 0.4s ease', display: 'flex', color: tokens.text }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <ParticleBackground />

        <header style={{ background: tokens.headerBg, backdropFilter: 'blur(32px)', position: 'sticky', top: 0, zIndex: 90, borderBottom: `1px solid ${tokens.border}` }}>
          <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: tokens.text }}>{TAB_TITLES[activeTab]?.title}</div>
              <div style={{ fontSize: 11.5, color: tokens.textFaint, marginTop: 1 }}>{TAB_TITLES[activeTab]?.subtitle}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <NotificationBell />

              <div style={{ position: 'relative' }}>
                <button onClick={() => setUserMenuOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 10, padding: '4px 10px 4px 4px', cursor: 'pointer', color: tokens.text }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                  <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                  <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
                </button>
                {userMenuOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: tokens.headerBg, backdropFilter: 'blur(24px)', border: `1px solid ${tokens.border}`, borderRadius: 10, padding: 6, minWidth: 180, zIndex: 200, boxShadow: tokens.shadow }}>
                    <div style={{ padding: '8px 10px 6px', borderBottom: `1px solid ${tokens.border}`, marginBottom: 4 }}>
                      <div style={{ fontSize: 12, color: tokens.textFaint }}>Đăng nhập với</div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2, wordBreak: 'break-all', color: tokens.text }}>{user?.email}</div>
                    </div>
                    <button onClick={handleSignOut} style={{ width: '100%', background: 'transparent', border: 'none', color: tokens.danger, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >🚪 Đăng xuất</button>
                  </div>
                )}
              </div>
              <button onClick={() => setModalOpen(true)} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>＋ Thêm</button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1140, margin: '0 auto', padding: '30px 24px' }}>

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <>
              {showAlert && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>🔔</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#f87171' }}>Cảnh báo! Chi tiêu tháng này đã vượt giới hạn</div>
                      <div style={{ fontSize: 12, color: tokens.textDim, marginTop: 2 }}>
                        Đã chi <strong style={{ color: '#f87171' }}>{expense.toLocaleString('vi-VN')}đ</strong> / giới hạn <strong style={{ color: tokens.text }}>10.000.000đ</strong> — vượt <strong style={{ color: '#fbbf24' }}>{alertPct}%</strong>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setAlertDismissed(true)} style={{ background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 8, width: 28, height: 28, color: tokens.textDim, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <MonthPicker year={year} month={month} onChange={handleMonthChange} />
                <DateFilter year={year} month={month} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              </div>

              <SummaryCards income={income} expense={expense} saving={saving} balance={balance} />

              <div style={{ display: 'flex', gap: 16, margin: '20px 0' }}>
                <BarChartSection data={last6Months} />
                <PieChartSection data={categoryBreakdown} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <YearChartSection data={yearStats} year={year} />
              </div>

              <TransactionList transactions={filteredTxs} onEdit={handleEdit} onDelete={deleteTransaction} />
            </>
          )}

          {/* ── THEO NĂM ── */}
          {activeTab === 'yearview' && (
            <>
              {/* Year multi-select */}
              <div style={{ background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: tokens.textDim, fontWeight: 600 }}>
                    Đã chọn: <span style={{ color: tokens.accentText }}>{selectedYears.join(', ')}</span>
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setYearRangeBase(y => y - 9)} style={{ background: tokens.surfaceHover, border: `1px solid ${tokens.border}`, borderRadius: 7, padding: '4px 12px', color: tokens.textDim, cursor: 'pointer', fontSize: 13 }}>‹</button>
                    <button onClick={() => setYearRangeBase(y => y + 9)} style={{ background: tokens.surfaceHover, border: `1px solid ${tokens.border}`, borderRadius: 7, padding: '4px 12px', color: tokens.textDim, cursor: 'pointer', fontSize: 13 }}>›</button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {yearOptions.map(y => {
                    const sel = selectedYears.includes(y)
                    return (
                      <button key={y} onClick={() => toggleYear(y)} style={{
                        padding: '8px 18px', borderRadius: 10,
                        border: `1px solid ${sel ? tokens.accentText : tokens.border}`,
                        background: sel ? tokens.accentSoft : tokens.surface,
                        color: sel ? tokens.accentText : tokens.textDim,
                        fontWeight: sel ? 700 : 500, fontSize: 14, cursor: 'pointer',
                        boxShadow: sel ? `0 0 12px ${tokens.accentSoft}` : 'none',
                        transition: 'all 0.15s',
                      }}>{y}</button>
                    )
                  })}
                </div>
              </div>

              {/* Cards tổng cộng dồn */}
              <SummaryCards income={multiYear.income} expense={multiYear.expense} saving={multiYear.saving} balance={multiYear.balance} />

              {/* Bar chart so sánh từng năm (tổng cả năm) */}
              <div style={{ margin: '20px 0' }}>
                <MultiYearChartSection data={multiYearChartData} />
              </div>
            </>
          )}

          {/* ── KẾ HOẠCH ── */}
          {activeTab === 'plans' && (
            <SavingsPlans plans={plans} onAdd={addPlan} onUpdate={updatePlan} onDelete={deletePlan} onAddSaving={addSaving} avgMonthlyIncome={income} />
          )}
        </main>

        <ChatBot user={user} transactions={transactions} />
        <TransactionModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditData(null) }} onSave={handleSave} editData={editData} />
      </div>
    </div>
  )
}
