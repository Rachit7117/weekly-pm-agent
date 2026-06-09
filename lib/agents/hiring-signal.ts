import { generateJSON } from '@/lib/gemini'
import { FundedCompany, HiringSignal } from '@/types'

async function searchHiringSignals(company: FundedCompany): Promise<string> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `${company.name} hiring jobs product manager 2025`,
        search_depth: 'basic',
        max_results: 5,
      }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return (data.results || [])
      .map((r: { title: string; content: string }) => `${r.title}: ${r.content.slice(0, 200)}`)
      .join('\n')
  } catch {
    return ''
  }
}

export async function runHiringSignalAgent(company: FundedCompany): Promise<HiringSignal> {
  const signals = await searchHiringSignals(company)

  const prompt = `
You are a hiring intelligence analyst. Score this startup's likelihood of hiring a PM (0-100).

Company: ${company.name}
Funding: ${company.funding_amount} ${company.funding_round}
Industry: ${company.industry}
Team size: ${company.team_size}
Stage: ${company.stage}
Description: ${company.description}

Hiring signals found:
${signals || 'No direct signals found'}

Scoring criteria:
- Seed + <15 people = likely hiring first PM soon (high score)
- Series A + 15-40 people = actively building PM team (very high score)
- Series B + 40-80 people = scaling PM org (high score)
- Open PM/Design/Eng jobs found = strong signal
- Recent funding = budget exists
- B2B SaaS / AI / DevTools = PM-driven companies

Return JSON:
{
  "score": number (0-100),
  "reasoning": ["reason 1", "reason 2", "reason 3"]
}
`

  try {
    return await generateJSON<HiringSignal>(prompt)
  } catch {
    return { score: 50, reasoning: ['Could not generate hiring signal analysis'] }
  }
}
