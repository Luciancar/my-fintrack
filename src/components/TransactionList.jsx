import React, { useState } from 'react'
import { getCategoryById } from '../data/categories'
import { formatCurrency, formatDate } from '../utils/format'
import { groupTransactionsByDate } from '../utils/stats'
import { parseISO, isToday, isYesterday } from 'date-fns'

function getDateLabel(dateStr) {
  const d = parseISO(dateStr)
  if (isToday(d)) return '📅 Hôm nay'
  if (isYesterday(d)) return '🕐 Hôm qua'
  return formatDate(dateStr)
}

function TransactionItem({ tx, onEdit, onDelete }) {
  const cat = getCategoryById(tx.categoryId)
  const [showMenu, setShowMenu] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation() // Chặn lan truyền sự kiện bấm lung tung
    setRemoving(true)
    setTimeout(() => onDelete(tx.id), 320)
  }

  const handleEdit = (e) => {
    e.stopPropagation() // Cô lập sự kiện sửa
    onEdit(tx)
    setShowMenu(false)
  }

  return (
    <div
      className="transaction-item-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px', 
        borderRadius: 12,
        transition: 'background 0.15s ease, transform 0.32s ease, opacity 0.32s ease',
        position: 'relative',
        opacity: removing ? 0 : 1,
        transform: removing ? 'translateX(30px)' : 'none',
        zIndex: showMenu ? 10 : 1, 
      }}
    >
      {/* Category icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${cat?.color || '#888'}18`,
        border: `1px solid ${cat?.color || '#888'}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 19, flexShrink: 0,
      }}
      >
        {cat?.icon || '📦'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 14, color: 'var(--text)',
          marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {tx.note || cat?.label || tx.categoryId}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
          {cat?.label}
          {tx.note && tx.note !== cat?.label && (
            <span style={{
              marginLeft: 6, padding: '1px 6px',
              background: `${cat?.color || '#888'}18`,
              borderRadius: 4, color: cat?.color,
              fontWeight: 600, fontSize: 10,
            }}>
              {cat?.icon} {cat?.label}
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div style={{
        fontWeight: 800, fontSize: 15,
        color: tx.type === 'income' ? '#10b981' : '#ef4444',
        flexShrink: 0,
        fontVariantNumeric: 'tabular-nums',
        textShadow: tx.type === 'income'
          ? '0 0 12px rgba(16,185,129,0.4)'
          : '0 0 12px rgba(239,68,68,0.4)',
      }}>
        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
      </div>

      {/* Context menu */}
      <div style={{ position: 'relative', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(v => !v)
          }}
          style={{
            background: showMenu ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: 'none',
            color: showMenu ? 'var(--text)' : 'var(--text-dim)',
            width: 36, height: 36, 
            borderRadius: 8,
            fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            cursor: 'pointer',
          }}
          className="menu-dots-btn"
        >⋮</button>

        {showMenu && (
          <>
            <div
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(false)
              }}
              style={{ position: 'fixed', inset: 0, zIndex: 299 }}
            />
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              background: 'rgba(12, 24, 44, 0.98)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              overflow: 'hidden',
              zIndex: 300,
              minWidth: 150, 
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(16px)',
            }}>
              <button
                onClick={handleEdit}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '12px 16px', 
                  background: 'none', border: 'none',
                  color: 'var(--text)', fontSize: 13.5, textAlign: 'left',
                  transition: 'background 0.12s',
                  cursor: 'pointer',
                }}
                className="dropdown-item-btn"
              >
                <span style={{ fontSize: 14 }}>✏️</span> Chỉnh sửa
              </button>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <button
                onClick={handleDelete}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '12px 16px', 
                  background: 'none', border: 'none',
                  color: '#f87171', fontSize: 13.5, textAlign: 'left',
                  transition: 'background 0.12s',
                  cursor: 'pointer',
                }}
                className="dropdown-delete-btn"
              >
                <span style={{ fontSize: 14 }}>🗑️</span> Xoá
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function TransactionList({ transactions, onEdit, onDelete }) {
  const [filter, setFilter] = useState('all')

  const filtered = transactions.filter(t => {
    if (filter === 'income') return t.type === 'income'
    if (filter === 'expense') return t.type === 'expense'
    return true
  })

  const groups = groupTransactionsByDate(filtered)
  const total = filtered.length

  return (
    <div className="glass-card transaction-list-card" style={{ overflow: 'visible' }}>
      {/* Tách phần hover CSS ra thẻ style độc lập để tối ưu UI */}
      <style>{`
        .transaction-item-row {
          background: transparent;
        }
        .transaction-item-row:hover {
          background: rgba(255,255,255,0.04) !important;
        }
        .menu-dots-btn:hover {
          background: rgba(255,255,255,0.08) !important;
          color: var(--text) !important;
        }
        .dropdown-item-btn:hover {
          background: rgba(255,255,255,0.07) !important;
        }
        .dropdown-delete-btn:hover {
          background: rgba(239,68,68,0.12) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 20px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '18px 18px 0 0',
      }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Lịch sử giao dịch</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {total} giao dịch
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 3,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 10, padding: 3,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { value: 'all',    label: 'Tất cả' },
            { value: 'income',  label: '↑ Thu' },
            { value: 'expense', label: '↓ Chi' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              style={{
                padding: '5px 13px',
                borderRadius: 7,
                border: 'none',
                background: filter === opt.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: filter === opt.value ? 'var(--text)' : 'var(--text-dim)',
                fontWeight: filter === opt.value ? 700 : 400,
                fontSize: 12,
                transition: 'all 0.18s ease',
                boxShadow: filter === opt.value ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        overflow: 'visible',
        padding: '6px 4px 8px',
        borderRadius: '0 0 18px 18px',
      }}>
        {groups.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 20px',
            color: 'var(--text-dim)',
          }}>
            <div style={{ fontSize: 44, marginBottom: 10, animation: 'float 3s ease-in-out infinite' }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Không có giao dịch</div>
            <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-dim)' }}>
              Thêm giao dịch đầu tiên của bạn
            </div>
          </div>
        ) : groups.map(group => (
          <div key={group.date}>
            {/* Date label */}
            <div style={{
              padding: '10px 16px 5px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {getDateLabel(group.date)}
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              <span style={{
                fontSize: 10, color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.06)',
                padding: '2px 7px', borderRadius: 5, fontWeight: 600,
              }}>
                {group.transactions.length}
              </span>
            </div>

            {/* List Row Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.transactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}