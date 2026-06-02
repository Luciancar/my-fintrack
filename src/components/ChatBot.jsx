import React, { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { formatCurrency } from '../utils/format'
import { computeMonthStats, computeCategoryBreakdown } from '../utils/stats'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY

/* ── Build context string for Gemini ── */
function buildContext({ transactions, plans, year, month }) {
  const { income, expense, balance } = computeMonthStats(transactions, year, month)
  const breakdown = computeCategoryBreakdown(
    transactions.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
  )

  const breakdownText = breakdown.map(d => `  - ${d.label}: ${formatCurrency(d.amount)}`).join('\n')
  const plansText = plans.length > 0
    ? plans.map(p => `  - "${p.name}" ${p.icon}: mục tiêu ${formatCurrency(p.targetAmount)}, đã tiết kiệm ${formatCurrency(p.savedAmount || 0)}, deadline ${p.deadline || 'chưa đặt'}`).join('\n')
    : '  Chưa có kế hoạch nào.'

  return `Bạn là trợ lý tài chính thông minh tên FinBot của app FinTrack. Hãy tư vấn bằng tiếng Việt, thân thiện, ngắn gọn, dùng emoji phù hợp.

DỮ LIỆU TÀI CHÍNH THÁNG ${month}/${year}:
- Thu nhập: ${formatCurrency(income)}
- Chi tiêu: ${formatCurrency(expense)}
- Số dư: ${formatCurrency(balance)}
- Chi tiêu theo danh mục:
${breakdownText || '  Chưa có dữ liệu'}

KẾ HOẠCH TIẾT KIỆM:
${plansText}

Hãy dựa trên dữ liệu thực tế trên để tư vấn cụ thể. Nếu người dùng hỏi về kế hoạch tiết kiệm, hãy tính toán dựa trên thu nhập và chi tiêu hiện tại. Luôn đưa ra con số cụ thể.`
}

/* ── Message bubble ── */
function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom:10,
      animation:'fadeInUp 0.25s ease both',
    }}>
      {!isUser && (
        <div style={{
          width:28, height:28, borderRadius:9,
          background:'linear-gradient(135deg, #6366f1, #06b6d4)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, marginRight:8, flexShrink:0, alignSelf:'flex-end',
          boxShadow:'0 2px 8px rgba(99,102,241,0.4)',
        }}>🤖</div>
      )}
      <div style={{
        maxWidth:'78%',
        background: isUser
          ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
          : 'rgba(255,255,255,0.06)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.09)',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding:'10px 14px',
        fontSize:13, lineHeight:1.6,
        color: isUser ? '#fff' : 'var(--text)',
        boxShadow: isUser ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
        whiteSpace:'pre-wrap',
        wordBreak:'break-word',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

/* ── Typing indicator ── */
function Typing() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
      <div style={{ width:28, height:28, borderRadius:9, background:'linear-gradient(135deg,#6366f1,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, boxShadow:'0 2px 8px rgba(99,102,241,0.4)' }}>🤖</div>
      <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:'16px 16px 16px 4px', padding:'12px 16px', display:'flex', gap:4, alignItems:'center' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:6, height:6, borderRadius:'50%', background:'#818cf8',
            animation:`float ${0.5+i*0.15}s ease-in-out infinite alternate`,
          }}/>
        ))}
      </div>
    </div>
  )
}

const QUICK_PROMPTS = [
  '📊 Phân tích chi tiêu tháng này',
  '💡 Gợi ý tiết kiệm thêm',
  '🎯 Tôi có đạt kế hoạch không?',
  '✂️ Nên cắt giảm khoản nào?',
]

