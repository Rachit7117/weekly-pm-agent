"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success("Account created! Please sign in.")
      window.location.href = "/login"
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-950">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start discovering PM opportunities</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label className="text-sm text-gray-700 mb-1.5 block">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-xl border-gray-200"
              required
            />
          </div>
          <div>
            <Label className="text-sm text-gray-700 mb-1.5 block">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-xl border-gray-200"
              minLength={6}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full bg-gray-950 hover:bg-gray-800 text-white"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
