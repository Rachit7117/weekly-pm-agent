/**
 * Unified LLM client — uses DeepSeek by default (free, no strict rate limits)
 * Falls back to Gemini if DEEPSEEK_API_KEY is not set
 */

export async function generateJSON<T>(prompt: string): Promise<T> {
  if (process.env.DEEPSEEK_API_KEY) {
    return callDeepSeek<T>(prompt)
  }
  return callGemini<T>(prompt)
}

export async function generateText(prompt: string): Promise<string> {
  if (process.env.DEEPSEEK_API_KEY) {
    return callDeepSeekText(prompt)
  }
  return callGeminiText(prompt)
}

// ── DeepSeek ──────────────────────────────────────────────────────────────────

async function callDeepSeek<T>(prompt: string): Promise<T> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Always respond with valid JSON only — no markdown, no code fences, just raw JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek error ${res.status}: ${err.slice(0, 300)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''

  // Strip markdown fences if model adds them
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(clean) as T
}

async function callDeepSeekText(prompt: string): Promise<string> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) throw new Error(`DeepSeek error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ── Gemini fallback ───────────────────────────────────────────────────────────

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
