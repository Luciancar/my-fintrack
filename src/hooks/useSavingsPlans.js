import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const LOCAL_KEY = 'fintrack_savings_plans'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] }
}

export function useSavingsPlans(user) {
  const [plans, setPlans] = useState(loadLocal)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase || !user) return
    setLoading(true)
    supabase.from('savings_plans').select('*').eq('user_id', user.id).order('created_at')
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(r => ({
            id: r.id, name: r.name, icon: r.icon,
            targetAmount: r.target_amount, savedAmount: r.saved_amount,
            deadline: r.deadline, color: r.color, note: r.note || '',
            createdAt: r.created_at,
          }))
          setPlans(mapped)
          localStorage.setItem(LOCAL_KEY, JSON.stringify(mapped))
        }
        setLoading(false)
      })
  }, [user])

  useEffect(() => {
    if (!user) localStorage.setItem(LOCAL_KEY, JSON.stringify(plans))
  }, [plans, user])

  const addPlan = useCallback(async (plan) => {
    const newPlan = { ...plan, id: Date.now().toString(), savedAmount: plan.savedAmount || 0, createdAt: new Date().toISOString() }
    setPlans(prev => [...prev, newPlan])
    if (supabase && user) {
      await supabase.from('savings_plans').insert({
        id: newPlan.id, user_id: user.id, name: newPlan.name, icon: newPlan.icon,
        target_amount: newPlan.targetAmount, saved_amount: newPlan.savedAmount,
        deadline: newPlan.deadline, color: newPlan.color, note: newPlan.note,
      })
    }
  }, [user])

  const updatePlan = useCallback(async (id, updates) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    if (supabase && user) {
      await supabase.from('savings_plans').update({
        name: updates.name, icon: updates.icon,
        target_amount: updates.targetAmount, saved_amount: updates.savedAmount,
        deadline: updates.deadline, color: updates.color, note: updates.note,
      }).eq('id', id).eq('user_id', user.id)
    }
  }, [user])

  const deletePlan = useCallback(async (id) => {
    setPlans(prev => prev.filter(p => p.id !== id))
    if (supabase && user) {
      await supabase.from('savings_plans').delete().eq('id', id).eq('user_id', user.id)
    }
  }, [user])

  const addSaving = useCallback(async (id, amount) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, savedAmount: (p.savedAmount || 0) + amount } : p))
    if (supabase && user) {
      const plan = plans.find(p => p.id === id)
      if (plan) {
        await supabase.from('savings_plans').update({ saved_amount: (plan.savedAmount || 0) + amount }).eq('id', id).eq('user_id', user.id)
      }
    }
  }, [user, plans])

  return { plans, loading, addPlan, updatePlan, deletePlan, addSaving }
}
