import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runDiscoveryAgent } from '@/lib/agents/discovery'
import { runResearchAgent } from '@/lib/agents/research'
import { runHiringSignalAgent } from '@/lib/agents/hiring-signal'
import { runFitScoreAgent } from '@/lib/agents/fit-score'
import { runApplicationPathAgent } from '@/lib/agents/application-path'
import { Profile, FundedCompany } from '@/types'

export const maxDuration = 300

export async function POST(request: Request) {
  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  // Check at least one LLM key is set
  if (!process.env.GROQ_API_KEY && !process.env.GROK_API_KEY && !process.env.NVIDIA_API_KEY && !process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'No LLM API key set. Add GROQ_API_KEY in Vercel environment variables.' }, { status: 500 })
  }
  if (!process.env.TAVILY_API_KEY) {
    return NextResponse.json({ error: 'TAVILY_API_KEY is not set in environment variables' }, { status: 500 })
  }
  // Log which LLM will be used
  const activeLLM = process.env.GROQ_API_KEY ? 'Groq (llama-3.3-70b)' : process.env.GROK_API_KEY ? 'Grok' : process.env.NVIDIA_API_KEY ? 'NVIDIA NIM' : 'Gemini'
  console.log(`Using LLM: ${activeLLM}`)

  const supabase = await createServiceClient()

  const { data: runLog } = await supabase
    .from('weekly_runs')
    .insert({ status: 'running' })
    .select()
    .single()

  const logs: string[] = []

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: `Profile not found: ${profileError?.message}` }, { status: 404 })
    }

    logs.push('Profile loaded')

    // Step 1: Discovery
    logs.push('Running discovery agent...')
    const { companies: rawCompanies, logs: discoveryLogs } = await runDiscoveryAgent()
    logs.push(...discoveryLogs)
    logs.push(`Discovery found ${rawCompanies.length} companies`)

    if (rawCompanies.length === 0) {
      await supabase.from('weekly_runs').update({ status: 'completed', companies_found: 0 }).eq('id', runLog?.id)
      return NextResponse.json({
        success: true,
        count: 0,
        logs,
        message: `Discovery returned 0 companies. Logs: ${discoveryLogs.join(' | ')}`,
      })
    }

    const weekOf = new Date().toISOString().split('T')[0]
    const processedResults = []

    for (const rawCompany of rawCompanies.slice(0, 10)) {
      try {
        logs.push(`Processing: ${rawCompany.name}`)

        // Sanitize date — DB requires YYYY-MM-DD or null
        const sanitizedCompany = {
          ...rawCompany,
          funding_date: sanitizeDate(rawCompany.funding_date),
        }

        // Check for duplicate by name (avoid reprocessing same company)
        const { data: existing } = await supabase
          .from('funded_companies')
          .select('id')
          .ilike('name', sanitizedCompany.name)
          .single()

        // Also skip if user already has a result for this company this week
        if (existing) {
          const { data: existingResult } = await supabase
            .from('agent_results')
            .select('id')
            .eq('company_id', existing.id)
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .single()
          if (existingResult) {
            logs.push(`  ↩ Skipping duplicate: ${sanitizedCompany.name}`)
            continue
          }
        }

        // Store company (or reuse existing)
        let company = existing ? { ...existing, ...sanitizedCompany } : null
        if (!existing) {
          const { data: inserted, error: companyError } = await supabase
            .from('funded_companies')
            .insert(sanitizedCompany)
            .select()
            .single()
          if (companyError || !inserted) {
            logs.push(`  ✗ DB insert failed: ${companyError?.message}`)
            continue
          }
          company = inserted
        }

        if (!company) {
          logs.push(`  ✗ Could not get company record`)
          continue
        }

        // Research
        const enriched = await runResearchAgent(company)
        await supabase.from('funded_companies').update(enriched).eq('id', company.id)
        const fullCompany: FundedCompany = { ...company, ...enriched }

        // Hiring signal
        const hiringSignal = await runHiringSignalAgent(fullCompany)
        logs.push(`  Hiring score: ${hiringSignal.score}`)

        // Fit score
        const fitScore = await runFitScoreAgent(profile as Profile, fullCompany)
        logs.push(`  Fit score: ${fitScore.fit_score}`)

        // Application path + outreach
        const { application_path, outreach_strategy } = await runApplicationPathAgent(
          profile as Profile,
          fullCompany
        )

        // Store result
        const { data: result, error: resultError } = await supabase
          .from('agent_results')
          .insert({
            company_id: company.id,
            user_id: userId,
            hiring_score: hiringSignal.score,
            hiring_reasoning: hiringSignal.reasoning,
            fit_score: fitScore.fit_score,
            fit_reasons: fitScore.why_fit,
            application_path,
            outreach_strategy,
            week_of: weekOf,
          })
          .select()
          .single()

        if (resultError) {
          logs.push(`  ✗ Result insert failed: ${resultError.message}`)
        } else if (result) {
          processedResults.push(result)
          logs.push(`  ✓ Saved`)
        }
      } catch (companyErr) {
        logs.push(`  ✗ Error: ${String(companyErr)}`)
      }
    }

    await supabase
      .from('weekly_runs')
      .update({ status: 'completed', companies_found: processedResults.length })
      .eq('id', runLog?.id)

    return NextResponse.json({
      success: true,
      count: processedResults.length,
      logs,
    })
  } catch (error) {
    logs.push(`Fatal error: ${String(error)}`)
    await supabase
      .from('weekly_runs')
      .update({ status: 'failed', error: String(error) })
      .eq('id', runLog?.id)

    return NextResponse.json({ error: String(error), logs }, { status: 500 })
  }
}

// Convert any date string to YYYY-MM-DD or null
function sanitizeDate(date: string | null | undefined): string | null {
  if (!date) return null
  // Already valid YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  // Try parsing natural language dates like "Nov 2025", "November 2025", "2025"
  try {
    const parsed = new Date(date)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }
  } catch {}
  // Can't parse — return null instead of crashing
  return null
}
