export type PMFocus = 'product' | 'growth' | 'platform' | 'ai'
export type WorkPreference = 'remote' | 'hybrid' | 'onsite' | 'open'
export type FundingRound = 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C+'

export interface Profile {
  id: string
  name: string
  linkedin_url?: string
  current_role_title?: string
  years_experience?: number
  pm_focus?: PMFocus
  work_preference?: WorkPreference
  preferred_location?: string
  resume_url?: string
  resume_text?: string
  ai_model?: string
  created_at?: string
}

export interface FundedCompany {
  id: string
  name: string
  website?: string
  funding_amount?: string
  funding_round?: string
  funding_date?: string
  description?: string
  industry?: string
  team_size?: string
  stage?: string
  source?: string
  created_at?: string
}

export interface HiringSignal {
  score: number
  reasoning: string[]
}

export interface FitScore {
  fit_score: number
  why_fit: string[]
}

export interface ApplicationPath {
  pm_role_angle: string
  hiring_manager_tip: string
  outreach_hook: string
  apply_via: string
  lead_investor?: string
  timeline_estimate: string
}

export interface OutreachStrategy {
  subject_line: string
  message: string
  follow_up: string
  best_channel: string
}

export interface AgentResult {
  id: string
  company_id: string
  user_id: string
  hiring_score: number
  hiring_reasoning: string[]
  fit_score: number
  fit_reasons: string[]
  application_path: ApplicationPath
  outreach_strategy: OutreachStrategy
  week_of: string
  company?: FundedCompany
}

export interface DashboardEntry extends AgentResult {
  company: FundedCompany
  composite_score: number
}

export type AIModel = 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'deepseek-v3' | 'gpt-4o' | 'claude-3-5-haiku'
