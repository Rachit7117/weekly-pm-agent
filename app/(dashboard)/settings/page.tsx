"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AIModel } from "@/types"
import { cn } from "@/lib/utils"

const models: { value: AIModel; label: string; badge: string; free: boolean; description: string }[] = [
  {
    value: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    badge: "Default",
    free: true,
    description: "Fast, accurate, excellent JSON output. 1500 req/day free.",
  },
  {
    value: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    badge: "Free",
    free: true,
    description: "Deeper reasoning. Best for complex fit analysis.",
  },
  {
    value: "deepseek-v3",
    label: "DeepSeek V3",
    badge: "Near-free",
    free: true,
    description: "GPT-4 class quality at near-zero cost. Great fallback.",
  },
  {
    value: "gpt-4o",
    label: "GPT-4o",
    badge: "Paid",
    free: false,
    description: "OpenAI's flagship. Add OPENAI_API_KEY to use.",
  },
  {
    value: "claude-3-5-haiku",
    label: "Claude 3.5 Haiku",
    badge: "Paid",
    free: false,
    description: "Fast Claude model. Add ANTHROPIC_API_KEY to use.",
  },
]

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini-2.0-flash")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("ai_model").eq("id", user.id).single()
      if (data?.ai_model) setSelectedModel(data.ai_model as AIModel)
    }
    load()
  }, [supabase])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ai_model: selectedModel }),
    })
    if (res.ok) {
      toast.success("Settings saved!")
    } else {
      toast.error("Failed to save")
    }
    setSaving(false)
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-950">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure the AI model used by your agents.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide block mb-4">
          AI Model
        </Label>
        <div className="space-y-2">
          {models.map((model) => (
            <button
              key={model.value}
              onClick={() => setSelectedModel(model.value)}
              className={cn(
                "w-full text-left p-4 rounded-xl border transition-all",
                selectedModel === model.value
                  ? "border-gray-950 bg-gray-50"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0",
                    selectedModel === model.value ? "border-gray-950 bg-gray-950" : "border-gray-300"
                  )} />
                  <span className="text-sm font-medium text-gray-900">{model.label}</span>
                </div>
                <span className={cn(
                  "text-xs px-2.5 py-0.5 rounded-full font-medium",
                  model.free ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                )}>
                  {model.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500 ml-6">{model.description}</p>
            </button>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-5 h-11 rounded-full bg-gray-950 hover:bg-gray-800 text-white"
        >
          {saving ? "Saving..." : "Save settings"}
        </Button>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Environment variables</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          To use paid models, add the relevant API key to your <code className="bg-amber-100 px-1 rounded">.env.local</code> file:
          <br /><code className="bg-amber-100 px-1 rounded">OPENAI_API_KEY</code> for GPT-4o
          <br /><code className="bg-amber-100 px-1 rounded">ANTHROPIC_API_KEY</code> for Claude
        </p>
      </div>
    </div>
  )
}
