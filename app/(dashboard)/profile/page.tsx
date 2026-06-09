"use client"

import { useState, useEffect, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Profile, PMFocus, WorkPreference } from "@/types"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const pmFocusOptions: { value: PMFocus; label: string; description: string }[] = [
  { value: "product", label: "Product PM", description: "Core product & roadmap" },
  { value: "growth", label: "Growth PM", description: "Acquisition & retention" },
  { value: "platform", label: "Platform PM", description: "Infrastructure & APIs" },
  { value: "ai", label: "AI/ML PM", description: "AI-first products" },
]

const workPrefOptions: { value: WorkPreference; label: string }[] = [
  { value: "remote", label: "Remote only" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
  { value: "open", label: "Open to anything" },
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Partial<Profile>>({
    pm_focus: [],
    preferred_locations: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [locationInput, setLocationInput] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (data) setProfile({
        ...data,
        pm_focus: data.pm_focus || [],
        preferred_locations: data.preferred_locations || [],
      })
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.name?.trim()) {
      toast.error("Please enter your full name")
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error("Not logged in"); setSaving(false); return }

      let resumeUrl = profile.resume_url
      let resumeText = profile.resume_text

      if (resumeFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(`${user.id}/resume.pdf`, resumeFile, { upsert: true })
        if (uploadError) {
          // Resume upload failed — save profile anyway without resume
          toast.warning("Profile saved, but resume upload failed. Check storage bucket settings.")
        } else {
          const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(uploadData.path)
          resumeUrl = urlData.publicUrl
          resumeText = resumeFile.name
        }
      }

      const payload = {
        id: user.id,
        name: profile.name,
        linkedin_url: profile.linkedin_url || null,
        current_role_title: profile.current_role_title || null,
        years_experience: profile.years_experience || null,
        pm_focus: profile.pm_focus || [],
        work_preference: profile.work_preference || null,
        preferred_locations: profile.preferred_locations || [],
        resume_url: resumeUrl || null,
        resume_text: resumeText || null,
        ai_model: profile.ai_model || "gemini-2.0-flash",
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success("Profile saved! Taking you to opportunities...")
        setTimeout(() => router.push("/dashboard"), 1500)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save profile")
      }
    } catch (err) {
      toast.error("Something went wrong: " + String(err))
    }
    setSaving(false)
  }

  // Toggle PM focus area
  const toggleFocus = (val: PMFocus) => {
    setProfile((p) => {
      const current = p.pm_focus || []
      const updated = current.includes(val)
        ? current.filter((f) => f !== val)
        : [...current, val]
      return { ...p, pm_focus: updated }
    })
  }

  // Location tag input
  const addLocation = () => {
    const loc = locationInput.trim()
    if (!loc) return
    setProfile((p) => ({
      ...p,
      preferred_locations: [...(p.preferred_locations || []), loc],
    }))
    setLocationInput("")
  }

  const removeLocation = (loc: string) => {
    setProfile((p) => ({
      ...p,
      preferred_locations: (p.preferred_locations || []).filter((l) => l !== loc),
    }))
  }

  const handleLocationKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addLocation()
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl animate-pulse space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-950">Your Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Powers your AI fit scoring and outreach personalization.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* Basic info */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Basic info</h2>

          <Field label="Full name *">
            <Input
              value={profile.name || ""}
              onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Rahul Gupta"
              className="h-11 rounded-xl border-gray-200"
              required
            />
          </Field>

          <Field label="LinkedIn URL">
            <Input
              value={profile.linkedin_url || ""}
              onChange={(e) => setProfile(p => ({ ...p, linkedin_url: e.target.value }))}
              placeholder="https://linkedin.com/in/yourname"
              className="h-11 rounded-xl border-gray-200"
            />
          </Field>

          <Field label="Current role">
            <Input
              value={profile.current_role_title || ""}
              onChange={(e) => setProfile(p => ({ ...p, current_role_title: e.target.value }))}
              placeholder="e.g. Senior PM at Razorpay"
              className="h-11 rounded-xl border-gray-200"
            />
          </Field>

          <Field label="Years of PM experience">
            <Input
              type="number"
              min={0}
              max={30}
              value={profile.years_experience || ""}
              onChange={(e) => setProfile(p => ({ ...p, years_experience: parseInt(e.target.value) || undefined }))}
              placeholder="e.g. 5"
              className="h-11 rounded-xl border-gray-200"
            />
          </Field>
        </div>

        {/* PM Focus — multi select */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">PM focus areas</h2>
          <p className="text-xs text-gray-400 -mt-2">Select all that apply</p>
          <div className="grid grid-cols-2 gap-2">
            {pmFocusOptions.map((o) => {
              const selected = (profile.pm_focus || []).includes(o.value)
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => toggleFocus(o.value)}
                  className={cn(
                    "text-left p-3.5 rounded-xl border transition-all",
                    selected
                      ? "border-gray-950 bg-gray-950 text-white"
                      : "border-gray-100 hover:border-gray-300 text-gray-700"
                  )}
                >
                  <div className="text-sm font-medium">{o.label}</div>
                  <div className={cn("text-xs mt-0.5", selected ? "text-gray-300" : "text-gray-400")}>
                    {o.description}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Work preference + locations */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Work preferences</h2>

          <Field label="Work style">
            <Select
              value={profile.work_preference ?? undefined}
              onValueChange={(v) => setProfile(p => ({ ...p, work_preference: v as WorkPreference }))}
            >
              <SelectTrigger className="h-11 rounded-xl border-gray-200">
                <SelectValue placeholder="Select preference" />
              </SelectTrigger>
              <SelectContent>
                {workPrefOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Preferred locations">
            <div className="space-y-2">
              {/* Tags */}
              {(profile.preferred_locations || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(profile.preferred_locations || []).map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
                    >
                      {loc}
                      <button type="button" onClick={() => removeLocation(loc)}>
                        <X className="w-3 h-3 text-gray-400 hover:text-gray-700" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={handleLocationKey}
                  placeholder='e.g. Delhi, Remote, Bangalore'
                  className="h-11 rounded-xl border-gray-200 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addLocation}
                  className="h-11 rounded-xl border-gray-200 px-4 text-sm"
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-400">Press Enter or comma to add multiple locations</p>
            </div>
          </Field>
        </div>

        {/* Resume */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Resume</h2>
          <Field label="Upload PDF">
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-600 file:mr-3 file:text-xs file:font-medium file:bg-gray-950 file:text-white file:rounded-full file:px-4 file:py-1.5 file:border-0 file:cursor-pointer"
              />
              {resumeFile && (
                <p className="text-xs text-blue-600">📎 {resumeFile.name} ready to upload</p>
              )}
              {!resumeFile && profile.resume_url && (
                <p className="text-xs text-emerald-600">✓ Resume already uploaded</p>
              )}
            </div>
          </Field>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full h-12 rounded-full bg-gray-950 hover:bg-gray-800 text-white text-base font-medium"
        >
          {saving ? "Saving..." : "Save profile →"}
        </Button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm text-gray-700 mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}
