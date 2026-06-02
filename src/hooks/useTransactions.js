import { useState, useEffect, useCallback } from 'react'
import { generateSampleData } from '../data/sampleData'

const STORAGE_KEY = 'expense_tracker_transactions'

export function useTransactions() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    const sample = generateSampleData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample))
    return sample
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
