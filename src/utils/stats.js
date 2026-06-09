import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns'
import { getCategoryById } from '../data/categories'

export function getTransactionsForMonth(transactions, year, month) {
  const start = startOfMonth(new Date(year, month - 1))
  const end = endOfMonth(new Date(year, month - 1))
  return transactions.filter(t => {
    const date = parseISO(t.date)
    return isWithinInterval(date, { start, end })
  })
}

export function computeMonthStats(transactions, year, month) {
  const txs = getTransactionsForMonth(transactions, year, month)
  const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const saving  = txs.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0)
  return { income, expense, saving, balance: income - expense - saving, transactions: txs }
}

export function computeCategoryBreakdown(transactions) {
  const map = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (!map[t.categoryId]) map[t.categoryId] = 0
    map[t.categoryId] += t.amount
  })
  return Object.entries(map).map(([categoryId, amount]) => {
    const cat = getCategoryById(categoryId)
    return { categoryId, label: cat?.label || categoryId, color: cat?.color || '#888', amount }
  }).sort((a, b) => b.amount - a.amount)
}

export function computeLast6Months(transactions) {
  const now = new Date()
  const result = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const stats = computeMonthStats(transactions, year, month)
    result.push({
      month: format(d, 'MM/yyyy'),
      shortMonth: format(d, 'MMM'),
      income: stats.income,
      expense: stats.expense,
      saving: stats.saving,
      balance: stats.balance,
    })
  }
  return result
}

export function computeYearStats(transactions, year) {
  const result = []
  for (let m = 1; m <= 12; m++) {
    const stats = computeMonthStats(transactions, year, m)
    result.push({
      month: `T${m}`,
      income: stats.income,
      expense: stats.expense,
      saving: stats.saving,
      balance: stats.balance,
    })
  }
  return result
}

// Tính tổng cộng dồn cho nhiều năm
export function computeMultiYearStats(transactions, years) {
  let income = 0, expense = 0, saving = 0
  years.forEach(year => {
    for (let m = 1; m <= 12; m++) {
      const stats = computeMonthStats(transactions, year, m)
      income  += stats.income
      expense += stats.expense
      saving  += stats.saving
    }
  })
  return { income, expense, saving, balance: income - expense - saving }
}

export function groupTransactionsByDate(transactions) {
  const groups = {}
  transactions.forEach(t => {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, txs]) => ({ date, transactions: txs }))
}