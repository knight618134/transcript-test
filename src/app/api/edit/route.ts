import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { id, display_name, youtube_url } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: '缺少 ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('entries')
      .update({ 
        display_name: display_name || null,
        youtube_url: youtube_url || null 
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('編輯失敗:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
