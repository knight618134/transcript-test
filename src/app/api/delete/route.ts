import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
    }

    // 1. 先取得檔案路徑
    const { data: entry } = await supabase
      .from('entries')
      .select('file_path')
      .eq('id', id)
      .single()

    if (entry?.file_path) {
      // 2. 刪除 Storage 檔案
      await supabase.storage.from('excel-files').remove([entry.file_path])
    }

    // 3. 刪除資料庫記錄
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('刪除失敗:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
