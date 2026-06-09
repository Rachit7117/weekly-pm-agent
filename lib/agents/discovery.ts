import { generateJSON } from '@/lib/gemini'
import { FundedCompany } from '@/types'

interface TavilyResult {
  title: string
  url: string
  content: string
  published_date?: string
}

async function searchTavily(query: string): Promise<{ results: TavilyResult[]; error?: string }> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 8,
        include_answer: false,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return { results: [], error: `Tavily ${res.status}: ${text.slice(0, 200)}` }
    }

    const data = await res.json()
    return { results: data.results || [] }
  } catch (e) {
    return { results: [], error: String(e) }
  }
}

export async function runDiscoveryAgent(): Promise<{
  companies: Omit<FundedCompany, 'id' | 'created_at'>[]
  logs: string[]
}> {
  const logs: string[] = []

  const queries = [
    'startup raised seed funding 2024 2025',
    'startup series A funding announced million',
    'new startup funding round techcrunch',
    'Y Combinator batch startup launched',
  ]

  const allResults: TavilyResult[] = []

  for (const query of queries) {
    const { results, error } = await searchTavily(query)
    if (error) {
      logs.push(`Tavily query failed: "${query}" → ${error}`)
    } else {
      logs.push(`Tavily query OK: "${query}" → ${results.length} results`)
      allResults.push(...results)
    }
  }

  logs.push(`Total Tavily results: ${allResults.length}`)

  if (allResults.length === 0) {
    logs.push('ERROR: No Tavily results — API key may be invalid or quota exceeded')
    return { companies: [], logs }
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  const deduped = allResults.filter(r => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })

  const articleText = deduped
    .slice(0, 20)
    .map((r, i) => `[${i + 1}] TITLE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content.slice(0, 500)}`)
    .join('\n\n---\n\n')

  logs.push(`Sending ${deduped.slice(0, 20).length} articles to Gemini for extraction...`)

  const prompt = `
You are a startup funding analyst. Extract funded startups from these search results.

RULES:
- Only include companies that raised money (any amount, any stage)
- Include both US and international startups
- If funding amount is unknown, write "Undisclosed"
- If funding round is unknown, write "Seed" as default
- Extract as many as you can find (up to 15)
- Do NOT return an empty array — extract whatever you can find

Return ONLY valid JSON in this exact format:
{
  "companies": [
    {
      "name": "Company Name",
      "website": "https://example.com or null",
      "funding_amount": "$5M or Undisclosed",
      "funding_round": "Seed",
      "funding_date": null,
      "description": "What the company does in 1-2 sentences.",
      "industry": "B2B SaaS",
      "team_size": "10-25",
      "stage": "Early",
      "source": "https://source-url.com"
    }
  ]
}

SEARCH RESULTS:
${articleText}
`

  try {
    const result = await generateJSON<{ companies: Omit<FundedCompany, 'id' | 'created_at'>[] }>(prompt)
    const companies = result.companies || []
    logs.push(`Gemini extracted ${companies.length} companies`)
    return { companies, logs }
  } catch (e) {
    logs.push(`Gemini extraction failed: ${String(e)}`)
    return { companies: [], logs }
  }
}
