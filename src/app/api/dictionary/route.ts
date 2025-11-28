// app/api/dictionary/route.ts 🔥 確保檔案路徑正確
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword");

  console.log("🔍 Dictionary API called with keyword:", keyword); // 除錯

  if (!keyword || keyword.trim() === "") {
    return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
  }

  try {
    const jishoPromise = fetch(
      `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    const englishPromise = fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`
    );

    const [jishoRes, englishRes] = await Promise.allSettled([
      jishoPromise,
      englishPromise,
    ]);

    const result: any = {
      keyword,
      definitions: [],
      examples: [],
      sources: [],
      errors: [],
    };

    // Jisho 處理
    if (jishoRes.status === "fulfilled") {
      const response = jishoRes.value;
      if (response.ok) {
        const jishoData = await response.json();
        console.log("✅ Jisho data:", jishoData.data?.length || 0);
        
        if (jishoData.data?.length > 0) {
          const entry = jishoData.data[0];
          const sense = entry.senses?.[0];
          
          result.definitions.push({
            language: "日文",
            japanese: entry.japanese?.[0]?.word || "",
            reading: entry.japanese?.[0]?.reading || "",
            text: sense?.glosses?.[0] || "查無詳細解釋",
          });
          
          result.examples.push(sense?.english_definitions?.[0] || "");
          result.sources.push("Jisho");
        }
      }
    }

    // 英文處理
    if (englishRes.status === "fulfilled") {
      const response = englishRes.value;
      if (response.ok) {
        const englishData = await response.json();
        if (Array.isArray(englishData) && englishData.length > 0) {
          const entry = englishData[0];
          const firstMeaning = entry.meanings?.[0];
          
          if (firstMeaning) {
            result.definitions.push({
              language: "英文",
              text: firstMeaning.definitions?.[0]?.definition || "",
              phonetic: entry.phonetics?.[0]?.text || "",
            });
            result.examples.push(firstMeaning.definitions?.[0]?.example || "");
            result.sources.push("DictionaryAPI");
          }
        }
      }
    }

// 🔥 確保格式正確
result.word = keyword;  // Popover 需要 word
    if (result.definitions.length === 0) {
      result.error = "查無此單字，請試試其他拼寫";
    }
    console.log("📚 Final result:", result);
    return NextResponse.json(result);

  } catch (err: any) {
    console.error("❌ Dictionary error:", err);
    return NextResponse.json(
      { error: "伺服器錯誤", keyword },
      { status: 500 }
    );
  }
}
