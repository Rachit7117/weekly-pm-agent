"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Profile, PMFocus, WorkPreference } from "@/types"

const pmFocusOptions: { value: PMFocus; label: string }[] = [
  { value: "product", label: "Product PM" },
  { value: "growth", label: "Growth PM" },
  { value: "platform", label: "Platform PM" },
  { value: "ai", label: "AI/ML PM" },
]

const workPrefOptions: { value: WorkPreference; label: string }[] = [
  { value: "remote", label: "Remote only" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
  { value: "open", label: "Open to anything" },
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (data) setProfile(data)
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let resumeUrl = profile.resume_url
      let resumeText = profile.resume_text

      // Upload resume if provided
      if (resumeFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(`${user.id}/resume.pdf`, resumeFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(uploadData.path)
        resumeUrl = urlData.publicUrl
        resumeText = `Resume uploaded: ${resumeFile.name}`
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, resume_url: resumeUrl, resume_text: resumeText }),
      })

      if (res.ok) {
        toast.success("Profile saved!")
      } else {
        toast.error("Failed to save profile")
      }
    } catch {
      toast.error("Something went wrong")
    }
    setSaving(false)
  }

  const set = (field: keyof Profile, value: string | number | null) =>
    setProfile((p) => ({ ...p, [field]: value }))

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}</div>
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-950">Your Profile</h1>
        <p className="text-gray-500 text-sm mt-1">This powers the AI fit scoring and outreach personalization.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic info</h2>

          <Field label="Full name">
            <Input
              value={profile.name || ""}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Alex Johnson"
              className="h-11 rounded-xl border-gray-200"
              required
            />
          </Field>

          <Field label="LinkedIn URL">
            <Input
              value={profile.linkedin_url || ""}
              onChange={(e) => set("linkedin_url", e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="h-11 rounded-xl border-gray-200"
            />
          </Field>

          <Field label="Current role">
            <Input
              value={profile.current_role_title || ""}
              onChange={(e) => set("current_role_title", e.target.value)}
              placeholder="e.g. Senior PM at Stripe"
              className="h-11 rounded-xl border-gray-200"
            />
          </Field>

          <Field label="Years of PM experience">
            <Input
              type="number"
              min={0}
              max={30}
              value={profile.years_experience || ""}
              onChange={(e) => set("years_experience", parseInt(e.target.value))}
              placeholder="e.g. 4"
              className="h-11 rounded-xl border-gray-200"
            />
          </Field>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">PM focus & preferences</h2>

          <Field label="PM focus area">
            <Select value={profile.pm_focus ?? undefined} onValueChange={(v) => set("pm_focus", v)}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200">
                <SelectValue placeholder="Select focus" />
              </SelectTrigger>
              <SelectContent>
                {pmFocusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Work preference">
            <Select value={profile.work_preference ?? undefined} onValueChange={(v) => set("work_preference", v)}>
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

          <Field label="Preferred location (city or region)">
            <Input
              value={profile.preferred_location || ""}
              onChange={(e) => set("preferred_location", e.target.value)}
              placeholder="e.g. San Francisco, NYC, or Remote"
              className="h-11 rounded-xl border-gray-200"
            />
          </Field>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Resume</h2>
          <Field label="Upload resume (PDF)">
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-600 file:mr-3 file:text-xs file:font-medium file:bg-gray-950 file:text-white file:rounded-full file:px-4 file:py-1.5 file:border-0 file:cursor-pointer"
              />
              {profile.resume_url && (
                <p className="text-xs text-emerald-600">✓ Resume already uploaded</p>
              )}
            </div>
          </Field>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full h-11 rounded-full bg-gray-950 hover:bg-gray-800 text-white"
        >
          {saving ? "Saving..." : "Save profile"}
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
