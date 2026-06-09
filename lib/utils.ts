import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRoundColor(round?: string): string {
  if (!round) return 'bg-gray-100 text-gray-600'
  if (round.toLowerCase().includes('seed') || round.toLowerCase().includes('pre')) return 'bg-emerald-100 text-emerald-700'
  if (round.toLowerCase().includes('series a')) return 'bg-blue-100 text-blue-700'
  if (round.toLowerCase().includes('series b')) return 'bg-violet-100 text-violet-700'
  return 'bg-gray-100 text-gray-600'
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-500'
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200'
  if (score >= 60) return 'bg-blue-50 border-blue-200'
  if (score >= 40) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Unknown date'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
