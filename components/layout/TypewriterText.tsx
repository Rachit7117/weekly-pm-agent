"use client"

import { useEffect, useState } from "react"

interface Props {
  text: string
  className?: string
  delay?: number       // ms before starting
  speed?: number       // ms per character
}

export function TypewriterText({ text, className, delay = 200, speed = 38 }: Props) {
  const [displayed, setDisplayed] = useState("")
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  useEffect(() => {
    if (!started) return
    if (displayed.length >= text.length) { setDone(true); return }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1))
    }, speed)
    return () => clearTimeout(t)
  }, [started, displayed, text, speed])

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <span className="inline-block w-[3px] h-[0.85em] bg-gray-950 ml-[2px] align-middle animate-pulse" />
      )}
    </span>
  )
}
