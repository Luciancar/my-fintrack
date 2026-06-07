import React, { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTransactions } from './hooks/useTransactions'
import { useSavingsPlans } from './hooks/useSavingsPlans'
import { computeMonthStats, computeCategoryBreakdown, computeLast6Months } from './utils/stats'
import SummaryCards from './components/SummaryCards'
import MonthPicker from './components/MonthPicker'
import DateFilter from './components/DateFilter'
import { BarChartSection, PieChartSection } from './components/Charts'
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

export default function App() {
  const { user, loading: authLoading, signIn, signUp } = useAuth()
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = useTransactions(user)
  const { plans, addPlan, updatePlan, deletePlan, addSaving } = useSavingsPlans(user)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pageReady = usePageMount(80)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)

  const handleMonthChange = (y, m) => { setYear(y); setMonth(m); setSelectedDate(null) }

  if (authLoading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>💰</div>
  if (supabase && !user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  const { income, expense, balance, transactions: monthTxs } = computeMonthStats(transactions, year, month)
  const filteredTxs = selectedDate ? transactions.filter(t => t.date === selectedDate) : monthTxs
  const categoryBreakdown = computeCategoryBreakdown(filteredTxs)
  const last6Months = computeLast6Months(transactions)

  const handleEdit = (tx) => { setEditData(tx); setModalOpen(true) }
  const handleSave = (data) => { if (editData) updateTransaction(editData.id, data); else addTransaction(data); setModalOpen(false); setEditData(null) }

  const displayName = user?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
  }

  return (
    <div style={{ minHeight: '100vh', opacity: pageReady ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <ParticleBackground />

      <header style={{ background: 'rgba(3,8,20,0.85)', backdropFilter: 'blur(32px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: '#fff' }}>FinTrack</div>

          <div style={{ display:'flex', gap: 4 }}>
            <button onClick={() => setActiveTab('dashboard')} style={{ background: activeTab === 'dashboard' ? 'rgba(99,102,241,0.4)' : 'transparent', border:'none', color:'#fff', padding:'8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>📊 Tổng quan</button>
            <button onClick={() => setActiveTab('plans')} style={{ background: activeTab === 'plans' ? 'rgba(99,102,241,0.4)' : 'transparent', border:'none', color:'#fff', padding:'8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>🎯 Kế hoạch</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '4px 10px 4px 4px', cursor: 'pointer', color: '#fff' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</span>
                <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
              </button>

              {userMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 6, minWidth: 180, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                  <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 4 }}>
                    <div style={{ fontSize: 12, opacity: 0.5 }}>Đăng nhập với</div>
                    <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2, wordBreak: 'break-all' }}>{user?.email}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#f87171', padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >🚪 Đăng xuất</button>
                </div>
              )}
            </div>

            <button onClick={() => setModalOpen(true)} style={{ background:'#4f46e5', color:'#fff', border:'none', padding:'8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
              ＋ Thêm
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1140, margin: '0 auto', padding: '30px 24px' }}>
        {activeTab === 'dashboard' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <MonthPicker year={year} month={month} onChange={handleMonthChange}/>
              <DateFilter year={year} month={month} selectedDate={selectedDate} onSelectDate={setSelectedDate}/>
            </div>

            <SummaryCards income={income} expense={expense} balance={balance}/>
            <div style={{ display:'flex', gap:16, margin:'20px 0' }}>
              <BarChartSection data={last6Months}/>
              <PieChartSection data={categoryBreakdown}/>
            </div>
            <TransactionList transactions={filteredTxs} onEdit={handleEdit} onDelete={deleteTransaction}/>
          </>
        ) : (
          <SavingsPlans plans={plans} onAdd={addPlan} onUpdate={updatePlan} onDelete={deletePlan} onAddSaving={addSaving} avgMonthlyIncome={income}/>
        )}
      </main>

      <ChatBot user={user} transactions={transactions}/>

      <TransactionModal isOpen={modalOpen} onClose={() => {setModalOpen(false); setEditData(null)}} onSave={handleSave} editData={editData}/>
    </div>
  )
}
