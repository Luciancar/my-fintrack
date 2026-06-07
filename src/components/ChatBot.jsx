import React, { useState } from 'react'

export default function ChatBot() {
  const [open, setOpen] = useState(false)

  // Thông báo bảo trì
  const MAINTENANCE_MSG = "🛠️ Chatbot đang bảo trì. Vui lòng quay lại sau!"

  return (
    <>
      {/* ── Floating button (giữ nguyên icon bot) ── */}
      <div style={{ position:'fixed', bottom:28, right:28, zIndex:500 }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            width:56, height:56, borderRadius:'50%',
            background: open ? '#dc2626' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border:'none', cursor:'pointer',
            boxShadow: open ? '0 8px 24px rgba(239,68,68,0.5)' : '0 8px 32px rgba(99,102,241,0.6)',
            fontSize:24,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.3s ease',
            transform: open ? 'scale(1.05) rotate(45deg)' : 'scale(1)',
          }}
        >
          {open ? '✕' : '🤖'}
        </button>
      </div>

      {/* ── Thông báo bảo trì (thay thế panel chat) ── */}
      {open && (
        <div style={{
          position:'fixed', bottom:96, right:28, zIndex:499,
          width:300, padding:'20px',
          background:'rgba(6,12,28,0.95)',
          backdropFilter:'blur(24px)',
          border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:16,
          boxShadow:'0 10px 30px rgba(0,0,0,0.5)',
          color:'#fff',
          fontSize:14,
          textAlign:'center',
          animation:'slideUp 0.3s ease-out'
        }}>
          {MAINTENANCE_MSG}
        </div>
      )}
    </>
  )
}