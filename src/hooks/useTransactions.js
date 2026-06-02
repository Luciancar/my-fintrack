import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LOCAL_KEY = 'expense_tracker_transactions'
const VERSION_KEY = 'expense_tracker_version'
const CURRENT_VERSION = '2'

/* ── helpers ── */
function loadLocal() {
  try {
    const v = localStorage.getItem(VERSION_KEY)
    if (v !== CURRENT_VERSION) {
      localStorage.removeItem(LOCAL_KEY)
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      return []
    }
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocal(txs) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(txs)) } catch {}
}

export function useTransactions(user) {
  const [transactions, setTransactions] = useState(loadLocal)
  const [syncing, setSyncing] = useState(false)

  /* ── Fetch from Supabase when user logs in ── */
  useEffect(() => {
    if (!supabase || !user) return

    setSyncing(true)
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped = data.map(r => ({
            id: r.id,
            type: r.type,
            categoryId: r.category_id,
            amount: r.amount,
            date: r.date,
            note: r.note || '',
          }))
          setTransactions(mapped)
          saveLocal(mapped)
        }
        setSyncing(false)
      })
  }, [user])

  /* ── Persist locally whenever transactions change (no user) ── */
  useEffect(() => {
    if (!user) saveLocal(transactions)
  }, [transactions, user])

  /* ── Add ── */
  const addTransaction = useCallback(async (tx) => {
    const newTx = { ...tx, id: Date.now().toString() }
    setTransactions(prev => [newTx, ...prev].sort((a, b) => b.date.localeCompare(a.date)))

    if (supabase && user) {
      await supabase.from('transactions').insert({
        id: newTx.id,
        user_id: user.id,
        type: newTx.type,
        category_id: newTx.categoryId,
        amount: newTx.amount,
        date: newTx.date,
        note: newTx.note || '',
      })
    }
  }, [user])

  /* ── Delete ── */
  const deleteTransaction = useCallback(async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id))

    if (supabase && user) {
      await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
    }
  }, [user])

  /* ── Update ── */
  const updateTransaction = useCallback(async (id, updates) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
          .sort((a, b) => b.date.localeCompare(a.date))
    )

    if (supabase && user) {
      await supabase.from('transactions').update({
        type: updates.type,
        category_id: updates.categoryId,
        amount: updates.amount,
        date: updates.date,
        note: updates.note || '',
      }).eq('id', id).eq('user_id', user.id)
    }
  }, [user])

  return { transactions, syncing, addTransaction, deleteTransaction, updateTransaction }
}
