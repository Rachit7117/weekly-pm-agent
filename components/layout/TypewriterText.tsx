"use client"

import { useEffect, useState } from "react"

interface Props {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export function TypewriterText({ text, className, delay = 0, speed = 45 }: Props) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (!started) return
    if (displayed.length >= text.length) {
      setDone(true)
      return
    }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1))
    }, speed)
    return () => clearTimeout(t)
  }, [started, displayed, text, speed])

  return (
    <span className={className}>
      {displayed}
      {!done && (
        // Rainbow gradient cursor — exactly like Antigravity
        <span
          className="inline-block align-middle ml-[2px] animate-pulse"
          style={{
            width: "3px",
            height: "0.8em",
            background: "linear-gradient(to bottom, #4285F4, #EA4335, #FBBC05, #34A853, #9C27B0)",
            borderRadius: "2px",
            verticalAlign: "middle",
          }}
        />
      )}
    </span>
  )
}
