import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('agent_results')
    .select(`
      *,
      company:funded_companies(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Add composite score and sort
  const enriched = (data || [])
    .map((r) => ({ ...r, composite_score: (r.hiring_score * r.fit_score) / 100 }))
    .sort((a, b) => b.composite_score - a.composite_score)

  return NextResponse.json(enriched)
}
