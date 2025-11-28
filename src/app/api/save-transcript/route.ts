import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { entry, transcript } = await request.json();

    // 1. 在 DB 新增條目
    const { data, error } = await supabase
      .from("entries")
      .insert({
        filename: entry.filename,
        display_name: entry.display_name,
        youtube_url: entry.youtube_url,
        file_path: entry.filename + ".json", // 例如存成 json
        created_at: entry.created_at,
      })
      .select()
      .single();
    if (error) throw error;

    // 2. 將字幕 JSON 存到 Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("excel-files")
      .upload(entry.filename + ".json", new Blob([JSON.stringify(transcript)]), {
        upsert: true,
      });
    if (storageError) throw storageError;

    return NextResponse.json({ success: true, entry: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
