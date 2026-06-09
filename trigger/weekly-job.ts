import { schedules } from "@trigger.dev/sdk/v3"
import { createClient } from "@supabase/supabase-js"
import { runDiscoveryAgent } from "@/lib/agents/discovery"
import { runResearchAgent } from "@/lib/agents/research"
import { runHiringSignalAgent } from "@/lib/agents/hiring-signal"
import { runFitScoreAgent } from "@/lib/agents/fit-score"
import { runApplicationPathAgent } from "@/lib/agents/application-path"
import { Profile, FundedCompany } from "@/types"

export const weeklyPMAgent = schedules.task({
  id: "weekly-pm-agent",
  // Every Monday at 8 AM
  cron: "0 8 * * 1",
  maxDuration: 600,
  run: async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Log run start
    const { data: runLog } = await supabase
      .from("weekly_runs")
      .insert({ status: "running" })
      .select()
      .single()

    try {
      // Get all user profiles to process
      const { data: profiles } = await supabase.from("profiles").select("*")
      if (!profiles?.length) return { message: "No profiles found" }

      // Step 1: Discover funded companies (once for all users)
      const rawCompanies = await runDiscoveryAgent()
      const weekOf = new Date().toISOString().split("T")[0]

      let processedCount = 0

      for (const rawCompany of rawCompanies.slice(0, 12)) {
        try {
          const { data: company } = await supabase
            .from("funded_companies")
            .insert(rawCompany)
            .select()
            .single()

          if (!company) continue

          const enriched = await runResearchAgent(company)
          await supabase.from("funded_companies").update(enriched).eq("id", company.id)
          const fullCompany: FundedCompany = { ...company, ...enriched }

          const hiringSignal = await runHiringSignalAgent(fullCompany)

          // Process for each user
          for (const profile of profiles) {
            const fitScore = await runFitScoreAgent(profile as Profile, fullCompany)
            const { application_path, outreach_strategy } = await runApplicationPathAgent(
              profile as Profile,
              fullCompany
            )

            await supabase.from("agent_results").insert({
              company_id: company.id,
              user_id: profile.id,
              hiring_score: hiringSignal.score,
              hiring_reasoning: hiringSignal.reasoning,
              fit_score: fitScore.fit_score,
              fit_reasons: fitScore.why_fit,
              application_path,
              outreach_strategy,
              week_of: weekOf,
            })

            processedCount++
          }
        } catch {
          // Skip failed companies
        }
      }

      await supabase
        .from("weekly_runs")
        .update({ status: "completed", companies_found: rawCompanies.length })
        .eq("id", runLog?.id)

      return { processed: processedCount, companies: rawCompanies.length }
    } catch (error) {
      await supabase
        .from("weekly_runs")
        .update({ status: "failed", error: String(error) })
        .eq("id", runLog?.id)
      throw error
    }
  },
})
