import React, { useState, useEffect, useRef } from 'react'
import { CATEGORIES } from '../data/categories'
import { format } from 'date-fns'

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: '11px 14px',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
}

export default function TransactionModal({ isOpen, onClose, onSave, editData }) {
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('food')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const backdropRef = useRef()

  useEffect(() => {
    if (editData) {
      setType(editData.type)
      setCategoryId(editData.categoryId)
      setAmount(String(editData.amount))
      setDate(editData.date)
      setNote(editData.note || '')
    } else {
      setType('expense')
      setCategoryId('food')
      setAmount('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setNote('')
    }
  }, [editData, isOpen])

  useEffect(() => {
    const filtered = CATEGORIES.filter(c => c.type === type)
    if (!filtered.find(c => c.id === categoryId)) {
      setCategoryId(filtered[0]?.id || '')
    }
  }, [type])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10)
    if (!parsedAmount || parsedAmount <= 0) return

    setSaving(true)
    await new Promise(r => setTimeout(r, 250))
    onSave({ type, categoryId, amount: parsedAmount, date, note: note.trim() })
    setSaving(false)
    onClose()
  }

  const formatAmountDisplay = (raw) => {
    const num = parseInt(raw.replace(/[^0-9]/g, ''), 10)
    return isNaN(num) ? '' : num.toLocaleString('vi-VN')
  }

  const filteredCategories = CATEGORIES.filter(c => c.type === type)

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        background: 'rgba(12,24,44,0.98)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 22, padding: '28px', width: '100%', maxWidth: 480,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
          {editData ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Loại giao dịch */}
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
            {[
              { value: 'expense', label: '💸 Chi tiêu', color: '#ef4444' },
              { value: 'income',  label: '💹 Thu nhập', color: '#10b981' },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => setType(opt.value)} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                background: type === opt.value ? `${opt.color}20` : 'transparent',
                color: type === opt.value ? opt.color : 'var(--text-dim)', fontWeight: 700
              }}>{opt.label}</button>
            ))}
          </div>

          {/* Danh mục */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {filteredCategories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} style={{
                padding: '6px 11px', borderRadius: 8, border: 'none',
                background: categoryId === cat.id ? `${cat.color}30` : 'rgba(255,255,255,0.03)',
                color: categoryId === cat.id ? cat.color : '#888'
              }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Số tiền */}
          <input type="text" placeholder="0 VNĐ" value={formatAmountDisplay(amount)} onChange={e => setAmount(e.target.value)} style={inputStyle} required />

          {/* Ngày - ĐÃ BỎ GIỚI HẠN MAX */}
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} required />

          <button type="submit" disabled={saving} style={{ 
            background: '#6366f1', color: '#fff', border: 'none', borderRadius: 13, padding: '13px', fontWeight: 700 
          }}>
            {saving ? 'Đang lưu...' : 'Lưu giao dịch'}
          </button>
        </form>
      </div>
    </div>
  )
}