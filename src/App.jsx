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
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const { transactions, syncing, addTransaction, deleteTransaction, updateTransaction } = useTransactions(user)
  const { plans, addPlan, updatePlan, deletePlan, addSaving } = useSavingsPlans(user)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [btnHover, setBtnHover] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const pageReady = usePageMount(80)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)

  const handleMonthChange = (y, m) => { setYear(y); setMonth(m); setSelectedDate(null) }

  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap: 16 }}>
      <ParticleBackground />
      <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
        <div style={{ fontSize: 48, animation: 'float 2s ease-in-out infinite', marginBottom: 12 }}>💰</div>
      </div>
    </div>
  )

  if (supabase && !user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  /* --- ĐOẠN LOGIC ĐÃ ĐƯỢC CHỈNH SỬA ĐỂ HIỂN THỊ ĐÚNG --- */
  const { income, expense, balance, transactions: monthTxs } = computeMonthStats(transactions, year, month)
  
  const filteredTxs = selectedDate ? transactions.filter(t => t.date === selectedDate) : monthTxs
  
  const displayIncome = filteredTxs.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const displayExpense = filteredTxs.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)
  const displayBalance = displayIncome - displayExpense
  
  const categoryBreakdown = computeCategoryBreakdown(filteredTxs)
  const last6Months = computeLast6Months(transactions)
  const totalExpense = categoryBreakdown.reduce((s,d) => s + d.amount, 0)

  const handleEdit = (tx) => { setEditData(tx); setModalOpen(true) }
  const handleSave = (data) => { if (editData) updateTransaction(editData.id, data); else addTransaction(data); setEditData(null) }
  const handleClose = () => { setModalOpen(false); setEditData(null) }

  return (
    <div style={{ minHeight: '100vh', opacity: pageReady ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <ParticleBackground />
      <header style={{ background: 'rgba(3,8,20,0.85)', backdropFilter: 'blur(32px) saturate(2)', borderBottom: '1px solid rgba(255,255,255,0.055)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💰</div>
            <div><div style={{ fontWeight: 900, fontSize: 17, color: '#fff' }}>FinTrack</div></div>
          </div>
          <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.04)', borderRadius:11, padding:3 }}>
            {[ { id:'dashboard', label:'📊 Tổng quan' }, { id:'plans', label:'🎯 Kế hoạch' } ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding:'7px 16px', borderRadius:8, border:'none', background: activeTab === tab.id ? 'rgba(99,102,241,0.4)' : 'transparent', color: activeTab === tab.id ? '#f0f6ff' : '#888', cursor:'pointer' }}>{tab.label}</button>
            ))}
          </div>
          <button onClick={() => setModalOpen(true)} style={{ background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'#fff', border:'none', borderRadius:12, padding:'10px 22px', cursor:'pointer' }}>＋ Thêm giao dịch</button>
        </div>
      </header>

      <main style={{ maxWidth:1140, margin:'0 auto', padding:'30px 24px 90px' }}>
        {activeTab === 'dashboard' && (
          <>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:26 }}>
              <h1 style={{ fontSize:28, fontWeight:900, color:'#fff' }}>Tổng quan tài chính</h1>
              <div style={{ display:'flex', gap:10 }}>
                <MonthPicker year={year} month={month} onChange={handleMonthChange}/>
                <DateFilter year={year} month={month} selectedDate={selectedDate} onSelectDate={setSelectedDate}/>
              </div>
            </div>
            <SummaryCards income={displayIncome} expense={displayExpense} balance={displayBalance}/>
            <div style={{ display:'flex', gap:16, marginBottom:22 }}>
              <BarChartSection data={last6Months}/>
              <PieChartSection data={categoryBreakdown}/>
            </div>
            <TransactionList transactions={filteredTxs} onEdit={handleEdit} onDelete={deleteTransaction}/>
          </>
        )}
        {activeTab === 'plans' && (
          <SavingsPlans plans={plans} onAdd={addPlan} onUpdate={updatePlan} onDelete={deletePlan} onAddSaving={addSaving} avgMonthlyIncome={income}/>
        )}
      </main>
      <TransactionModal isOpen={modalOpen} onClose={handleClose} onSave={handleSave} editData={editData}/>
      <ChatBot transactions={transactions} plans={plans} year={year} month={month}/>
    </div>
  )
}