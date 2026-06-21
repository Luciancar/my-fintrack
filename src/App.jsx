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
import Sidebar from './Sidebar'
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
