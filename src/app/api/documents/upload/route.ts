import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const declarationId = formData.get('declarationId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const filePath = `${user.id}/${declarationId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Save document record
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        declaration_id: declarationId,
        client_id: user.id,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: 'client',
        document_type: 'upload',
      })
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 })
    }

    return NextResponse.json({ document: doc })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
