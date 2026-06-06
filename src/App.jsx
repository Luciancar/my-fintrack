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

  return (
    <div style={{ minHeight: '100vh', opacity: pageReady ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <ParticleBackground />
      <header style={{ background: 'rgba(3,8,20,0.85)', backdropFilter: 'blur(32px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: '#fff' }}>FinTrack</div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setActiveTab('dashboard')} style={{ background: activeTab === 'dashboard' ? 'rgba(99,102,241,0.4)' : 'transparent', border:'none', color:'#fff', padding:'8px 16px', borderRadius:8 }}>📊 Tổng quan</button>
            <button onClick={() => setActiveTab('plans')} style={{ background: activeTab === 'plans' ? 'rgba(99,102,241,0.4)' : 'transparent', border:'none', color:'#fff', padding:'8px 16px', borderRadius:8 }}>🎯 Kế hoạch</button>
          </div>
          <button onClick={() => setModalOpen(true)} style={{ background:'#4f46e5', color:'#fff', border:'none', padding:'8px 16px', borderRadius:8 }}>＋ Thêm</button>
        </div>
      </header>

      <main style={{ maxWidth:1140, margin:'0 auto', padding:'30px 24px' }}>
        {activeTab === 'dashboard' ? (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
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

      <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#1e293b', padding: '10px 15px', borderRadius: '8px', color: '#fff', fontSize: '12px' }}>
        🛠️ Chatbot đang bảo trì
      </div>
      <TransactionModal isOpen={modalOpen} onClose={() => {setModalOpen(false); setEditData(null)}} onSave={handleSave} editData={editData}/>
    </div>
  )
}