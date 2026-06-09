import { generateJSON } from '@/lib/gemini'
import { Profile, FundedCompany, ApplicationPath, OutreachStrategy } from '@/types'

export async function runApplicationPathAgent(
  profile: Profile,
  company: FundedCompany
): Promise<{ application_path: ApplicationPath; outreach_strategy: OutreachStrategy }> {
  const prompt = `
You are a senior PM career strategist. Generate a tailored application path and outreach strategy.

PM PROFILE:
- Name: ${profile.name}
- Current role: ${profile.current_role || 'PM'}
- Years experience: ${profile.years_experience || 'a few'} years
- PM focus: ${profile.pm_focus || 'product'}
- Work preference: ${profile.work_preference || 'open'}
- Preferred location: ${profile.preferred_location || 'flexible'}

COMPANY:
- Name: ${company.name}
- Website: ${company.website || 'unknown'}
- Funding: ${company.funding_amount} ${company.funding_round}
- Industry: ${company.industry}
- Team size: ${company.team_size}
- Stage: ${company.stage}
- Description: ${company.description}

Generate a concrete, specific, actionable plan. Be specific — not generic.

Return JSON:
{
  "application_path": {
    "pm_role_angle": "specific PM role title and angle e.g. 'First PM — own 0-to-1 product build'",
    "hiring_manager_tip": "specific LinkedIn search tip e.g. 'Search [Company] + Head of Product or CEO directly at this stage'",
    "outreach_hook": "one specific product observation or improvement idea to mention in outreach",
    "apply_via": "Direct | Investor Referral | LinkedIn | YC Job Board",
    "lead_investor": "investor name if known, else null",
    "timeline_estimate": "e.g. 'Likely hiring in 1-3 months — post-funding team build'"
  },
  "outreach_strategy": {
    "subject_line": "compelling email/LinkedIn subject line (under 60 chars)",
    "message": "3-4 sentence personalized message to the founder or hiring manager. Reference their product specifically. Mention ${profile.name}'s background. End with a clear CTA.",
    "follow_up": "1-2 sentence follow-up message for 1 week later",
    "best_channel": "LinkedIn DM | Email | Twitter/X | YC Founder Slack"
  }
}
`

  try {
    return await generateJSON<{ application_path: ApplicationPath; outreach_strategy: OutreachStrategy }>(prompt)
  } catch {
    return {
      application_path: {
        pm_role_angle: 'Product Manager',
        hiring_manager_tip: 'Search the company on LinkedIn and message the CEO directly',
        outreach_hook: 'Reference a specific product feature or pain point you noticed',
        apply_via: 'Direct',
        timeline_estimate: 'Likely hiring soon post-funding',
      },
      outreach_strategy: {
        subject_line: `Interested in PM role at ${company.name}`,
        message: `Hi, I noticed ${company.name} just raised ${company.funding_amount}. I'd love to chat about how I can help build your product.`,
        follow_up: 'Following up on my previous message — happy to share more about my background.',
        best_channel: 'LinkedIn DM',
      },
    }
  }
}
