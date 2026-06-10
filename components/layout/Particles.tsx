"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  w: number
  h: number
  color: string
  angle: number
  angularV: number
  vy: number        // falling speed
  vx: number        // slight horizontal drift
  opacity: number
}

// Equal mix of all Google colors — matches video exactly
const COLORS = [
  "#4285F4", // blue
  "#3367D6", // dark blue
  "#EA4335", // red
  "#C62828", // dark red
  "#FBBC05", // yellow
  "#F57F17", // dark yellow
  "#34A853", // green
  "#1B5E20", // dark green
  "#9C27B0", // purple
  "#FF7043", // orange
]

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // ~150 short rectangular dashes falling like confetti
    const COUNT = 150
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: rand(0, window.innerWidth),
      y: rand(-window.innerHeight, window.innerHeight), // stagger start
      w: rand(6, 14),    // short dash width
      h: rand(2, 4),     // thin dash height
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: rand(0, Math.PI * 2),
      angularV: rand(-0.03, 0.03),  // slow tumble
      vy: rand(0.6, 1.8),           // falling down
      vx: rand(-0.3, 0.3),          // slight sway
      opacity: rand(0.4, 0.85),
    }))

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        // Rounded rectangle dash
        const r = p.h / 2
        ctx.beginPath()
        ctx.moveTo(-p.w / 2 + r, -p.h / 2)
        ctx.lineTo(p.w / 2 - r, -p.h / 2)
        ctx.arcTo(p.w / 2, -p.h / 2, p.w / 2, p.h / 2, r)
        ctx.lineTo(p.w / 2 - r, p.h / 2)
        ctx.arcTo(-p.w / 2, p.h / 2, -p.w / 2, -p.h / 2, r)
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        // Update — falling with tumble
        p.y += p.vy
        p.x += p.vx
        p.angle += p.angularV

        // Slight sway
        p.vx += Math.sin(p.y * 0.015) * 0.008

        // Reset to top when off bottom
        if (p.y > canvas.height + 20) {
          p.y = -20
          p.x = rand(0, canvas.width)
          p.vx = rand(-0.3, 0.3)
          p.vy = rand(0.6, 1.8)
        }
        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  )
}
