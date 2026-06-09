/**
 * Unified LLM client
 * Priority: NVIDIA NIM (free) → Grok/xAI (free tier) → Gemini (fallback)
 */

export async function generateJSON<T>(prompt: string): Promise<T> {
  if (process.env.NVIDIA_API_KEY) {
    return callNvidia<T>(prompt)
  }
  if (process.env.GROK_API_KEY) {
    return callGrok<T>(prompt)
  }
  return callGemini<T>(prompt)
}

export async function generateText(prompt: string): Promise<string> {
  if (process.env.NVIDIA_API_KEY) {
    return callNvidiaText(prompt)
  }
  if (process.env.GROK_API_KEY) {
    return callGrokText(prompt)
  }
  return callGeminiText(prompt)
}

// ── NVIDIA NIM (lowest latency — llama-3.1-8b-instruct) ──────────────────────

const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct'
const NVIDIA_BASE = 'https://integrate.api.nvidia.com/v1'

async function callNvidia<T>(prompt: string): Promise<T> {
  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Always respond with valid JSON only — no markdown, no code fences, just raw JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`NVIDIA NIM error ${res.status}: ${err.slice(0, 300)}`)
  }

  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content || ''
  const clean = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  return JSON.parse(clean) as T
}

async function callNvidiaText(prompt: string): Promise<string> {
  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) throw new Error(`NVIDIA NIM error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ── Grok / xAI (fallback) ─────────────────────────────────────────────────────

const GROK_MODEL = 'grok-3-fast'
const GROK_BASE = 'https://api.x.ai/v1'

async function callGrok<T>(prompt: string): Promise<T> {
  const res = await fetch(`${GROK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Always respond with valid JSON only — no markdown, no code fences, just raw JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Grok error ${res.status}: ${err.slice(0, 300)}`)
  }

  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content || ''
  const clean = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  return JSON.parse(clean) as T
}

async function callGrokText(prompt: string): Promise<string> {
  const res = await fetch(`${GROK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) throw new Error(`Grok error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ── Gemini (last fallback) ────────────────────────────────────────────────────

async function callGemini<T>(prompt: string): Promise<T> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  })
  const result = await model.generateContent(prompt)
  return JSON.parse(result.response.text()) as T
}

async function callGeminiText(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}
