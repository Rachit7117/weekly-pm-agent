import { generateJSON } from '@/lib/gemini'
import { FundedCompany } from '@/types'

interface TavilyResult {
  title: string
  url: string
  content: string
  published_date?: string
}

interface TavilyResponse {
  results: TavilyResult[]
}

async function searchTavily(query: string): Promise<TavilyResult[]> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      max_results: 10,
      days: 7,
    }),
  })
  if (!res.ok) return []
  const data: TavilyResponse = await res.json()
  return data.results || []
}

export async function runDiscoveryAgent(): Promise<Omit<FundedCompany, 'id' | 'created_at'>[]> {
  const queries = [
    'startup funding round announced this week 2025 seed series A',
    'site:techcrunch.com "raises" "million" funding 2025',
    'Y Combinator funded startup 2025',
    'venture capital funding announcement startup this week',
  ]

  const allResults: TavilyResult[] = []
  for (const query of queries) {
    try {
      const results = await searchTavily(query)
      allResults.push(...results)
    } catch {
      // Skip failed queries
    }
  }

  const dedupedContent = allResults
    .slice(0, 30)
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 400)}`)
    .join('\n\n---\n\n')

  const prompt = `
You are a startup funding analyst. Extract funded startups from the articles below.
Focus on companies that raised Seed, Series A, or Series B rounds (under $50M).
Only include US-based or remote-first companies.

Return a JSON array of up to 15 companies:
{
  "companies": [
    {
      "name": "string",
      "website": "string or null",
      "funding_amount": "e.g. $5M",
      "funding_round": "Seed | Series A | Series B",
      "funding_date": "YYYY-MM-DD or null",
      "description": "1-2 sentence product description",
      "industry": "e.g. B2B SaaS | Fintech | AI/ML | Developer Tools | Healthcare",
      "team_size": "e.g. 5-10 | 10-25 | 25-50",
      "stage": "Early | Growth",
      "source": "URL of source article"
    }
  ]
}

Articles:
${dedupedContent}
`

  try {
    const result = await generateJSON<{ companies: Omit<FundedCompany, 'id' | 'created_at'>[] }>(prompt)
    return result.companies || []
  } catch {
    return []
  }
}
