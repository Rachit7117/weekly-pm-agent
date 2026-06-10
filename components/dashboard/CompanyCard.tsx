"use client"

import { useState } from "react"
import { DashboardEntry } from "@/types"
import { getRoundColor, getScoreColor, getScoreBg, cn } from "@/lib/utils"
import { ChevronDown, ExternalLink, Target, Briefcase, MessageSquare, Globe, BookOpen } from "lucide-react"

interface Props {
  entry: DashboardEntry
  rank: number
}

export function CompanyCard({ entry, rank }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { company, hiring_score, fit_score, composite_score, hiring_reasoning, fit_reasons, application_path, outreach_strategy } = entry

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-950 text-white text-xs font-bold flex items-center justify-center">
              {rank}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-950 text-[15px]">{company.name}</h3>
                {company.website && (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{company.description}</p>
            </div>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={cn("text-center px-3 py-2 rounded-xl border", getScoreBg(composite_score))}>
              <div className={cn("text-lg font-bold leading-none", getScoreColor(composite_score))}>
                {Math.round(composite_score)}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">score</div>
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", getRoundColor(company.funding_round))}>
            {company.funding_round}
          </span>
          {company.funding_amount && (
            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              {company.funding_amount}
            </span>
          )}
          {company.industry && (
            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              {company.industry}
            </span>
          )}
          {company.team_size && (
            <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              👥 {company.team_size}
            </span>
          )}
        </div>

        {/* Score bar */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ScoreBar label="PM Hiring Signal" score={hiring_score} color="bg-blue-500" />
          <ScoreBar label="Your Fit" score={fit_score} color="bg-violet-500" />
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {company.website && (
            <CTAButton
              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
              icon={<Globe className="w-3.5 h-3.5" />}
              label="Website"
              color="text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100"
            />
          )}
          {company.website && (
            <CTAButton
              href={`${company.website.startsWith("http") ? company.website : `https://${company.website}`}/careers`}
              icon={<BookOpen className="w-3.5 h-3.5" />}
              label="Careers"
              color="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100"
            />
          )}
          <CTAButton
            href={`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company.name)}`}
            icon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>}
            label="LinkedIn"
            color="text-[#0077b5] bg-[#e8f4fb] border-[#b3d9ef] hover:bg-[#d0eaf8]"
          />
          <CTAButton
            href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(company.name + " product manager")}`}
            icon={<Briefcase className="w-3.5 h-3.5" />}
            label="PM Jobs"
            color="text-violet-600 bg-violet-50 border-violet-200 hover:bg-violet-100"
          />
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 flex items-center justify-between text-xs text-gray-500 hover:text-gray-700 border-t border-gray-50 hover:bg-gray-50/50 transition-colors"
      >
        <span>{expanded ? "Hide details" : "View application path & outreach"}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {/* Why it fits */}
          <Section icon={<Target className="w-4 h-4" />} title="Why you fit">
            <ul className="space-y-1.5">
              {fit_reasons?.map((r, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-violet-400 mt-0.5 flex-shrink-0">•</span> {r}
                </li>
              ))}
            </ul>
          </Section>

          {/* Application path */}
          <Section icon={<Briefcase className="w-4 h-4" />} title="Application path">
            <div className="space-y-2.5">
              <DetailRow label="Role angle" value={application_path?.pm_role_angle} />
              <DetailRow label="How to find them" value={application_path?.hiring_manager_tip} />
              <DetailRow label="Outreach hook" value={application_path?.outreach_hook} highlight />
              <DetailRow label="Apply via" value={application_path?.apply_via} />
              {application_path?.lead_investor && (
                <DetailRow label="Lead investor" value={application_path.lead_investor} />
              )}
              <DetailRow label="Timing" value={application_path?.timeline_estimate} />
            </div>
          </Section>

          {/* Outreach strategy */}
          <Section icon={<MessageSquare className="w-4 h-4" />} title="Outreach strategy">
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-400 mb-1">Best channel</div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {outreach_strategy?.best_channel}
                </span>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-400 mb-1">Subject line</div>
                <p className="text-sm text-gray-700 font-medium">{outreach_strategy?.subject_line}</p>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-400 mb-1.5">Message</div>
                <div className="bg-gray-50 rounded-xl p-3.5 text-sm text-gray-700 leading-relaxed border border-gray-100">
                  {outreach_strategy?.message}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-400 mb-1.5">Follow-up (1 week later)</div>
                <div className="bg-gray-50 rounded-xl p-3.5 text-sm text-gray-600 leading-relaxed border border-gray-100">
                  {outreach_strategy?.follow_up}
                </div>
              </div>
            </div>
          </Section>

          {/* Hiring signals */}
          <Section icon={<span className="text-sm">📡</span>} title="Hiring signals">
            <ul className="space-y-1.5">
              {hiring_reasoning?.map((r, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span> {r}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )}
    </div>
  )
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{score}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400">{icon}</span>
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function DetailRow({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <p className={cn("text-sm", highlight ? "text-gray-900 font-medium" : "text-gray-600")}>{value || "—"}</p>
    </div>
  )
}

function CTAButton({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
        color
      )}
    >
      {icon}
      {label}
    </a>
  )
}
