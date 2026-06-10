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
  vy: number      // rising speed (negative = up)
  vx: number      // horizontal drift
  life: number    // 0→1, used for fade in/out
  lifeSpeed: number
}

// Google brand palette only
const COLORS = [
  "#4285F4", // Google blue
  "#EA4335", // Google red
  "#FBBC05", // Google yellow
  "#34A853", // Google green
]

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function makeParticle(canvasWidth: number, canvasHeight: number): Particle {
  return {
    x: rand(0, canvasWidth),
    y: rand(canvasHeight * 0.4, canvasHeight + 40), // spawn in lower portion
    w: rand(8, 18),     // slightly longer dashes
    h: rand(2, 4),      // thin
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    angle: rand(0, Math.PI * 2),
    angularV: rand(-0.025, 0.025),
    vy: rand(0.5, 1.4),         // upward speed (subtracted from y)
    vx: rand(-0.4, 0.4),        // gentle horizontal drift
    life: rand(0, 1),           // stagger initial life phase
    lifeSpeed: rand(0.003, 0.007),
  }
}

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    resize()
    window.addEventListener("resize", resize)

    const COUNT = 120
    const particles: Particle[] = Array.from({ length: COUNT }, () =>
      makeParticle(W, H)
    )

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      for (const p of particles) {
        // life drives a smooth bell-curve opacity: 0→peak→0
        const alpha = Math.sin(p.life * Math.PI) * 0.7

        ctx.save()
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)

        // Pill-shaped dash
        const r = p.h / 2
        ctx.beginPath()
        ctx.moveTo(-p.w / 2 + r, -r)
        ctx.lineTo(p.w / 2 - r, -r)
        ctx.arcTo(p.w / 2, -r, p.w / 2, r, r)
        ctx.lineTo(p.w / 2 - r, r)
        ctx.arcTo(-p.w / 2, r, -p.w / 2, -r, r)
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        // Move upward with tumble
        p.y -= p.vy
        p.x += p.vx + Math.sin(p.y * 0.012) * 0.12  // gentle wave sway
        p.angle += p.angularV
        p.life += p.lifeSpeed

        // Respawn when life cycle complete or drifted off screen
        if (p.life >= 1 || p.y < -20 || p.x < -30 || p.x > W + 30) {
          const fresh = makeParticle(W, H)
          fresh.life = 0   // always start fresh from bottom
          fresh.y = rand(H * 0.6, H + 20)
          Object.assign(p, fresh)
        }
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
