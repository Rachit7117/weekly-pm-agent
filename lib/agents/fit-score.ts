import { generateJSON } from '@/lib/gemini'
import { Profile, FundedCompany, FitScore } from '@/types'

export async function runFitScoreAgent(
  profile: Profile,
  company: FundedCompany
): Promise<FitScore> {
  const prompt = `
You are a PM career advisor. Score how well this PM fits this startup (0-100).

PM PROFILE:
- Name: ${profile.name}
- Current role: ${profile.current_role || 'not specified'}
- Years experience: ${profile.years_experience || 'not specified'}
- PM focus: ${profile.pm_focus || 'not specified'}
- Work preference: ${profile.work_preference || 'open'}
- Preferred location: ${profile.preferred_location || 'flexible'}
- Resume summary: ${profile.resume_text?.slice(0, 500) || 'not provided'}

COMPANY:
- Name: ${company.name}
- Industry: ${company.industry}
- Stage: ${company.stage}
- Team size: ${company.team_size}
- Funding: ${company.funding_amount} ${company.funding_round}
- Description: ${company.description}

Fit criteria:
- PM focus alignment with company type (e.g. growth PM → B2C growth company)
- Experience level match (early PM needs less experience, Series B needs more)
- Work preference vs company location/remote culture
- Industry relevance from resume
- Stage fit (first-time PM vs scaling PM)

Return JSON:
{
  "fit_score": number (0-100),
  "why_fit": ["specific reason 1", "specific reason 2", "specific reason 3"]
}
`

  try {
    return await generateJSON<FitScore>(prompt)
  } catch {
    return { fit_score: 50, why_fit: ['Could not generate fit analysis'] }
  }
}
