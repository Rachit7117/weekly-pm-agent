import { generateJSON } from '@/lib/llm'
import { FundedCompany } from '@/types'

async function firecrawlScrape(url: string): Promise<string> {
  try {
    const res = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({ url, pageOptions: { onlyMainContent: true } }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return (data.data?.markdown || '').slice(0, 2000)
  } catch {
    return ''
  }
}

export async function runResearchAgent(
  company: Omit<FundedCompany, 'id' | 'created_at'>
): Promise<Partial<FundedCompany>> {
  let pageContent = ''
  if (company.website) {
    pageContent = await firecrawlScrape(company.website)
  }

  const prompt = `
Research this startup and return enriched data as JSON.

Company: ${company.name}
Website: ${company.website || 'unknown'}
Known info: ${company.description || ''}
Funding: ${company.funding_amount} ${company.funding_round}
Page content: ${pageContent || 'not available'}

Return JSON:
{
  "description": "clear 2-sentence product description",
  "industry": "specific industry category",
  "team_size": "estimated team size range e.g. 10-25",
  "stage": "Early | Growth",
  "key_product_insight": "one specific observation about their product approach"
}
`

  try {
    const result = await generateJSON<Partial<FundedCompany> & { key_product_insight?: string }>(prompt)
    return result
  } catch {
    return company
  }
}
