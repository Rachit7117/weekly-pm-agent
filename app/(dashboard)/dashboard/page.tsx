"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { CompanyCard } from "@/components/dashboard/CompanyCard"
import { DashboardEntry } from "@/types"
import { toast } from "sonner"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const [entries, setEntries] = useState<DashboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [hasProfile, setHasProfile] = useState(true)
  const supabase = createClient()

  const fetchResults = useCallback(async () => {
    const res = await fetch("/api/results")
    if (res.ok) {
      const data = await res.json()
      setEntries(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()
      setHasProfile(!!profile)
      await fetchResults()
    }
    init()
  }, [supabase, fetchResults])

  const runAgent = async () => {
    setRunning(true)
    toast.info("Agent is running — this takes 2-3 minutes...")
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Found ${data.count} opportunities!`)
        await fetchResults()
      } else {
        toast.error(data.error || "Agent run failed")
      }
    } catch {
      toast.error("Something went wrong")
    }
    setRunning(false)
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="text-xl font-bold text-gray-950 mb-2">Set up your profile first</h2>
        <p className="text-gray-500 text-sm mb-6 max-w-sm">
          The agent needs to know your background to score PM fit and generate tailored application paths.
        </p>
        <Link href="/profile">
          <Button className="rounded-full bg-gray-950 hover:bg-gray-800 text-white">
            Create profile
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Your PM Opportunities</h1>
          <p className="text-gray-500 text-sm mt-1">
            {entries.length > 0
              ? `${entries.length} opportunities ranked by fit × hiring signal`
              : "Run the agent to discover this week's funded startups"}
          </p>
        </div>
        <Button
          onClick={runAgent}
          disabled={running}
          className="rounded-full bg-gray-950 hover:bg-gray-800 text-white gap-2"
        >
          {running ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Running...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Run agent</>
          )}
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl h-40 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold text-gray-950 mb-2">No opportunities yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Click "Run agent" to discover recently funded startups and generate your personalized PM opportunity list.
          </p>
          <Button
            onClick={runAgent}
            disabled={running}
            className="rounded-full bg-gray-950 hover:bg-gray-800 text-white gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {running ? "Running..." : "Run agent now"}
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && entries.length > 0 && (
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <CompanyCard key={entry.id} entry={entry} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
