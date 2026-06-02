import React, { useEffect, useRef } from 'react'

export default function ParticleBackground() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let W = window.innerWidth
    let H = window.innerHeight

    canvas.width  = W
    canvas.height = H

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = W
      canvas.height = H
    }
    window.addEventListener('resize', resize)

    // Particles
    const COLORS = ['#6366f1', '#818cf8', '#06b6d4', '#10b981', '#a78bfa']
    const particles = Array.from({ length: 55 }, () => makeParticle(W, H, COLORS))

    function makeParticle(W, H, COLORS) {
      return {
        x: Math.random() * W,
        y: Math.random() * H + H,
        r: Math.random() * 2.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.2),
        alpha: Math.random() * 0.5 + 0.15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
      }
    }

    // Connection lines
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            const alpha = (1 - dist / 120) * 0.08
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      drawConnections()

      particles.forEach(p => {
        p.pulse += p.pulseSpeed
        const pulsedR = p.r + Math.sin(p.pulse) * 0.5
        const pulsedAlpha = p.alpha + Math.sin(p.pulse) * 0.08

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsedR * 4)
        gradient.addColorStop(0, p.color + Math.round(pulsedAlpha * 255).toString(16).padStart(2,'0'))
        gradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, pulsedR * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, pulsedR, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(Math.min(pulsedAlpha + 0.3, 1) * 255).toString(16).padStart(2,'0')
        ctx.fill()

        // Move
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W }
        if (p.x < -20) p.x = W + 20
        if (p.x > W + 20) p.x = -20
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    />
  )
}
