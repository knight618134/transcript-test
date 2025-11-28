// app/api/fetch-multilang-subtitles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchTranscript } from "youtube-transcript-plus";
import { supabase } from "@/lib/supabase";

// 🔥 內建簡繁轉換
const simplifyToTraditional = (text: string): string => {
  const mapping: Record<string, string> = {
    '体': '體', '里': '裡', '发': '發', '们': '們', '个': '個',
    '说': '說', '着': '著', '这': '這', '那': '那', '为': '為',
    '业': '業', '并': '並', '国': '國', '学': '學', '校': '校',
    '师': '師', '面': '面', '气': '氣', '开': '開', '门': '門',
    '风': '風', '爱': '愛', '马': '馬', '车': '車', '鱼': '魚',
    '电': '電', '云': '雲', '鸡': '雞', '饭': '飯', '队': '隊',
    '书': '書', '话': '話', '难': '難', '丽': '麗', '坏': '壞',
    '龙': '龍', '钟': '鐘', '黄': '黃', '银': '銀', '灯': '燈',
  };
  return text.replace(new RegExp(Object.keys(mapping).join('|'), 'g'), 
    match => mapping[match as keyof typeof mapping] || match);
};

// 🔥 多語言碼優先順序（繁體優先）
const CHINESE_LANGS = [
  "zh-TW",    // 台灣繁體
  "zh-Hant",  // 繁體中文
  "zh-HK",    // 香港繁體
  "zh",       // 通用中文
  "zh-Hans"   // 簡體（最後選項）
];

// 🔥 精準時間分組
const groupByPreciseTime = (items: any[]) => {
  const groups: Record<number, any[]> = {};
  items.forEach(item => {
    const timeKey = Math.round(item.offset * 2) / 2;
    if (!groups[timeKey]) groups[timeKey] = [];
    groups[timeKey].push(item);
  });
  return Object.entries(groups)
    .map(([timeKey, groupItems]) => ({
      time: parseFloat(timeKey),
      items: groupItems,
      duration: Math.max(...groupItems.map((i: any) => i.duration || 4)),
    }))
    .sort((a, b) => a.time - b.time);
};

export async function POST(request: NextRequest) {
  try {
    const { videoId, displayName } = await request.json();
    if (!videoId || videoId.length !== 11) {
      return NextResponse.json({ error: "無效的 YouTube ID" }, { status: 400 });
    }

    // 🔥 先抓日文
    const jaResult = await fetchTranscript(videoId, { lang: "ja" }).catch(() => []);
    if (!jaResult.length) {
      return NextResponse.json({ error: "找不到日文字幕" }, { status: 404 });
    }

    // 🔥 智慧偵測中文（多語言碼嘗試）
    let bestTranslation: { transcript: any[]; lang: string } = { transcript: [], lang: 'none' };
    
    for (const lang of CHINESE_LANGS) {
      try {
        console.log(`🔍 嘗試語言: ${lang}`);
        const transcript = await fetchTranscript(videoId, { lang });
        
        if (transcript.length > 0) {
          console.log(`✅ 找到 ${lang}: ${transcript.length} 行`);
          
          // 如果是簡體，轉繁體
          let processedTranscript = transcript;
          if (lang === "zh-Hans") {
            processedTranscript = transcript.map((t: any) => ({
              ...t,
              text: simplifyToTraditional(t.text || '')
            }));
          }
          
          bestTranslation = { transcript: processedTranscript, lang: 'zh-TW' };
          console.log(`🎉 選用語言: ${lang} (${transcript.length}行)`);
          break;
        }
      } catch (e) {
        console.log(`❌ ${lang} 失敗`);
      }
    }

    // 最後嘗試英文
    if (!bestTranslation.transcript.length) {
      try {
        const enTranscript = await fetchTranscript(videoId, { lang: "en" });
        if (enTranscript.length > 0) {
          bestTranslation = { transcript: enTranscript, lang: 'en' };
          console.log(`📖 最終使用英文: ${enTranscript.length}行`);
        }
      } catch (e) {
        console.log("❌ 英文也沒有");
      }
    }

    const jaGroups = groupByPreciseTime(jaResult);
    const translationGroups = groupByPreciseTime(bestTranslation.transcript);

    // 🔥 生成三軌字幕
    const multilangTranscript = jaGroups.map((jaGroup, idx) => {
      const time = jaGroup.time;
      const original = jaGroup.items.map((i: any) => i.text.trim()).join(" ");

      if (!original.trim()) return null;

      const translationGroup = translationGroups.find(tg => {
        const tolerance = Math.min(tg.items.length * 0.5, 3);
        return Math.abs(tg.time - time) <= tolerance;
      });
      
      const translation = translationGroup
        ? translationGroup.items.map((i: any) => i.text.trim()).join(" ")
        : "";

      const nextTime = jaGroups[idx + 1]?.time || time + 4;
      const duration = Math.max(nextTime - time, 2);

      return {
        id: idx + 1,
        subtitle: original.trim(),
        romaji: '',
        translation: translation.trim(),
        start: Math.round(time),
        duration: Math.round(duration),
        original_japanese: original,
        has_kanji: true,
        has_hiragana: false,
        has_translation: !!translation.trim(),
        language: bestTranslation.lang === 'zh-TW' ? 'zh' : 'en',
        debug_lang: bestTranslation.lang,  // 除錯用
      };
    }).filter(Boolean);

    // 儲存到 Supabase
    const filename = `youtube_${videoId}_${Date.now()}`;
    const filePath = `${filename}.json`;
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL}/excel-files/${filePath}`;

    const dbEntry = {
      id: Date.now(),
      filename,
      display_name: displayName || `三軌字幕 ${videoId.slice(0, 8)}`,
      youtube_url: videoId,
      file_url: publicUrl,
      file_path: filePath,
      source_type: "youtube",
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from("entries").insert(dbEntry);
      await supabase.storage
        .from("excel-files")
        .upload(filePath, JSON.stringify(multilangTranscript, null, 2), {
          contentType: "application/json",
          upsert: true,
        });
    } catch (e) {
      console.warn("儲存失敗:", e);
    }

    return NextResponse.json({
      success: true,
      entry: dbEntry,
      transcript: multilangTranscript,
      stats: {
        totalLines: multilangTranscript.length,
        language_used: bestTranslation.lang,
        japanese_lines: jaResult.length,
        available_languages: CHINESE_LANGS,
        sample: multilangTranscript.slice(0, 3),
      },
    });

  } catch (error: any) {
    console.error("❌ 錯誤:", error);
    return NextResponse.json({ error: "字幕抓取失敗", details: error.message }, { status: 400 });
  }
}
