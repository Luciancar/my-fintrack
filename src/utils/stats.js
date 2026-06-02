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
  const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { income, expense, balance: income - expense, transactions: txs }
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
      balance: stats.balance,
    })
  }
  return result
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
