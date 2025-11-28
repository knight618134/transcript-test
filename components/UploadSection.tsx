// components/UploadSection.tsx
"use client";
import { Upload, Youtube, Download } from "lucide-react";

type UploadSectionProps = {
  uploadDisplayName: string;
  uploadYoutubeUrl: string;
  uploadExcel: File | null;
  onDisplayNameChange: (value: string) => void;
  onYoutubeUrlChange: (value: string) => void;
  onExcelChange: (file: File | null) => void;
  onUpload: () => void;
  onFetchSubtitles?: (videoId: string, displayName: string) => Promise<void>;
  isDarkTheme: boolean;
};

export function UploadSection({
  uploadDisplayName,
  uploadYoutubeUrl,
  uploadExcel,
  onDisplayNameChange,
  onYoutubeUrlChange,
  onExcelChange,
  onUpload,
  onFetchSubtitles,
  isDarkTheme,
}: UploadSectionProps) {
  const excelDisabled = !uploadExcel || !uploadYoutubeUrl || !uploadDisplayName;
  const youtubeOnly = !!uploadYoutubeUrl && !!uploadDisplayName && !uploadExcel;

  // 🔥 加強版 YouTube ID 解析
  const parseVideoId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
      /v=([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match?.[1]) return match[1];
    }
    return "";
  };

  const handleFetchSubtitles = async () => {
    if (!uploadYoutubeUrl || !uploadDisplayName || !onFetchSubtitles) {
      alert("請填寫名稱和 YouTube 連結");
      return;
    }

    const videoId = parseVideoId(uploadYoutubeUrl);
    if (!videoId || videoId.length !== 11) {
      alert(
        `請輸入有效的 YouTube 連結\n\n範例：\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n或直接：dQw4w9WgXcQ`
      );
      return;
    }

    try {
      await onFetchSubtitles(videoId, uploadDisplayName);
    } catch (error) {
      alert("抓取字幕失敗，請稍後再試");
    }
  };

  return (
    <div
      className={`
      w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl
      border border-gray-200/60 dark:border-slate-700/60 shadow-[0_18px_45px_rgba(15,23,42,0.12)]
      px-5 py-5 sm:px-8 sm:py-7
    `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
              上傳新檔案
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              傳統 Excel 或 ✨ 一鍵抓取 YouTube 三軌字幕
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 items-end">
        {/* 顯示名稱 */}
        <div className="md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            顯示名稱 <span className="text-emerald-500">*</span>
          </label>
          <input
            type="text"
            placeholder="例如：[translate:ハイキュー!!] 第1集"
            value={uploadDisplayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            className="h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 text-sm sm:text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-700 focus:border-sky-400 dark:focus:border-sky-500 transition-all"
          />
        </div>

        {/* Excel 上傳（選填） */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Excel 字幕檔（選填）
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => onExcelChange(e.target.files?.[0] || null)}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className={`
              group w-full h-11 sm:h-12 rounded-xl border border-dashed flex items-center justify-between gap-3 px-3 sm:px-4 text-sm sm:text-base cursor-pointer transition-all
              ${
                uploadExcel
                  ? "border-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : "border-slate-300 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700"
              }
            `}
          >
            <span className="truncate">
              {uploadExcel ? uploadExcel.name : "可選：上傳 Excel 字幕檔"}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              瀏覽…
            </span>
          </label>
        </div>

        {/* YouTube 連結（必填）+ 即時 ID 顯示 */}
        <div className="md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            YouTube 連結或 ID <span className="text-emerald-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ 或 dQw4w9WgXcQ"
              value={uploadYoutubeUrl}
              onChange={(e) => onYoutubeUrlChange(e.target.value)}
              className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl border bg-white/80 dark:bg-slate-800/80 text-sm sm:text-base text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-700 focus:border-yellow-400 dark:focus:border-yellow-500 transition-all"
            />
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
          </div>

          {/* 🔥 即時顯示解析結果（已修正語法） */}
          {uploadYoutubeUrl && (
            <div className="text-xs flex items-center gap-1.5 mt-1.5 p-2 bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>偵測到影片 ID:</span>
              <code className="font-mono bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-200 ml-1">
                {parseVideoId(uploadYoutubeUrl) || "❌ 無效連結"}
              </code>
            </div>
          )}
        </div>

        {/* 🔥 雙按鈕區 */}
        <div className="md:col-span-4 grid grid-cols-1 lg:grid-cols-2 gap-3 pt-2">
          <button
            onClick={onUpload}
            disabled={excelDisabled}
            className={`
              flex items-center justify-center gap-2 px-6 h-11 rounded-xl text-sm font-medium transition-all
              ${
                excelDisabled
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm hover:shadow-md"
              }
            `}
          >
            <Upload className="w-4 h-4" />
            傳統上傳
          </button>

          <button
            onClick={handleFetchSubtitles}
            disabled={!youtubeOnly || !onFetchSubtitles}
            className={`
              flex items-center justify-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold transition-all
              ${
                youtubeOnly && onFetchSubtitles
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-gray-400 text-white/70 cursor-not-allowed"
              }
            `}
          >
            <Download className="w-4 h-4" />✨ 一鍵抓字幕
          </button>
        </div>

        {/* 使用狀態提示 */}
        <div className="md:col-span-4 pt-3 text-xs text-center text-slate-500 dark:text-slate-400">
          {uploadExcel
            ? "✅ Excel + YouTube 組合模式"
            : youtubeOnly
            ? "✨ 準備一鍵抓取三軌字幕（[translate:漢字]+平假名+中文）"
            : "請填寫名稱和 YouTube 連結"}
        </div>
      </div>
    </div>
  );
}
