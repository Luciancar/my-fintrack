import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'expense_tracker_transactions'
const VERSION_KEY = 'expense_tracker_version'
const CURRENT_VERSION = '2'  // bump this to clear old cache

export function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      // Clear old sample data from previous version
      const storedVersion = localStorage.getItem(VERSION_KEY)
      if (storedVersion !== CURRENT_VERSION) {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
        return []
      }
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const addTransaction = useCallback((tx) => {
    const newTx = { ...tx, id: Date.now().toString() }
    setTransactions(prev => [newTx, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
  }, [])

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateTransaction = useCallback((id, updates) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
        .sort((a, b) => b.date.localeCompare(a.date))
    )
  }, [])

  return { transactions, addTransaction, deleteTransaction, updateTransaction }
}
