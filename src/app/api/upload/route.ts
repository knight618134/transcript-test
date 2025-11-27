import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  console.log('🔥 API HIT - Supabase URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const formData = await request.formData()
    const excelFile = formData.get('excel') as File
    const youtubeUrl = formData.get('youtubeUrl') as string
    const displayName = formData.get('displayName') as string || excelFile.name
    console.log('📁 File:', excelFile?.name, 'URL:', youtubeUrl)
    
    if (!excelFile || !youtubeUrl) {
      return NextResponse.json({ error: '缺少檔案或連結' }, { status: 400 })
    }

    // 上傳檔案
    const fileExt = excelFile.name.split('.').pop()
    const filePath = `public/${Date.now()}-${excelFile.name}`
    
    console.log('📤 Uploading to:', filePath)
    const { error: uploadError } = await supabase.storage
      .from('excel-files')
      .upload(filePath, excelFile)

    if (uploadError) {
      console.error('❌ Upload Error:', uploadError)
      return NextResponse.json({ error: `上傳失敗: ${uploadError.message}` }, { status: 500 })
    }

    // 取得公開 URL
    const { data } = supabase.storage.from('excel-files').getPublicUrl(filePath)
    
    // 儲存到資料庫
    const { error: dbError } = await supabase
      .from('entries')
      .insert({ filename: excelFile.name, youtube_url: youtubeUrl, file_path: filePath,display_name: displayName  })

    if (dbError) {
      console.error('❌ DB Error:', dbError)
      return NextResponse.json({ error: `資料庫錯誤: ${dbError.message}` }, { status: 500 })
    }

    console.log('✅ SUCCESS!')
    return NextResponse.json({ success: true, fileUrl: data.publicUrl })
  } catch (error: any) {
    console.error('💥 FULL ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
