import React, { useState } from 'react'
import { formatCurrency } from '../utils/format'
import { differenceInDays, differenceInMonths, parseISO, format } from 'date-fns'

const PLAN_ICONS = ['🏖️','🚗','🏠','💻','📱','✈️','🎓','💍','🛒','🎮','🏋️','🎸','📷','⌚','👜','🧳']
const PLAN_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#a78bfa','#f97316','#ec4899','#84cc16','#14b8a6']

const lbl = { display:'block', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' }
const inp = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:11, padding:'11px 14px', color:'#f0f6ff', fontSize:14, outline:'none', fontFamily:'Inter,sans-serif', boxSizing:'border-box' }

function PlanModal({ isOpen, onClose, onSave, editData, avgMonthlyIncome }) {
  const [name, setName]         = useState(editData?.name || '')
  const [icon, setIcon]         = useState(editData?.icon || '🏖️')
  const [target, setTarget]     = useState(editData?.targetAmount ? String(editData.targetAmount) : '')
  const [saved, setSaved]       = useState(editData?.savedAmount ? String(editData.savedAmount) : '0')
  const [deadline, setDeadline] = useState(editData?.deadline || '')
  const [color, setColor]       = useState(editData?.color || '#6366f1')
  const [note, setNote]         = useState(editData?.note || '')
  const [interestRate, setInterestRate] = useState(editData?.interestRate ? String(editData.interestRate) : '')

  const targetNum = parseInt(target.replace(/\D/g,''), 10) || 0
  const savedNum  = parseInt(saved.replace(/\D/g,''), 10) || 0
  const rateNum   = parseFloat(interestRate.replace(',','.')) || 0
  const remaining = Math.max(0, targetNum - savedNum)
  const monthsLeft = deadline ? Math.max(1, differenceInMonths(parseISO(deadline), new Date()) + 1) : null
  const monthlyNeeded = monthsLeft ? Math.ceil(remaining / monthsLeft) : null
  const feasible = monthlyNeeded && avgMonthlyIncome > 0 ? (monthlyNeeded / avgMonthlyIncome) * 100 : null

  // Tính số tiền thực tế cần trả mỗi tháng khi có lãi suất (công thức PMT)
  const monthlyWithInterest = (() => {
    if (!monthlyNeeded || !rateNum || !monthsLeft) return null
    const r = rateNum / 100 / 12
    if (r === 0) return monthlyNeeded
    const pmt = (remaining * r * Math.pow(1 + r, monthsLeft)) / (Math.pow(1 + r, monthsLeft) - 1)
    return Math.ceil(pmt)
  })()

  const fmt = (v) => { const n = parseInt(v.replace(/\D/g,''),10); return isNaN(n) ? '' : n.toLocaleString('vi-VN') }

  if (!isOpen) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', zIndex:1001, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'rgba(8,18,36,0.98)', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:22, padding:'28px 28px 24px', width:'100%', maxWidth:500,
        boxShadow:'0 24px 80px rgba(0,0,0,0.7)',
        position:'relative', maxHeight:'90vh', overflowY:'auto',
      }}>
        <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:200, height:1, background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.7),transparent)' }}/>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:800, color:'#fff' }}>{editData ? '✏️ Chỉnh sửa kế hoạch' : '🎯 Tạo kế hoạch tiết kiệm'}</h2>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Đặt mục tiêu và theo dõi tiến độ</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', width:32, height:32, borderRadius:8, fontSize:16, cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Name */}
          <div>
            <label style={lbl}>Tên kế hoạch</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="VD: Đi Nhật Bản, Mua MacBook..." style={inp} />
          </div>

          {/* Icon picker */}
          <div>
            <label style={lbl}>Icon</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {PLAN_ICONS.map(ic => (
                <button key={ic} type="button" onClick={()=>setIcon(ic)} style={{
                  width:40, height:40, borderRadius:10,
                  border:`2px solid ${icon===ic ? color : 'rgba(255,255,255,0.1)'}`,
                  background: icon===ic ? `${color}25` : 'rgba(255,255,255,0.04)',
                  fontSize:20, cursor:'pointer', transition:'all 0.15s',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transform: icon===ic ? 'scale(1.1)' : 'scale(1)',
                  lineHeight:1,
                }}>{ic}</button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label style={lbl}>Màu sắc</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {PLAN_COLORS.map(c => (
                <button key={c} type="button" onClick={()=>setColor(c)} style={{
                  width:26, height:26, borderRadius:'50%', background:c,
                  border:`3px solid ${color===c ? '#fff' : 'transparent'}`,
                  cursor:'pointer', transition:'all 0.15s',
                  transform: color===c ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: color===c ? `0 0 10px ${c}` : 'none',
                }}/>
              ))}
            </div>
          </div>

          {/* Target + Saved */}
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:1 }}>
              <label style={lbl}>Số tiền mục tiêu (đ)</label>
              <input value={fmt(target)} onChange={e=>setTarget(e.target.value)} placeholder="10.000.000" style={inp} inputMode="numeric" />
            </div>
            <div style={{ flex:1 }}>
              <label style={lbl}>Đã tiết kiệm được (đ)</label>
              <input value={fmt(saved)} onChange={e=>setSaved(e.target.value)} placeholder="0" style={inp} inputMode="numeric" />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label style={lbl}>Deadline</label>
            <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} min={format(new Date(),'yyyy-MM-dd')} style={{ ...inp, colorScheme:'dark' }} />
          </div>

          {/* Lãi suất */}
          <div>
            <label style={lbl}>Lãi suất (%/năm) <span style={{ color:'rgba(255,255,255,0.3)', fontWeight:400, textTransform:'none', letterSpacing:0 }}>— để trống nếu không có</span></label>
            <input
              value={interestRate}
              onChange={e => setInterestRate(e.target.value)}
              placeholder="VD: 8.5 (tức 8.5%/năm)"
              style={inp}
              inputMode="decimal"
            />
          </div>

          {/* Note */}
          <div>
            <label style={lbl}>Ghi chú</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Mua vé máy bay, đặt khách sạn..." style={inp} maxLength={100}/>
          </div>

          {/* Smart estimate */}
          {monthlyNeeded !== null && (
            <div style={{
              background: feasible > 50 ? 'rgba(239,68,68,0.1)' : feasible > 30 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
              border: `1px solid ${feasible > 50 ? 'rgba(239,68,68,0.3)' : feasible > 30 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
              borderRadius:12, padding:'12px 16px',
            }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:6, color: feasible > 50 ? '#f87171' : feasible > 30 ? '#fbbf24' : '#34d399' }}>
                {feasible > 50 ? '⚠️ Khó khả thi' : feasible > 30 ? '🟡 Cần cố gắng' : '✅ Khả thi'}
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
                {rateNum > 0 && monthlyWithInterest ? (
                  <>
                    <div>Không lãi: <strong style={{ color:'#f1f5f9' }}>{formatCurrency(monthlyNeeded)}/tháng</strong></div>
                    <div>Có lãi {rateNum}%/năm: <strong style={{ color:'#fbbf24' }}>{formatCurrency(monthlyWithInterest)}/tháng</strong></div>
                    <div style={{ marginTop:4, color:'rgba(255,255,255,0.35)', fontSize:11 }}>Tổng trả: {formatCurrency(monthlyWithInterest * monthsLeft)} (lãi: {formatCurrency(monthlyWithInterest * monthsLeft - remaining)})</div>
                  </>
                ) : (
                  <div>Cần tiết kiệm <strong style={{ color:'#f1f5f9' }}>{formatCurrency(monthlyNeeded)}/tháng</strong> trong <strong style={{ color:'#f1f5f9' }}>{monthsLeft} tháng</strong></div>
                )}
                {avgMonthlyIncome > 0 && feasible !== null && (
                  <div style={{ marginTop:2 }}>Chiếm <strong style={{ color: feasible > 50 ? '#f87171' : '#fbbf24' }}>{feasible.toFixed(0)}%</strong> thu nhập</div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (!name || !target) return
              onSave({ name, icon, targetAmount: targetNum, savedAmount: savedNum, deadline, color, note, interestRate: rateNum })
              onClose()
            }}
            style={{ background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'#fff', border:'none', borderRadius:13, padding:'13px 0', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(99,102,241,0.45)', marginTop:4 }}
          >{editData ? '✓ Cập nhật' : '🎯 Tạo kế hoạch'}</button>
        </div>
      </div>
    </div>
  )
}

function AddSavingModal({ isOpen, plan, onClose, onAdd }) {
  const [amount, setAmount] = useState('')
  if (!isOpen || !plan) return null
  const num = parseInt(amount.replace(/\D/g,''),10) || 0
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', zIndex:1002, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'rgba(8,18,36,0.98)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'24px', width:'100%', maxWidth:360, boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
        <h3 style={{ fontSize:16, fontWeight:800, marginBottom:4, color:'#fff' }}>{plan.icon} Nạp tiền tiết kiệm</h3>
        <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:18 }}>{plan.name}</p>
        <label style={lbl}>Số tiền nạp (đ)</label>
        <input
          value={num ? num.toLocaleString('vi-VN') : ''}
          onChange={e => setAmount(e.target.value)}
          placeholder="Nhập số tiền..."
          inputMode="numeric"
          autoFocus
          style={{ ...inp, fontSize:20, fontWeight:700, marginBottom:16 }}
        />
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onClose} style={{ flex:1, padding:'11px 0', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:11, color:'rgba(255,255,255,0.5)', fontSize:14, cursor:'pointer' }}>Huỷ</button>
          <button onClick={() => { if (num > 0) { onAdd(plan.id, num); onClose() } }} style={{ flex:2, padding:'11px 0', background:'linear-gradient(135deg, #6366f1, #4f46e5)', border:'none', borderRadius:11, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(99,102,241,0.4)' }}>
            + Nạp {num ? formatCurrency(num) : 'tiền'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ plan, avgMonthlyIncome, onEdit, onDelete, onAddSaving }) {
  const [hovered, setHovered] = useState(false)
  const pct = plan.targetAmount > 0 ? Math.min((plan.savedAmount / plan.targetAmount) * 100, 100) : 0
  const remaining = Math.max(0, plan.targetAmount - plan.savedAmount)
  const daysLeft = plan.deadline ? differenceInDays(parseISO(plan.deadline), new Date()) : null
  const monthsLeft = plan.deadline ? Math.max(1, differenceInMonths(parseISO(plan.deadline), new Date()) + 1) : null
  const monthlyNeeded = monthsLeft && remaining > 0 ? Math.ceil(remaining / monthsLeft) : 0
  const done = pct >= 100

  // Tính lãi nếu có
  const monthlyWithInterest = (() => {
    if (!monthlyNeeded || !plan.interestRate || !monthsLeft) return null
    const r = plan.interestRate / 100 / 12
    if (r === 0) return null
    const pmt = (remaining * r * Math.pow(1 + r, monthsLeft)) / (Math.pow(1 + r, monthsLeft) - 1)
    return Math.ceil(pmt)
  })()

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)',
        border:`1px solid ${hovered ? plan.color + '50' : 'rgba(255,255,255,0.08)'}`,
        borderTop:`2px solid ${plan.color}`,
        borderRadius:18, padding:'20px',
        transition:'all 0.3s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 16px 48px rgba(0,0,0,0.4), 0 0 24px ${plan.color}20` : '0 4px 20px rgba(0,0,0,0.3)',
        position:'relative', overflow:'hidden',
      }}
    >
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 80% 50% at 10% 0%, ${plan.color}10 0%, transparent 70%)`, pointerEvents:'none' }}/>
      {done && <div style={{ position:'absolute', top:8, right:8, fontSize:20 }}>🎉</div>}

      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:44, height:44, borderRadius:13,
              background:`${plan.color}20`, border:`1px solid ${plan.color}40`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, lineHeight:1,
              transition:'transform 0.3s ease',
              transform: hovered ? 'scale(1.15) rotate(5deg)' : 'scale(1)',
            }}>{plan.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#fff' }}>{plan.name}</div>
              {plan.note && <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:1 }}>{plan.note}</div>}
              {plan.interestRate > 0 && <div style={{ fontSize:10, color:'#fbbf24', marginTop:2 }}>💰 Lãi suất {plan.interestRate}%/năm</div>}
            </div>
          </div>
          <div style={{ display:'flex', gap:5 }}>
            <button onClick={() => onAddSaving(plan)} style={{ background:`${plan.color}20`, border:`1px solid ${plan.color}40`, borderRadius:8, padding:'5px 10px', color:plan.color, fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Nạp</button>
            <button onClick={() => onEdit(plan)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:7, width:28, height:28, color:'rgba(255,255,255,0.5)', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✏️</button>
            <button onClick={() => onDelete(plan.id)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:7, width:28, height:28, color:'#f87171', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>🗑️</button>
          </div>
        </div>

        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:13 }}>
              <span style={{ color:plan.color, fontWeight:800, fontSize:16 }}>{formatCurrency(plan.savedAmount)}</span>
              <span style={{ color:'rgba(255,255,255,0.3)' }}> / {formatCurrency(plan.targetAmount)}</span>
            </span>
            <span style={{ fontSize:13, fontWeight:700, color: done ? '#10b981' : plan.color }}>{pct.toFixed(0)}%</span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:99, height:8, overflow:'hidden' }}>
            <div style={{
              width:`${pct}%`, height:'100%', borderRadius:99,
              background: done ? 'linear-gradient(90deg, #10b981, #34d399)' : `linear-gradient(90deg, ${plan.color}99, ${plan.color})`,
              boxShadow: `0 0 12px ${plan.color}80`,
              transition:'width 1.2s ease',
            }}/>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {remaining > 0 && (
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'5px 10px', fontSize:11 }}>
              <span style={{ color:'rgba(255,255,255,0.4)' }}>Còn thiếu </span>
              <span style={{ color:'#f87171', fontWeight:700 }}>{formatCurrency(remaining)}</span>
            </div>
          )}
          {daysLeft !== null && !done && (
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'5px 10px', fontSize:11 }}>
              <span style={{ color:'rgba(255,255,255,0.4)' }}>Còn </span>
              <span style={{ color: daysLeft < 30 ? '#f87171' : plan.color, fontWeight:700 }}>
                {daysLeft < 0 ? 'Quá hạn' : `${daysLeft} ngày`}
              </span>
            </div>
          )}
          {monthlyWithInterest && !done ? (
            <div style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:8, padding:'5px 10px', fontSize:11 }}>
              <span style={{ color:'rgba(255,255,255,0.4)' }}>Cần trả </span>
              <span style={{ color:'#fbbf24', fontWeight:700 }}>{formatCurrency(monthlyWithInterest)}/tháng</span>
            </div>
          ) : monthlyNeeded > 0 && !done ? (
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'5px 10px', fontSize:11 }}>
              <span style={{ color:'rgba(255,255,255,0.4)' }}>Cần </span>
              <span style={{ color:'#fbbf24', fontWeight:700 }}>{formatCurrency(monthlyNeeded)}/tháng</span>
            </div>
          ) : null}
          {done && (
            <div style={{ background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:8, padding:'5px 12px', fontSize:11, color:'#34d399', fontWeight:700 }}>
              🎯 Đã đạt mục tiêu!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SavingsPlans({ plans, onAdd, onUpdate, onDelete, onAddSaving, avgMonthlyIncome }) {
  const [modalOpen, setModalOpen]     = useState(false)
  const [editPlan, setEditPlan]       = useState(null)
  const [savingModal, setSavingModal] = useState(null)

  const handleEdit = (plan) => { setEditPlan(plan); setModalOpen(true) }
  const handleClose = () => { setModalOpen(false); setEditPlan(null) }
  const handleSave = (data) => { if (editPlan) onUpdate(editPlan.id, data); else onAdd(data) }

  const totalTarget = plans.reduce((s,p) => s + p.targetAmount, 0)
  const totalSaved  = plans.reduce((s,p) => s + p.savedAmount, 0)
  const overallPct  = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.3px', marginBottom:3, background:'linear-gradient(135deg, #f0f6ff, #818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>🎯 Kế hoạch tiết kiệm</h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Đặt mục tiêu và theo dõi tiến độ tài chính</p>
        </div>
        <button onClick={() => setModalOpen(true)} style={{ display:'flex', alignItems:'center', gap:7, background:'linear-gradient(135deg, #6366f1, #4f46e5)', color:'#fff', border:'none', borderRadius:11, padding:'9px 18px', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(99,102,241,0.4)' }}>
          ＋ Tạo kế hoạch
        </button>
      </div>

      {plans.length > 0 && (
        <div className="glass-card" style={{ padding:'16px 20px', marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>Tổng tiến độ — {plans.length} kế hoạch</span>
            <span style={{ fontSize:13, fontWeight:700, color:'#818cf8' }}>{overallPct.toFixed(0)}%</span>
          </div>
          <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:99, height:6 }}>
            <div style={{ width:`${overallPct}%`, height:'100%', borderRadius:99, background:'linear-gradient(90deg, #6366f1, #818cf8, #06b6d4)', boxShadow:'0 0 12px rgba(99,102,241,0.5)', transition:'width 1s ease' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11, color:'rgba(255,255,255,0.4)' }}>
            <span>Đã tiết kiệm: <strong style={{ color:'#10b981' }}>{formatCurrency(totalSaved)}</strong></span>
            <span>Mục tiêu: <strong style={{ color:'#f1f5f9' }}>{formatCurrency(totalTarget)}</strong></span>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="glass-card" style={{ textAlign:'center', padding:'52px 24px' }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🎯</div>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:6, color:'#fff' }}>Chưa có kế hoạch nào</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Tạo kế hoạch đầu tiên để bắt đầu tiết kiệm</div>
          <button onClick={() => setModalOpen(true)} style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:11, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer' }}>🚀 Tạo kế hoạch đầu tiên</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
          {plans.map(p => (
            <PlanCard key={p.id} plan={p} avgMonthlyIncome={avgMonthlyIncome} onEdit={handleEdit} onDelete={onDelete} onAddSaving={(plan) => setSavingModal(plan)} />
          ))}
        </div>
      )}

      <PlanModal isOpen={modalOpen} onClose={handleClose} onSave={handleSave} editData={editPlan} avgMonthlyIncome={avgMonthlyIncome}/>
      <AddSavingModal isOpen={!!savingModal} plan={savingModal} onClose={() => setSavingModal(null)} onAdd={onAddSaving}/>
    </div>
  )
}
