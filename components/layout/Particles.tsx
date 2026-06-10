"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  length: number
  angle: number
  color: string
  opacity: number
  vx: number
  vy: number
  angularV: number
}

// Antigravity-exact palette — small dashes, muted multicolor
const COLORS = [
  "#4285F4", "#4285F4", "#4285F4", // blue dominant
  "#EA4335", "#EA4335",             // red
  "#FBBC05", "#FBBC05",             // yellow
  "#34A853",                        // green
  "#9C27B0",                        // purple
  "#FF7043",                        // orange-red
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

    // Dense small dashes spread across the whole page — like Antigravity
    const COUNT = 160
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      length: rand(3, 9),
      angle: rand(0, Math.PI * 2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: rand(0.25, 0.65),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.12, 0.12),
      angularV: rand(-0.008, 0.008),
    }))

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1.8
        ctx.lineCap = "round"
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.beginPath()
        ctx.moveTo(-p.length / 2, 0)
        ctx.lineTo(p.length / 2, 0)
        ctx.stroke()
        ctx.restore()

        p.x += p.vx
        p.y += p.vy
        p.angle += p.angularV

        // Wrap around edges so density stays uniform
        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20
        if (p.y < -20) p.y = canvas.height + 20
        if (p.y > canvas.height + 20) p.y = -20
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
