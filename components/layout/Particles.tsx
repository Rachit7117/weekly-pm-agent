"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  color: string
  opacity: number
  vx: number
  vy: number
}

// Exact Antigravity palette — blue dominant, sparse accent colors
const COLORS = [
  "#4285F4", "#4285F4", "#4285F4", "#4285F4", "#4285F4", // blue ~60%
  "#3367D6", "#3367D6",                                   // darker blue
  "#EA4335", "#EA4335",                                   // red ~15%
  "#FBBC05",                                              // yellow ~8%
  "#34A853",                                              // green ~8%
  "#9C27B0",                                              // purple ~5%
  "#FF7043",                                              // orange ~4%
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

    // Sparse dots spread across full viewport — exactly like Antigravity
    const COUNT = 70
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      size: Math.random() < 0.7 ? rand(1.5, 2.5) : rand(3, 4.5), // mostly tiny
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: rand(0.3, 0.7),
      vx: rand(-0.08, 0.08), // extremely slow drift
      vy: rand(-0.06, 0.06),
    }))

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Very slow drift
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges seamlessly
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10
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
