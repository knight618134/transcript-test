"use client";
import { useState, useEffect, useRef, useCallback } from "react"; // ✅ 加入 useCallback
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { useTheme } from "@/context/ThemeContext";
import { HeaderBar } from "@/components/HeaderBar";
import { UploadSection } from "@/components/UploadSection";
// 🔥 加上新的 import
import {
  PlaybackSection,
  type TranscriptLine,
} from "@/components/PlaybackSection";
import { FileList } from "@/components/FileList";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FooterTools } from "@/components/FooterTools";
import { DictionaryPopover } from "@/components/DictionaryPopover";

type ExcelEntry = {
  id: number;
  filename: string;
  display_name: string;
  youtube_url: string;
  file_url: string;
  enabled: boolean;
  editing?: boolean;
  temp_display_name?: string;
  temp_youtube_url?: string;
  created_at: string;
};

export default function Home() {
  const { settings, updateSettings, toggleTheme } = useTheme();
  const [entries, setEntries] = useState<ExcelEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<ExcelEntry | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

  const [currentTab, setCurrentTab] = useState<"manage" | "play">("manage");
  const [uploadExcel, setUploadExcel] = useState<File | null>(null);
  const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState("");
  const [uploadDisplayName, setUploadDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeWord, setActiveWord] = useState("");
  // 🔥 字典相關狀態
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverWord, setPopoverWord] = useState("");
  const [dictionaryResult, setDictionaryResult] = useState<any>(null);
  const [isLoadingDictionary, setIsLoadingDictionary] = useState(false);

  const onFetchSubtitles = useCallback(
    async (videoId: string, displayName: string) => {
      setLoading(true);

      try {
        const response = await fetch("/api/fetch-multilang-subtitles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId, displayName }),
        });

        const result = await response.json();

        if (result.success) {
          // 🔥 1. 建立完整條目（模仿 Excel 上傳）
          const newEntry: ExcelEntry = {
            id: result.entry.id || Date.now(),
            filename: result.entry.filename,
            display_name: result.entry.display_name,
            youtube_url: result.entry.youtube_url,
            file_url: result.entry.file_url || "", // Supabase 儲存後會有
            enabled: false, // 🔥 預設不啟動，像 Excel 一樣
            editing: false,
            temp_display_name: result.entry.display_name,
            temp_youtube_url: result.entry.youtube_url,
            created_at: result.entry.created_at,
          };

          // 🔥 2. 只更新檔案列表，不切換播放
          setEntries((prev) => {
            // 避免重複
            const exists = prev.find(
              (e) =>
                e.youtube_url === newEntry.youtube_url &&
                e.filename === newEntry.filename
            );
            if (exists) return prev;

            return [newEntry, ...prev];
          });

          // 🔥 3. 清空表單，準備下一個
          setUploadDisplayName("");
          setUploadYoutubeUrl("");
          setUploadExcel(null);

          alert(
            `✅ 成功抓取 ${result.stats.totalLines} 行三軌字幕，已加入檔案列表！`
          );
        } else {
          alert(`❌ ${result.error}`);
        }
      } catch (error) {
        alert("網路錯誤，請檢查連結");
      } finally {
        setLoading(false);
      }
    },
    [
      setLoading,
      setEntries,
      setUploadDisplayName,
      setUploadYoutubeUrl,
      setUploadExcel,
    ]
  );

  // 🔥 真實字典 API 查詢
  // Home.tsx 中的 handleDictionarySearch 函數
  // Home.tsx - 確認這段呼叫 `/api/dictionary`
  const handleDictionarySearch = async (word: string) => {
    console.log("🔍 Searching for:", word); // 除錯

    setActiveWord(word);
    setPopoverWord(word);
    setPopoverOpen(true);
    setIsLoadingDictionary(true);
    setDictionaryResult(null);

    try {
      const response = await fetch(
        `/api/dictionary?keyword=${encodeURIComponent(word)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("📚 Search result:", result); // 除錯

      setDictionaryResult(result);
    } catch (error) {
      console.error("❌ Search failed:", error);
      setDictionaryResult({
        keyword: word,
        error: "查詢失敗，請稍後再試",
        definitions: [],
        sources: [],
      });
    } finally {
      setIsLoadingDictionary(false);
    }
  };

  // 只保留這一個，給 PlaybackSection 用
  const handleSeekTo = useCallback((time: number) => {
    // PlaybackSection 內部會自己處理，這裡可留空或做其他邏輯
  }, []);

  const parseVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : url;
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("entries")
        .select(
          "id, filename, display_name, youtube_url, file_path, created_at"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const entriesWithUrl =
        data?.map((e: any) => ({
          ...e,
          file_url: `https://hbvfwkiwbyfnzliqdqlc.supabase.co/storage/v1/object/public/excel-files/${e.file_path}`,
          enabled: false,
          editing: false,
          temp_display_name: e.display_name,
          temp_youtube_url: e.youtube_url,
        })) || [];

      setEntries(entriesWithUrl);
    } catch (error) {
      console.error("載入失敗:", error);
      alert("載入檔案列表失敗");
    }
  };

  const handleUpload = async () => {
    if (!uploadExcel || !uploadYoutubeUrl || !uploadDisplayName) {
      alert("請填寫名稱、選擇檔案並輸入連結");
      return;
    }

    const formData = new FormData();
    formData.append("excel", uploadExcel);
    formData.append("youtubeUrl", uploadYoutubeUrl);
    formData.append("displayName", uploadDisplayName);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const result = await res.json();

    if (result.success) {
      loadEntries();
      setUploadExcel(null);
      setUploadYoutubeUrl("");
      setUploadDisplayName("");
      alert("✅ 上傳成功！");
    } else {
      alert("❌ 上傳失敗：" + result.error);
    }
  };

  const handleEntryClick = (entry: ExcelEntry) => {
    setEntries(entries.map((e) => ({ ...e, enabled: e.id === entry.id })));
    loadTranscript(entry);
  };

  const deleteEntry = async (id: number) => {
    if (!confirm("確定要刪除此檔案？")) return;

    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("刪除失敗");
      loadEntries();
      alert("✅ 刪除成功！");
    } catch (error) {
      alert("刪除失敗");
    }
  };

  const startEdit = (entry: ExcelEntry) => {
    setEntries(
      entries.map((e) =>
        e.id === entry.id
          ? {
              ...e,
              editing: true,
              enabled: false,
              temp_display_name: e.display_name,
              temp_youtube_url: e.youtube_url,
            }
          : { ...e, enabled: false, editing: false }
      )
    );
  };

  const cancelEdit = (entry: ExcelEntry) => {
    setEntries(
      entries.map((e) => (e.id === entry.id ? { ...e, editing: false } : e))
    );
  };

  const updateTempValues = (
    entry: ExcelEntry,
    displayName: string,
    youtubeUrl: string
  ) => {
    setEntries(
      entries.map((e) =>
        e.id === entry.id
          ? {
              ...e,
              temp_display_name: displayName,
              temp_youtube_url: youtubeUrl,
            }
          : e
      )
    );
  };

  const saveEdit = async (entry: ExcelEntry) => {
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          display_name: entry.temp_display_name,
          youtube_url: entry.temp_youtube_url,
        }),
      });

      if (!res.ok) throw new Error("更新失敗");

      setEntries(
        entries.map((e) =>
          e.id === entry.id
            ? {
                ...e,
                editing: false,
                display_name: entry.temp_display_name!,
                youtube_url: entry.temp_youtube_url!,
              }
            : e
        )
      );
      loadEntries();
      alert("✅ 更新成功！");
    } catch (error) {
      alert("更新失敗");
    }
  };

  const loadTranscript = async (entry: ExcelEntry) => {
    setLoading(true);
    try {
      const videoId = parseVideoId(entry.youtube_url);

      // 🔥 方法1：判斷 JSON 格式（YouTube 抓取）
      if (
        entry.filename.includes("youtube_") ||
        entry.file_url?.endsWith(".json")
      ) {
        console.log("🔥 載入 YouTube JSON 字幕:", entry.filename);

        const res = await fetch(entry.file_url);
        if (!res.ok) throw new Error(`JSON 檔案載入失敗: ${res.status}`);

        const jsonTranscript: TranscriptLine[] = await res.json();

        // 驗證格式
        if (!Array.isArray(jsonTranscript) || jsonTranscript.length === 0) {
          throw new Error("字幕格式錯誤（非有效 JSON）");
        }

        setTranscript(jsonTranscript);
        setActiveEntry({ ...entry, youtube_url: videoId });
        setCurrentTab("play");

        console.log(`✅ 成功載入 ${jsonTranscript.length} 行 JSON 字幕`);
        return;
      }

      // 🔥 方法2：傳統 Excel 解析（保持原邏輯）
      console.log("📊 載入 Excel 字幕:", entry.filename);

      const res = await fetch(entry.file_url);
      if (!res.ok) throw new Error(`Excel 檔案載入失敗: ${res.status}`);

      const arrayBuffer = await res.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
      }) as any[][];

      const headers = jsonData[0];
      const subtitleIdx = headers.findIndex((h) =>
        h?.toString().toLowerCase().includes("subtitle")
      );
      const translationIdx = headers.findIndex(
        (h) =>
          h?.toString().toLowerCase().includes("translation") ||
          h?.toString().toLowerCase().includes("machine")
      );
      const timeIdx = headers.findIndex((h) =>
        h?.toString().toLowerCase().includes("time")
      );
      const romajiIdx = headers.findIndex((h) =>
        h?.toString().toLowerCase().includes("romaji")
      );

      // 🔥 時間解析函式
      const parseTime = (timeStr: string): number => {
        if (!timeStr) return 0;
        if (timeStr.includes(":")) {
          const parts = timeStr.split(":");
          if (parts.length === 2) {
            const [m, s] = parts.map(Number);
            return (m || 0) * 60 + (s || 0);
          }
          if (parts.length === 3) {
            const [h, m, s] = parts.map(Number);
            return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
          }
        }
        return parseFloat(timeStr) || 0;
      };

      const formatted: TranscriptLine[] = jsonData
        .slice(1)
        .map((row, idx) => {
          const start = parseTime(row[timeIdx]?.toString() || "0");
          const nextRowStart = parseTime(
            jsonData[idx + 2]?.[timeIdx]?.toString() || "0"
          );
          const duration = nextRowStart > start ? nextRowStart - start : 8;

          return {
            id: idx + 1,
            subtitle: row[subtitleIdx]?.toString().trim() || "",
            translation: row[translationIdx]?.toString().trim() || "",
            romaji: row[romajiIdx]?.toString().trim() || "",
            start,
            duration,
          };
        })
        .filter((line) => line.subtitle);

      setTranscript(formatted);
      setActiveEntry({ ...entry, youtube_url: videoId });
      setCurrentTab("play");

      console.log(`✅ 成功載入 ${formatted.length} 行 Excel 字幕`);
    } catch (err: any) {
      console.error("載入字幕失敗:", err);
      alert(`載入失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main
      className={`min-h-dvh flex flex-col transition-all duration-300 
      px-4 pt-1 
      sm:px-6 
      lg:px-12 
      xl:px-16 
      2xl:px-24 
      ${
        settings.theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100"
          : "bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900"
      }`}
    >
      <div
        className={`
      max-w-6xl mx-auto w-full flex flex-col flex-1 relative
      lg:max-w-6xl
      xl:max-w-7xl
      2xl:max-w-screen-2xl
    `}
      >
        {/* HeaderBar */}
        <HeaderBar
          onBack={() => setCurrentTab("manage")}
          title={
            currentTab === "play" && activeEntry
              ? activeEntry.display_name
              : "學習字幕筆記"
          }
          onToggleSettings={() => setShowSettings(!showSettings)}
          isDarkTheme={settings.theme === "dark"}
          titleColor={settings.titleColor}
          showBackButton={currentTab === "play"}
        />

        {/* 設定面板 */}
        {showSettings && (
          <SettingsPanel
            settings={settings}
            updateSettings={updateSettings}
            toggleTheme={toggleTheme}
            isDarkTheme={settings.theme === "dark"}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* 主要內容區 */}
        <div className="flex-1 overflow-y-auto">
          {currentTab === "play" && activeEntry && (
            <PlaybackSection
              videoId={activeEntry.youtube_url}
              transcript={transcript}
              subtitleSize={settings.subtitleSize}
              isDarkTheme={settings.theme === "dark"}
              onSeekTo={handleSeekTo}
              showSubtitle={settings.showSubtitle}
              showRomaji={settings.showRomaji}
              showTranslation={settings.showTranslation}
              videoHeight={settings.videoHeight}
              onWordSelect={setActiveWord}
            />
          )}

          {currentTab === "manage" && (
            <div className="space-y-8">
              {/* UploadSection 和 FileList 不變 */}
              <div
                className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border ${
                  settings.theme === "dark"
                    ? "border-slate-700/50"
                    : "border-white/50"
                }`}
              >
                <UploadSection
                  uploadDisplayName={uploadDisplayName}
                  uploadYoutubeUrl={uploadYoutubeUrl}
                  uploadExcel={uploadExcel}
                  onDisplayNameChange={setUploadDisplayName}
                  onYoutubeUrlChange={setUploadYoutubeUrl}
                  onExcelChange={setUploadExcel}
                  onUpload={handleUpload}
                  isDarkTheme={settings.theme === "dark"}
                  onFetchSubtitles={onFetchSubtitles} // 🔥 新增
                />
              </div>
              <FileList
                entries={entries}
                isDarkTheme={settings.theme === "dark"}
                onPlay={handleEntryClick}
                onEdit={startEdit}
                onDelete={deleteEntry}
                onSave={saveEdit}
                onCancel={cancelEdit}
                onNameChange={(entry, name) =>
                  updateTempValues(entry, name, entry.temp_youtube_url || "")
                }
                onUrlChange={(entry, url) =>
                  updateTempValues(entry, entry.temp_display_name || "", url)
                }
              />
            </div>
          )}
        </div>

        {/* FooterTools */}
        <FooterTools
          activeWord={activeWord}
          onDictionarySearch={handleDictionarySearch}
          isDarkTheme={settings.theme === "dark"}
        />

        {/* 背景遮罩 */}
        {(showMenu || showSettings) && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => {
              setShowMenu(false);
              setShowSettings(false);
            }}
          />
        )}
      </div>

      {/* 🔥 字典 Popover（全螢幕中心顯示） */}
      <DictionaryPopover
        word={popoverWord}
        result={dictionaryResult}
        isLoading={isLoadingDictionary}
        isOpen={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        isDarkTheme={settings.theme === "dark"}
      />
    </main>
  );
}
