"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  width: number
  height: number
  color: string
  rotation: number
  rotationSpeed: number
  vx: number
  vy: number
  opacity: number
  shape: "rect" | "circle" | "line"
}

// Google / Antigravity color palette
const COLORS = [
  "#4285F4", // Google blue
  "#EA4335", // Google red
  "#FBBC05", // Google yellow
  "#34A853", // Google green
  "#9C27B0", // Purple
  "#FF5722", // Deep orange
  "#00BCD4", // Cyan
  "#FF9800", // Orange
]

function randomBetween(a: number, b: number) {
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

    // Create varied confetti particles
    const particles: Particle[] = Array.from({ length: 80 }, () => {
      const shape = Math.random() < 0.6 ? "rect" : Math.random() < 0.5 ? "circle" : "line"
      return {
        x: randomBetween(0, window.innerWidth),
        y: randomBetween(-window.innerHeight, window.innerHeight),
        width: randomBetween(4, 10),
        height: randomBetween(2, 5),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: randomBetween(0, Math.PI * 2),
        rotationSpeed: randomBetween(-0.02, 0.02),
        vx: randomBetween(-0.3, 0.3),
        vy: randomBetween(0.4, 1.2),
        opacity: randomBetween(0.3, 0.8),
        shape,
      }
    })

    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.strokeStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        if (p.shape === "rect") {
          ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
        } else if (p.shape === "circle") {
          ctx.beginPath()
          ctx.arc(0, 0, p.height, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(-p.width / 2, 0)
          ctx.lineTo(p.width / 2, 0)
          ctx.stroke()
        }

        ctx.restore()

        // Update position
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed

        // Slight sway
        p.vx += Math.sin(p.y * 0.01) * 0.01

        // Reset when off screen bottom
        if (p.y > canvas.height + 20) {
          p.y = -20
          p.x = randomBetween(0, canvas.width)
          p.vx = randomBetween(-0.3, 0.3)
          p.vy = randomBetween(0.4, 1.2)
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
      style={{ opacity: 0.55 }}
    />
  )
}
