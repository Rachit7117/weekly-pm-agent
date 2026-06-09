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
  const supabase = await createServiceClient()

  // Log the run
  const { data: runLog } = await supabase
    .from('weekly_runs')
    .insert({ status: 'running' })
    .select()
    .single()

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Step 1: Discovery
    const rawCompanies = await runDiscoveryAgent()

    // Step 2: Store companies + research each
    const weekOf = new Date().toISOString().split('T')[0]
    const processedResults = []

    for (const rawCompany of rawCompanies.slice(0, 12)) {
      try {
        // Store raw company
        const { data: company } = await supabase
          .from('funded_companies')
          .insert(rawCompany)
          .select()
          .single()

        if (!company) continue

        // Step 2: Research
        const enriched = await runResearchAgent(company)
        await supabase
          .from('funded_companies')
          .update(enriched)
          .eq('id', company.id)

        const fullCompany: FundedCompany = { ...company, ...enriched }

        // Step 3: Hiring signal
        const hiringSignal = await runHiringSignalAgent(fullCompany)

        // Step 4: Fit score
        const fitScore = await runFitScoreAgent(profile as Profile, fullCompany)

        // Step 5: Application path + outreach
        const { application_path, outreach_strategy } = await runApplicationPathAgent(
          profile as Profile,
          fullCompany
        )

        // Store result
        const { data: result } = await supabase
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

        if (result) processedResults.push(result)
      } catch {
        // Continue with next company on error
      }
    }

    // Update run log
    await supabase
      .from('weekly_runs')
      .update({ status: 'completed', companies_found: processedResults.length })
      .eq('id', runLog?.id)

    return NextResponse.json({ success: true, count: processedResults.length })
  } catch (error) {
    await supabase
      .from('weekly_runs')
      .update({ status: 'failed', error: String(error) })
      .eq('id', runLog?.id)

    return NextResponse.json({ error: 'Agent run failed' }, { status: 500 })
  }
}
