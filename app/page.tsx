import Link from "next/link"
import { Particles } from "@/components/layout/Particles"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col">
      <Particles />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-rose-500" />
          <span className="font-semibold text-[15px] tracking-tight text-gray-900">PM Agent</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-gray-950 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-24">
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-600 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Weekly agent · runs every Monday
        </div>

        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-gray-950 max-w-3xl leading-[1.05] mb-6">
          Land your next PM role at a{" "}
          <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-rose-500 bg-clip-text text-transparent">
            funded startup
          </span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          Every week, an AI agent discovers recently funded startups, scores your PM fit,
          and generates a tailored application path — so you know exactly how to get in.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/signup"
            className="text-base font-medium bg-gray-950 text-white px-7 py-3.5 rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02]"
          >
            Create your profile
          </Link>
          <Link
            href="/login"
            className="text-base font-medium text-gray-700 bg-gray-100 px-7 py-3.5 rounded-full hover:bg-gray-200 transition-all"
          >
            Sign in
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-16">
          {[
            { color: "bg-blue-100 text-blue-700", label: "Funding discovery" },
            { color: "bg-violet-100 text-violet-700", label: "PM hiring score" },
            { color: "bg-emerald-100 text-emerald-700", label: "Fit analysis" },
            { color: "bg-rose-100 text-rose-700", label: "Outreach strategy" },
            { color: "bg-amber-100 text-amber-700", label: "Application path" },
          ].map((f) => (
            <span key={f.label} className={`${f.color} text-xs font-medium px-3.5 py-1.5 rounded-full`}>
              {f.label}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
