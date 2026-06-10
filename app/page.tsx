import Link from "next/link"
import { Particles } from "@/components/layout/Particles"
import { TypewriterText } from "@/components/layout/TypewriterText"

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

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-600 mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Weekly agent · runs every Monday
        </div>

        {/* Headline with typewriter */}
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-gray-950 max-w-3xl leading-[1.05] mb-6">
          <TypewriterText
            text="Land your next PM role at a funded startup"
            speed={35}
            delay={300}
            className="whitespace-pre-wrap"
          />
        </h1>

        {/* Subtext — fades in after headline */}
        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed animate-fade-in">
          Every week, an AI agent discovers recently funded startups, scores your PM fit,
          and generates a tailored application path — so you know exactly how to get in.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Link
            href="/signup"
            className="text-base font-medium bg-gray-950 text-white px-7 py-3.5 rounded-full hover:bg-gray-800 transition-all hover:scale-[1.02] shadow-sm"
          >
            Create your profile
          </Link>
          <Link
            href="/login"
            className="text-base font-medium text-gray-700 bg-white border border-gray-200 px-7 py-3.5 rounded-full hover:bg-gray-50 transition-all shadow-sm"
          >
            Sign in
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-16 animate-fade-in">
          {[
            { color: "bg-blue-100 text-blue-700", label: "Funding discovery" },
            { color: "bg-violet-100 text-violet-700", label: "PM hiring score" },
            { color: "bg-emerald-100 text-emerald-700", label: "Fit analysis" },
            { color: "bg-rose-100 text-rose-700", label: "Outreach strategy" },
            { color: "bg-amber-100 text-amber-700", label: "Application path" },
          ].map((f) => (
            <span
              key={f.label}
              className={`${f.color} text-xs font-medium px-3.5 py-1.5 rounded-full border border-transparent`}
            >
              {f.label}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
