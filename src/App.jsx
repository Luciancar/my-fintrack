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
import { supabase } from './lib/supabase'

function usePageMount(delay = 0) {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), delay); return () => clearTimeout(t) }, [delay])
  return ready
}

const EXPENSE_LIMIT = 10_000_000

export default function App() {
  const { user, loading: authLoading, signIn, signUp } = useAuth()
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useTransactions(user)
  const { plans, addPlan, updatePlan, deletePlan, addSaving } = useSavingsPlans(user)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const pageReady = usePageMount(80)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedYears, setSelectedYears] = useState([now.getFullYear()])
  const [yearRangeBase, setYearRangeBase] = useState(now.getFullYear())

  const handleMonthChange = (y, m) => { setYear(y); setMonth(m); setSelectedDate(null); setAlertDismissed(false) }

  const toggleYear = (y) => {
    setSelectedYears(prev =>
      prev.includes(y)
        ? (prev.length > 1 ? prev.filter(x => x !== y) : prev)
        : [...prev, y].sort()
    )
  }

  if (authLoading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#030814', color:'#fff' }}>💰</div>
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
    if (editData) updateTransaction(editData.id, data)
    else addTransaction(data)
    setModalOpen(false); setEditData(null)
  }

  const displayName = user?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const handleSignOut = async () => { await supabase.auth.signOut(); setUserMenuOpen(false) }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const showAlert = isCurrentMonth && expense > EXPENSE_LIMIT && !alertDismissed
  const alertPct = Math.min((expense / EXPENSE_LIMIT) * 100, 999).toFixed(0)

  const yearOptions = Array.from({ length: 9 }, (_, i) => yearRangeBase - 4 + i)

  return (
    <div style={{ minHeight: '100vh', opacity: pageReady ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <ParticleBackground />

      <header style={{ background: 'rgba(3,8,20,0.85)', backdropFilter: 'blur(32px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>💰</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>FinTrack</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', marginTop: 2 }}>QUẢN LÝ CHI TIÊU</div>
            </div>
          </div>

          <div style={{ display:'flex', gap: 4 }}>
            {[
              { id: 'dashboard', label: '📊 Tổng quan' },
              { id: 'yearview',  label: '📅 Theo năm' },
              { id: 'plans',     label: '🎯 Kế hoạch' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? 'rgba(99,102,241,0.4)' : 'transparent', border:'none', color:'#fff', padding:'8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '4px 10px 4px 4px', cursor: 'pointer', color: '#fff' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 6, minWidth: 180, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, opacity: 0.5, color:'#fff' }}>Đăng nhập với</div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2, wordBreak: 'break-all', color:'#fff' }}>{user?.email}</div>
                  </div>
                  <button onClick={handleSignOut} style={{ width: '100%', background: 'transparent', border: 'none', color: '#f87171', padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >🚪 Đăng xuất</button>
                </div>
              )}
            </div>
            <button onClick={() => setModalOpen(true)} style={{ background:'#4f46e5', color:'#fff', border:'none', padding:'8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>＋ Thêm</button>
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
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                      Đã chi <strong style={{ color: '#f87171' }}>{expense.toLocaleString('vi-VN')}đ</strong> / giới hạn <strong style={{ color: '#fff' }}>10.000.000đ</strong> — vượt <strong style={{ color: '#fbbf24' }}>{alertPct}%</strong>
                    </div>
                  </div>
                </div>
                <button onClick={() => setAlertDismissed(true)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 28, height: 28, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <MonthPicker year={year} month={month} onChange={handleMonthChange}/>
              <DateFilter year={year} month={month} selectedDate={selectedDate} onSelectDate={setSelectedDate}/>
            </div>

            <SummaryCards income={income} expense={expense} saving={saving} balance={balance}/>

            <div style={{ display:'flex', gap:16, margin:'20px 0' }}>
              <BarChartSection data={last6Months}/>
              <PieChartSection data={categoryBreakdown}/>
            </div>

            <div style={{ marginBottom: 20 }}>
              <YearChartSection data={yearStats} year={year}/>
            </div>

            <TransactionList transactions={filteredTxs} onEdit={handleEdit} onDelete={deleteTransaction}/>
          </>
        )}

        {/* ── THEO NĂM ── */}
        {activeTab === 'yearview' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>📅 Thống kê theo năm</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Chọn một hoặc nhiều năm để xem tổng cộng dồn</p>
            </div>

            {/* Year multi-select */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                  Đã chọn: <span style={{ color: '#818cf8' }}>{selectedYears.join(', ')}</span>
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setYearRangeBase(y => y - 9)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '4px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13 }}>‹</button>
                  <button onClick={() => setYearRangeBase(y => y + 9)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '4px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13 }}>›</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {yearOptions.map(y => {
                  const sel = selectedYears.includes(y)
                  return (
                    <button key={y} onClick={() => toggleYear(y)} style={{
                      padding: '8px 18px', borderRadius: 10,
                      border: `1px solid ${sel ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                      background: sel ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.04)',
                      color: sel ? '#818cf8' : 'rgba(255,255,255,0.5)',
                      fontWeight: sel ? 700 : 500, fontSize: 14, cursor: 'pointer',
                      boxShadow: sel ? '0 0 12px rgba(129,140,248,0.3)' : 'none',
                      transition: 'all 0.15s',
                    }}>{y}</button>
                  )
                })}
              </div>
            </div>

            {/* Cards tổng cộng dồn */}
            <SummaryCards income={multiYear.income} expense={multiYear.expense} saving={multiYear.saving} balance={multiYear.balance}/>

            {/* Bar chart so sánh từng năm (tổng cả năm) */}
            <div style={{ margin: '20px 0' }}>
              <MultiYearChartSection data={multiYearChartData}/>
            </div>
          </>
        )}

        {/* ── KẾ HOẠCH ── */}
        {activeTab === 'plans' && (
          <SavingsPlans plans={plans} onAdd={addPlan} onUpdate={updatePlan} onDelete={deletePlan} onAddSaving={addSaving} avgMonthlyIncome={income}/>
        )}
      </main>

      <ChatBot user={user} transactions={transactions}/>
      <TransactionModal isOpen={modalOpen} onClose={() => {setModalOpen(false); setEditData(null)}} onSave={handleSave} editData={editData}/>
    </div>
  )
}