export default function ChatBot({ transactions, plans, year, month }) {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Xin chào! 👋 Tôi là FinBot — trợ lý tài chính AI của bạn.\n\nHỏi tôi bất cứ điều gì về thu chi, tiết kiệm hay kế hoạch tài chính nhé! 💰' }
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [pulse, setPulse]       = useState(false)
  const bottomRef = useRef()
  const inputRef  = useRef()
  const chatRef   = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, loading])

  // Pulse animation on new messages when closed
  useEffect(() => {
    if (!open && messages.length > 1) {
      setPulse(true)
      setTimeout(() => setPulse(false), 2000)
    }
  }, [messages.length])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')

    const userMsg = { role:'user', content: userText }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    if (!GEMINI_KEY) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role:'assistant',
          content:'⚠️ Chưa cấu hình Gemini API key. Vui lòng thêm VITE_GEMINI_KEY vào file .env.local và GitHub Secrets nhé!',
        }])
        setLoading(false)
      }, 500)
      return
    }

    try {
      const genAI  = new GoogleGenerativeAI(GEMINI_KEY)
      const model  = genAI.getGenerativeModel({ model:'gemini-1.5-flash' })
      const ctx    = buildContext({ transactions, plans, year, month })
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts:[{ text: m.content }],
      }))

      const chat   = model.startChat({ history, systemInstruction: ctx })
      const result = await chat.sendMessage(userText)
      const reply  = result.response.text()

      setMessages(prev => [...prev, { role:'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role:'assistant',
        content:`❌ Lỗi kết nối AI: ${err.message}\n\nVui lòng kiểm tra API key và thử lại.`,
      }])
    }
    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  return (
    <>
      {/* ── Floating button ── */}
      <div style={{ position:'fixed', bottom:28, right:28, zIndex:500 }}>
        {/* Pulse ring */}
        {pulse && (
          <div style={{
            position:'absolute', inset:-4, borderRadius:'50%',
            border:'2px solid rgba(99,102,241,0.6)',
            animation:'pulse-ring 1s ease-out forwards',
            pointerEvents:'none',
          }}/>
        )}
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            width:56, height:56, borderRadius:'50%',
            background: open
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border:'none', cursor:'pointer',
            boxShadow: open
              ? '0 8px 24px rgba(239,68,68,0.5)'
              : '0 8px 32px rgba(99,102,241,0.6)',
            fontSize:24,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.3s cubic-bezier(0.34,1.3,0.64,1)',
            transform: open ? 'scale(1.05) rotate(45deg)' : 'scale(1) rotate(0)',
            animation: !open ? 'float 3s ease-in-out infinite' : 'none',
          }}
        >{open ? '✕' : '🤖'}</button>

        {/* Unread badge */}
        {!open && messages.length > 1 && (
          <div style={{
            position:'absolute', top:-2, right:-2,
            width:18, height:18, borderRadius:'50%',
            background:'#ef4444',
            border:'2px solid var(--bg)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:9, fontWeight:700, color:'#fff',
          }}>{messages.length - 1}</div>
        )}
      </div>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position:'fixed', bottom:96, right:28, zIndex:499,
          width:360, height:520,
          background:'rgba(6,12,28,0.97)',
          backdropFilter:'blur(24px)',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:22,
          boxShadow:'0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
          display:'flex', flexDirection:'column',
          overflow:'hidden',
          animation:'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1) both',
        }}>
          {/* Header */}
          <div style={{
            padding:'14px 18px',
            borderBottom:'1px solid rgba(255,255,255,0.07)',
            background:'rgba(99,102,241,0.08)',
            display:'flex', alignItems:'center', gap:10,
            flexShrink:0,
          }}>
            <div style={{
              width:36, height:36, borderRadius:11,
              background:'linear-gradient(135deg, #6366f1, #06b6d4)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, boxShadow:'0 4px 12px rgba(99,102,241,0.5)',
              animation:'float2 4s ease-in-out infinite',
            }}>🤖</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:14 }}>FinBot AI</div>
              <div style={{ fontSize:11, color:'#34d399', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block', boxShadow:'0 0 6px #34d399' }}/>
                Đang hoạt động · Gemini AI
              </div>
            </div>
            <button
              onClick={() => setMessages([messages[0]])}
              title="Xóa lịch sử"
              style={{ background:'none', border:'none', color:'var(--text-dim)', fontSize:14, cursor:'pointer', padding:'4px 6px', borderRadius:6, transition:'color 0.15s' }}
              onMouseOver={e => e.currentTarget.style.color='var(--text-muted)'}
              onMouseOut={e => e.currentTarget.style.color='var(--text-dim)'}
            >🗑️</button>
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{ flex:1, overflowY:'auto', padding:'14px 14px 6px' }}>
            {messages.map((m, i) => <Bubble key={i} msg={m}/>)}
            {loading && <Typing/>}
            <div ref={bottomRef}/>
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div style={{ padding:'0 12px 8px', display:'flex', flexWrap:'wrap', gap:6 }}>
              {QUICK_PROMPTS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)',
                    borderRadius:20, padding:'5px 10px', fontSize:11, color:'#818cf8',
                    cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:500,
                    transition:'all 0.15s ease',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background='rgba(99,102,241,0.22)'; e.currentTarget.style.transform='scale(1.03)' }}
                  onMouseOut={e => { e.currentTarget.style.background='rgba(99,102,241,0.12)'; e.currentTarget.style.transform='scale(1)' }}
                >{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:'10px 14px 14px',
            borderTop:'1px solid rgba(255,255,255,0.07)',
            display:'flex', gap:8, alignItems:'flex-end',
            flexShrink:0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Hỏi về tài chính của bạn..."
              rows={1}
              style={{
                flex:1,
                background:'rgba(255,255,255,0.06)',
                border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:13, padding:'10px 14px',
                color:'var(--text)', fontSize:13,
                fontFamily:'Inter,sans-serif',
                outline:'none', resize:'none',
                lineHeight:1.5, maxHeight:80, overflowY:'auto',
                transition:'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
              onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width:38, height:38, borderRadius:11,
                background: loading || !input.trim()
                  ? 'rgba(99,102,241,0.3)'
                  : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                border:'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                color:'#fff', fontSize:16,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s ease', flexShrink:0,
                boxShadow: !loading && input.trim() ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                transform: !loading && input.trim() ? 'scale(1)' : 'scale(0.95)',
              }}
              onMouseOver={e => { if (!loading && input.trim()) e.currentTarget.style.transform='scale(1.08)' }}
              onMouseOut={e => e.currentTarget.style.transform='scale(1)'}
            >
              {loading ? (
                <span style={{ animation:'spin-slow 0.8s linear infinite', display:'inline-block', fontSize:14 }}>↻</span>
              ) : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
