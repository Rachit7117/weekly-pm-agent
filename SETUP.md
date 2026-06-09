# Weekly PM Opportunities Agent — Setup Guide

## 1. Create accounts (all free)

| Service | URL | What to get |
|---|---|---|
| Supabase | supabase.com | Project URL + anon key + service role key |
| Google AI Studio | aistudio.google.com | Gemini API key |
| Tavily | tavily.com | API key |
| Firecrawl | firecrawl.dev | API key |
| Trigger.dev | trigger.dev | Secret key + public key + project ID |
| Vercel | vercel.com | Connect GitHub repo |

---

## 2. Set up Supabase

1. Create a new project at supabase.com
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial.sql`
3. Go to **Storage** → create a bucket named `resumes` (set to private)
4. Go to **Authentication** → **Providers** → enable Google OAuth
5. Add `https://your-vercel-url.vercel.app/auth/callback` to **Redirect URLs**

---

## 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

---

## 4. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 5. Deploy to Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/weekly-pm-agent.git
git push -u origin main
```

Then:
1. Go to vercel.com → Import project from GitHub
2. Add all environment variables from `.env.local`
3. Deploy

---

## 6. Set up Trigger.dev weekly job

```bash
# Install Trigger.dev CLI
npm install -g @trigger.dev/cli@latest

# Login
npx trigger.dev@latest login

# Deploy the weekly job
npx trigger.dev@latest deploy
```

Add `TRIGGER_PROJECT_ID` to your `.env.local` (found in Trigger.dev dashboard → project settings).

---

## 7. First run

1. Sign up at your app URL
2. Go to **Profile** and fill in your details
3. Go to **Dashboard** and click **Run agent** to trigger manually
4. The Trigger.dev job runs automatically every Monday at 8 AM
