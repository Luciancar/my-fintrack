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

/* ── Page entry animation hook ── */
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
  const [editData, setEditData]   = useState(null)
  const [btnHover, setBtnHover]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'plans'
  const pageReady = usePageMount(80)

  const now = new Date()
  const [year, setYear]                 = useState(now.getFullYear())
  const [month, setMonth]               = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(null)

  const handleMonthChange = (y, m) => { setYear(y); setMonth(m); setSelectedDate(null) }

  /* ── Loading screen ── */
  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap: 16 }}>
      <ParticleBackground />
      <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
        <div style={{ fontSize: 48, animation: 'float 2s ease-in-out infinite', marginBottom: 12 }}>💰</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>ĐANG TẢI...</div>
        <div style={{ display:'flex', gap:4, justifyContent:'center', marginTop:12 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width:6, height:6, borderRadius:'50%',
              background:'#6366f1',
              animation:`float ${0.6 + i*0.15}s ease-in-out infinite alternate`,
            }}/>
          ))}
        </div>
      </div>
    </div>
  )

  if (supabase && !user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />

  const { income, expense, balance, transactions: monthTxs } = computeMonthStats(transactions, year, month)
  const filteredTxs    = selectedDate ? monthTxs.filter(t => t.date === selectedDate) : monthTxs
  const dayIncome      = filteredTxs.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const dayExpense     = filteredTxs.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)
  const displayIncome  = selectedDate ? dayIncome  : income
  const displayExpense = selectedDate ? dayExpense : expense
  const displayBalance = selectedDate ? dayIncome - dayExpense : balance
  const categoryBreakdown = computeCategoryBreakdown(filteredTxs)
  const last6Months       = computeLast6Months(transactions)
  const totalExpense      = categoryBreakdown.reduce((s,d) => s + d.amount, 0)

  const handleEdit  = (tx) => { setEditData(tx); setModalOpen(true) }
  const handleSave  = (data) => { if (editData) updateTransaction(editData.id, data); else addTransaction(data); setEditData(null) }
  const handleClose = () => { setModalOpen(false); setEditData(null) }

  return (
    <div style={{ minHeight: '100vh', opacity: pageReady ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <ParticleBackground />

      {/* ══════════════ HEADER ══════════════ */}
      <header style={{
        background: 'rgba(3,8,20,0.85)',
        backdropFilter: 'blur(32px) saturate(2)',
        WebkitBackdropFilter: 'blur(32px) saturate(2)',
        borderBottom: '1px solid rgba(255,255,255,0.055)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.5)',
        animation: 'slideDown 0.5s cubic-bezier(0.34,1.1,0.64,1) both',
      }}>
        {/* Animated top border */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #6366f1, #818cf8, #06b6d4, #10b981, #6366f1)',
          backgroundSize: '300% 100%',
          animation: 'border-flow 4s ease infinite',
        }}/>

        <div style={{
          maxWidth: 1140, margin: '0 auto', padding: '0 24px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13,
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              boxShadow: '0 4px 20px rgba(99,102,241,0.55)',
              animation: 'float2 5s ease-in-out infinite',
            }}>💰</div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: 17, letterSpacing: '-0.4px',
                background: 'linear-gradient(135deg, #f1f5f9, #818cf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>FinTrack</div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em', fontWeight: 600 }}>
                QUẢN LÝ CHI TIÊU
              </div>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.04)', borderRadius:11, padding:3, border:'1px solid rgba(255,255,255,0.07)' }}>
            {[
              { id:'dashboard', label:'📊 Tổng quan' },
              { id:'plans',     label:'🎯 Kế hoạch' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding:'7px 16px', borderRadius:8, border:'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(79,70,229,0.3))' : 'transparent',
                color: activeTab === tab.id ? '#f0f6ff' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 400,
                fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif',
                transition:'all 0.2s ease',
                boxShadow: activeTab === tab.id ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 12px rgba(99,102,241,0.2)' : 'none',
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Sync */}
            {syncing && (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-dim)', background:'rgba(255,255,255,0.04)', padding:'5px 10px', borderRadius:8, border:'1px solid rgba(255,255,255,0.07)', animation:'fadeInScale 0.2s ease both' }}>
                <span style={{ animation:'spin-slow 1s linear infinite', display:'inline-block', fontSize:13 }}>↻</span>
                Đồng bộ...
              </div>
            )}

            {/* User menu */}
            {user && (
              <div style={{ position:'relative' }}>
                <button onClick={() => setUserMenuOpen(v => !v)} style={{ display:'flex', alignItems:'center', gap:8, background: userMenuOpen ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)', border:`1px solid ${userMenuOpen ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius:11, padding:'6px 12px 6px 7px', cursor:'pointer', transition:'all 0.2s ease' }}>
                  <div style={{ width:28, height:28, borderRadius:9, background:'linear-gradient(135deg, #6366f1, #06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', boxShadow:'0 2px 8px rgba(99,102,241,0.4)' }}>{user.email[0].toUpperCase()}</div>
                  <span style={{ fontSize:12, color:'var(--text-muted)', maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</span>
                  <span style={{ fontSize:10, color:'var(--text-dim)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', display:'inline-block' }}>▾</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div onClick={() => setUserMenuOpen(false)} style={{ position:'fixed', inset:0, zIndex:10 }}/>
                    <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', background:'rgba(8,18,36,0.98)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, overflow:'hidden', zIndex:20, minWidth:180, boxShadow:'0 16px 48px rgba(0,0,0,0.6)', backdropFilter:'blur(16px)', animation:'slideDown 0.18s cubic-bezier(0.34,1.2,0.64,1) both' }}>
                      <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                        <div style={{ fontSize:11, color:'var(--text-dim)', marginBottom:2 }}>Đăng nhập với</div>
                        <div style={{ fontSize:13, color:'#818cf8', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
                      </div>
                      <button onClick={() => { signOut(); setUserMenuOpen(false) }} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'11px 16px', background:'none', border:'none', color:'#f87171', fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'} onMouseOut={e => e.currentTarget.style.background='none'}>
                        <span>⏏️</span> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Add button */}
            <button onClick={() => setModalOpen(true)} onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)} style={{ display:'flex', alignItems:'center', gap:8, background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'#fff', border:'none', borderRadius:12, padding:'10px 22px', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all 0.25s cubic-bezier(0.34,1.3,0.64,1)', boxShadow: btnHover ? '0 8px 30px rgba(99,102,241,0.7)' : '0 4px 18px rgba(99,102,241,0.45)', transform: btnHover ? 'translateY(-2px) scale(1.04)' : 'scale(1)', position:'relative', overflow:'hidden' }}>
              <span style={{ fontSize:17, lineHeight:1, fontWeight:400 }}>＋</span>
              Thêm giao dịch
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════ MAIN ══════════════ */}
      <main style={{ maxWidth:1140, margin:'0 auto', padding:'30px 24px 90px', position:'relative', zIndex:1 }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
        <>
        {/* Page header */}
        <div style={{
          display:'flex', alignItems:'flex-end', justifyContent:'space-between',
          marginBottom:26, flexWrap:'wrap', gap:14,
        }}>
          <div>
            <h1 style={{
              fontSize:28, fontWeight:900, letterSpacing:'-0.6px', lineHeight:1.1, marginBottom:5,
              background:'linear-gradient(135deg, #f1f5f9 40%, #818cf8 80%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>
              Tổng quan tài chính
            </h1>
            <p style={{ fontSize:13, color:'var(--text-dim)' }}>
              {selectedDate
                ? `📅 Đang xem ngày ${selectedDate.split('-').reverse().join('/')}`
                : 'Theo dõi thu chi · kiểm soát ngân sách cá nhân'}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <MonthPicker year={year} month={month} onChange={handleMonthChange}/>
            <DateFilter year={year} month={month} selectedDate={selectedDate} onSelectDate={setSelectedDate}/>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ marginBottom:22 }}>
          <SummaryCards income={displayIncome} expense={displayExpense} balance={displayBalance}/>
        </div>

        {/* Charts */}
        <div style={{ display:'flex', gap:16, marginBottom:22, flexWrap:'wrap' }}>
          <BarChartSection data={last6Months}/>
          <PieChartSection data={categoryBreakdown}/>
        </div>

        {/* Category + Transactions */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-start' }}>

          {/* Category breakdown */}
          <div className="glass-card" style={{
            width:272, flexShrink:0, padding:'20px 22px',
            animation:'slideInLeft 0.6s cubic-bezier(0.34,1.1,0.64,1) both', animationDelay:'0.3s',
          }}>
            <h3 style={{ fontSize:14, fontWeight:700, marginBottom:2 }}>Chi tiêu theo danh mục</h3>
            <p style={{ fontSize:11, color:'var(--text-dim)', marginBottom:18 }}>
              {selectedDate ? 'Ngày đã chọn' : 'Tháng này'}
            </p>

            {categoryBreakdown.length === 0 ? (
              <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-dim)' }}>
                <div style={{ fontSize:36, marginBottom:8, animation:'float 3s ease-in-out infinite' }}>📊</div>
                <div style={{ fontSize:12 }}>Chưa có dữ liệu</div>
              </div>
            ) : categoryBreakdown.map((d, i) => {
              const pct = totalExpense > 0 ? (d.amount / totalExpense) * 100 : 0
              return (
                <div key={d.categoryId} style={{
                  marginBottom:14,
                  animation:'fadeInUp 0.4s ease both',
                  animationDelay:`${i * 70}ms`,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{
                        width:8, height:8, borderRadius:'50%', background:d.color,
                        display:'inline-block', flexShrink:0,
                        boxShadow:`0 0 8px ${d.color}`,
                        animation:'pulse-ring 2.5s ease-out infinite',
                      }}/>
                      <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize:12, color:d.color, fontWeight:700 }}>
                      {new Intl.NumberFormat('vi-VN').format(d.amount)}đ
                    </span>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:99, height:6, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', borderRadius:99,
                      background:`linear-gradient(90deg, ${d.color}99, ${d.color})`,
                      boxShadow:`0 0 12px ${d.color}80`,
                      transition:`width 1.1s cubic-bezier(0.34,1.05,0.64,1) ${i*60}ms`,
                      width:`${pct}%`,
                    }}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Transactions */}
          <div style={{ flex:1, minWidth:300 }}>
            <TransactionList transactions={filteredTxs} onEdit={handleEdit} onDelete={deleteTransaction}/>
          </div>
        </div>
        </>
        )}

        {/* ── PLANS TAB ── */}
        {activeTab === 'plans' && (
          <div style={{ animation:'fadeInUp 0.4s cubic-bezier(0.34,1.1,0.64,1) both' }}>
            <SavingsPlans
              plans={plans}
              onAdd={addPlan}
              onUpdate={updatePlan}
              onDelete={deletePlan}
              onAddSaving={addSaving}
              avgMonthlyIncome={income}
            />
          </div>
        )}
      </main>

      <TransactionModal isOpen={modalOpen} onClose={handleClose} onSave={handleSave} editData={editData}/>

      {/* ── AI Chatbot ── */}
      <ChatBot transactions={transactions} plans={plans} year={year} month={month}/>
    </div>
  )
}
