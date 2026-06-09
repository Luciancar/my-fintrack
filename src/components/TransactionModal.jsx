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
  const [savingNote, setSavingNote] = useState('')
  const [saving, setSaving] = useState(false)
  const backdropRef = useRef()

  useEffect(() => {
    if (editData) {
      setType(editData.type)
      setCategoryId(editData.categoryId || 'food')
      setAmount(String(editData.amount))
      setDate(editData.date)
      setNote(editData.note || '')
      setSavingNote(editData.savingNote || '')
    } else {
      setType('expense')
      setCategoryId('food')
      setAmount('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setNote('')
      setSavingNote('')
    }
  }, [editData, isOpen])

  useEffect(() => {
    if (type !== 'saving') {
      const filtered = CATEGORIES.filter(c => c.type === type)
      if (!filtered.find(c => c.id === categoryId)) {
        setCategoryId(filtered[0]?.id || '')
      }
    }
  }, [type])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const parsedAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10)
    if (!parsedAmount || parsedAmount <= 0) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 250))
    onSave({
      type,
      categoryId: type === 'saving' ? 'saving' : categoryId,
      amount: parsedAmount,
      date,
      note: note.trim(),
      savingNote: type === 'saving' ? savingNote.trim() : '',
    })
    setSaving(false)
    onClose()
  }

  const formatAmountDisplay = (raw) => {
    const num = parseInt(raw.replace(/[^0-9]/g, ''), 10)
    return isNaN(num) ? '' : num.toLocaleString('vi-VN')
  }

  const filteredCategories = CATEGORIES.filter(c => c.type === type)

  if (!isOpen) return null

  const TYPES = [
    { value: 'expense', label: '💸 Chi tiêu', color: '#ef4444' },
    { value: 'income',  label: '✅ Thu nhập',  color: '#10b981' },
    { value: 'saving',  label: '🏦 Tiết kiệm', color: '#06b6d4' },
  ]

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-input:focus { border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; }
      `}</style>

      <div style={{ background: 'rgba(12,24,44,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: '28px 28px 24px', width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.7)', animation: 'modalIn 0.22s cubic-bezier(0.34,1.2,0.64,1) both', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2, color: '#fff' }}>{editData ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch'}</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{editData ? 'Cập nhật thông tin giao dịch' : 'Ghi lại khoản thu chi mới'}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', width: 32, height: 32, borderRadius: 8, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Loại giao dịch</label>
            <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
              {TYPES.map(opt => (
                <button key={opt.value} type="button" onClick={() => setType(opt.value)} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', background: type === opt.value ? `${opt.color}25` : 'transparent', color: type === opt.value ? opt.color : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category — chỉ hiện khi không phải saving */}
          {type !== 'saving' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Danh mục</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {filteredCategories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 8, border: `1px solid ${categoryId === cat.id ? cat.color + '70' : 'rgba(255,255,255,0.08)'}`, background: categoryId === cat.id ? `${cat.color}18` : 'rgba(255,255,255,0.03)', color: categoryId === cat.id ? cat.color : 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer' }}>
                    <span>{cat.icon}</span><span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saving: mục đích */}
          {type === 'saving' && (
            <div style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: '#06b6d4', fontWeight: 600, marginBottom: 8 }}>🏦 Khoản tiết kiệm</div>
              <input
                type="text"
                placeholder="Mục đích tiết kiệm (VD: Mua xe, Du lịch...)"
                value={savingNote}
                onChange={e => setSavingNote(e.target.value)}
                className="modal-input"
                style={{ ...inputStyle, fontSize: 13 }}
                maxLength={80}
              />
            </div>
          )}

          {/* Amount */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Số tiền (VNĐ)</label>
            <div style={{ position: 'relative' }}>
              <input type="text" inputMode="numeric" placeholder="0" value={formatAmountDisplay(amount)} onChange={e => setAmount(e.target.value)} className="modal-input" style={{ ...inputStyle, fontSize: 20, fontWeight: 700, paddingRight: 52 }} required />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>VNĐ</span>
            </div>
          </div>

          {/* Date + Note */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Ngày</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="modal-input" style={{ ...inputStyle, colorScheme: 'dark' }} required />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Ghi chú</label>
              <input type="text" placeholder="Mô tả ngắn (tuỳ chọn)" value={note} onChange={e => setNote(e.target.value)} className="modal-input" style={inputStyle} maxLength={80} />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ background: type === 'saving' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : type === 'income' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: 13, padding: '13px 0', fontSize: 15, fontWeight: 700, marginTop: 4, cursor: 'pointer' }}>
            {saving ? '⏳ Đang lưu...' : editData ? '✓ Cập nhật' : '＋ Thêm giao dịch'}
          </button>
        </form>
      </div>
    </div>
  )
}
