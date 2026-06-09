import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Use service client to bypass RLS on storage
  const serviceClient = await createServiceClient()
  const filePath = `${user.id}/resume.pdf`

  const { error: uploadError } = await serviceClient.storage
    .from('resumes')
    .upload(filePath, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = serviceClient.storage.from('resumes').getPublicUrl(filePath)

  // Update profile with resume info
  await serviceClient
    .from('profiles')
    .update({ resume_url: urlData.publicUrl, resume_text: file.name })
    .eq('id', user.id)

  return NextResponse.json({ url: urlData.publicUrl, name: file.name })
}
