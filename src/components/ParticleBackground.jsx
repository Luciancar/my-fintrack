import React, { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let W, H, mouse = { x: -999, y: -999 }

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY })

    const PALETTE = ['#6366f1','#818cf8','#a78bfa','#06b6d4','#10b981','#3b82f6']

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x    = Math.random() * W
        this.y    = Math.random() * H
        this.r    = Math.random() * 2.2 + 0.4
        this.vx   = (Math.random() - 0.5) * 0.35
        this.vy   = (Math.random() - 0.5) * 0.35
        this.life = Math.random() * Math.PI * 2
        this.speed= Math.random() * 0.008 + 0.004
        this.color= PALETTE[Math.floor(Math.random() * PALETTE.length)]
        this.alpha= Math.random() * 0.55 + 0.15
      }
      update() {
        this.life += this.speed
        // mouse repulsion
        const dx = this.x - mouse.x, dy = this.y - mouse.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist < 100) {
          this.vx += (dx / dist) * 0.15
          this.vy += (dy / dist) * 0.15
        }
        this.vx *= 0.99; this.vy *= 0.99
        this.x += this.vx; this.y += this.vy
        if (this.x < 0) this.x = W
        if (this.x > W) this.x = 0
        if (this.y < 0) this.y = H
        if (this.y > H) this.y = 0
      }
      draw() {
        const pulse = Math.sin(this.life) * 0.4 + 0.6
        const r = this.r * pulse
        const a = this.alpha * pulse

        // outer glow
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 6)
        g.addColorStop(0, this.color + 'aa')
        g.addColorStop(1, this.color + '00')
        ctx.beginPath()
        ctx.arc(this.x, this.y, r * 6, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.globalAlpha = a * 0.5
        ctx.fill()

        // core
        ctx.beginPath()
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = Math.min(a + 0.3, 0.95)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    const particles = Array.from({ length: 80 }, () => new Particle())

    // Connections
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d  = Math.sqrt(dx*dx + dy*dy)
          if (d < 110) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(99,102,241,${(1 - d/110) * 0.12})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }
    }

    // Rotating aurora blobs
    let t = 0
    function drawAurora() {
      t += 0.003
      const blobs = [
        { x: W*0.2 + Math.sin(t*0.7)*W*0.08, y: H*0.15 + Math.cos(t*0.5)*H*0.06, r: W*0.28, color: '99,102,241', a: 0.07 },
        { x: W*0.8 + Math.cos(t*0.6)*W*0.07, y: H*0.75 + Math.sin(t*0.8)*H*0.05, r: W*0.25, color: '6,182,212',  a: 0.06 },
        { x: W*0.5 + Math.sin(t*0.4)*W*0.10, y: H*0.5  + Math.cos(t*0.9)*H*0.08, r: W*0.20, color: '16,185,129', a: 0.05 },
        { x: W*0.15+ Math.cos(t*0.9)*W*0.06, y: H*0.8  + Math.sin(t*0.3)*H*0.07, r: W*0.22, color: '139,92,246', a: 0.05 },
      ]
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, `rgba(${b.color},${b.a})`)
        g.addColorStop(1, `rgba(${b.color},0)`)
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })
    }

    function loop() {
      ctx.clearRect(0, 0, W, H)
      drawAurora()
      drawConnections()
      particles.forEach(p => { p.update(); p.draw() })
      animId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    }} />
  )
}
