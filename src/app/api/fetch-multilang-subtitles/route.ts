// app/api/fetch-multilang-subtitles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from "youtube-transcript-plus";
import { supabase } from "@/lib/supabase"; // 你的 Supabase

export async function POST(request: NextRequest) {
  try {
    const { videoId, displayName } = await request.json();

    // 🔥 支援繁體中文優先
    const jaTranscript = await fetchTranscript(videoId, { lang: "ja" });
    
    let zhTranscript: any[] = [];
    // 繁體優先 → 簡體備用
    try {
      zhTranscript = await fetchTranscript(videoId, { lang: "zh-TW" });
    } catch (e) {
      try {
        zhTranscript = await fetchTranscript(videoId, { lang: "zh-Hans" });
      } catch (e2) {
        console.log("無中文字幕");
      }
    }

    // 🔥 修正：保留完整平假名（不移除漢字）
    const processJapaneseText = (text: string) => {
      // 只提取平假名，保留漢字原樣
      const hiraganaOnly = text.match(/[\u3040-\u309F]/g)?.join('') || '';
      const kanjiAndPunctuation = text.replace(/[\u3040-\u309F]/g, ''); // 移除平假名保留漢字+標點
      
      return {
        original: text,
        kanji: kanjiAndPunctuation.trim(),
        hiragana: hiraganaOnly,
      };
    };

    const multilangTranscript = jaTranscript.map((item, index) => {
      const jpProcessed = processJapaneseText(item.text);
      
      // 時間戳匹配中文
      const chineseMatch = zhTranscript.find(t => 
        Math.abs(t.offset - item.offset) < 2000
      )?.text || "";

      return {
        id: index + 1,
        subtitle: jpProcessed.kanji || jpProcessed.original,
        romaji: jpProcessed.hiragana,
        translation: chineseMatch,
        start: Math.floor(item.offset / 1000),
        duration: 8,
        original_japanese: jpProcessed.original,
      };
    });

    // 🔥 儲存到資料庫（模仿 Excel）
    const { data, error } = await supabase
      .from("entries")
      .insert({
        filename: `youtube_${videoId}_${Date.now()}.json`,
        display_name: displayName || `三軌字幕 ${videoId.slice(0, 8)}`,
        youtube_url: videoId,
        file_path: `youtube_${videoId}`, // JSON 路徑
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      entry: data, // 資料庫 entry 給前端用
      transcript: multilangTranscript,
      stats: {
        totalLines: multilangTranscript.length,
        hasChinese: zhTranscript.length > 0,
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "字幕抓取失敗", details: error.message },
      { status: 400 }
    );
  }
}
