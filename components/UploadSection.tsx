'use client'
import { Upload, Youtube, Download } from 'lucide-react'

type UploadSectionProps = {
  uploadDisplayName: string
  uploadYoutubeUrl: string
  uploadExcel: File | null
  onDisplayNameChange: (value: string) => void
  onYoutubeUrlChange: (value: string) => void
  onExcelChange: (file: File | null) => void
  onUpload: () => void
  // 🔥 新增：一鍵抓字幕回調
  onFetchSubtitles?: (videoId: string, displayName: string, transcript: any[]) => void
  isDarkTheme: boolean
}

export function UploadSection({
  uploadDisplayName,
  uploadYoutubeUrl,
  uploadExcel,
  onDisplayNameChange,
  onYoutubeUrlChange,
  onExcelChange,
  onUpload,
  onFetchSubtitles,  // 🔥 新增
  isDarkTheme,
}: UploadSectionProps) {
  const excelDisabled = !uploadExcel || !uploadYoutubeUrl || !uploadDisplayName
  const youtubeOnly = !!uploadYoutubeUrl && !!uploadDisplayName && !uploadExcel

  // 🔥 一鍵抓字幕功能
  const handleFetchSubtitles = async () => {
    if (!uploadYoutubeUrl || !uploadDisplayName || !onFetchSubtitles) return

    const videoId = uploadYoutubeUrl.match(/(?:v=|\/)([^&\n?#]+)/)?.[1] || uploadYoutubeUrl
    if (!videoId) {
      alert('請輸入有效的 YouTube 連結')
      return
    }

    try {
      const response = await fetch('/api/fetch-multilang-subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, displayName: uploadDisplayName }),
      })

      const result = await response.json()
      
      if (result.success) {
        onFetchSubtitles(result.videoId, result.displayName, result.transcript)
      } else {
        alert(`抓取失敗：${result.error}`)
      }
    } catch (error) {
      alert('網路錯誤，請稍後再試')
    }
  }

  return (
    <div className={`
      w-full
      bg-white/95 dark:bg-slate-800/95
      backdrop-blur-xl
      rounded-3xl
      border border-gray-200/60 dark:border-slate-700/60
      shadow-[0_18px_45px_rgba(15,23,42,0.12)]
      px-5 py-5 sm:px-8 sm:py-7
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shadow-sm">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-50">
              上傳新檔案
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              選擇傳統 Excel 或一鍵抓取 YouTube 字幕 ✨
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 items-end">
        {/* 顯示名稱 */}
        <div className="md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            顯示名稱
          </label>
          <input
            type="text"
            placeholder="例如：[translate:ハイキュー!!] 第1集"
            value={uploadDisplayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            className={`
              h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-600
              bg-white/80 dark:bg-slate-800/80 text-sm sm:text-base text-slate-900 dark:text-slate-50
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-700
              focus:border-sky-400 dark:focus:border-sky-500 transition-all
            `}
          />
        </div>

        {/* Excel 上傳（保持原樣） */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            字幕 Excel 檔（選填）
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
              group w-full h-11 sm:h-12 rounded-xl border border-dashed
              ${uploadExcel 
                ? 'border-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/20' 
                : 'border-slate-300 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/60'
              }
              hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all
              flex items-center justify-between gap-3 px-3 sm:px-4 text-sm sm:text-base
            `}
          >
            <span className="truncate text-slate-700 dark:text-slate-100">
              {uploadExcel ? uploadExcel.name : '選擇 Excel 檔案（可選）'}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              瀏覽…
            </span>
          </label>
        </div>

        {/* YouTube 連結（必填） */}
        <div className="md:col-span-1 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            YouTube 連結或 ID *
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="貼上 URL 或影片 ID"
              value={uploadYoutubeUrl}
              onChange={(e) => onYoutubeUrlChange(e.target.value)}
              className={`
                w-full h-11 sm:h-12 pl-10 pr-4 px-3 sm:px-4 rounded-xl border
                ${uploadYoutubeUrl ? 'border-sky-400 ring-2 ring-sky-200/50 dark:ring-sky-700/50' : 'border-slate-200 dark:border-slate-600'}
                bg-white/80 dark:bg-slate-800/80 text-sm sm:text-base text-slate-900 dark:text-slate-50
                placeholder:text-slate-400 dark:placeholder:text-slate-500
                focus:outline-none focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-700
                transition-all
              `}
            />
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
          </div>
        </div>

        {/* 🔥 雙按鈕：傳統上傳 + 一鍵抓字幕 */}
        <div className="md:col-span-4 grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
          {/* 傳統 Excel 上傳 */}
          <button
            onClick={onUpload}
            disabled={excelDisabled}
            className={`
              flex items-center justify-center gap-2 px-6 h-11 rounded-xl text-sm font-medium
              ${excelDisabled 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm hover:shadow-md'
              }
              transition-all
            `}
          >
            <Upload className="w-4 h-4" />
            傳統上傳
          </button>

          {/* 🔥 一鍵抓字幕（新功能） */}
          <button
            onClick={handleFetchSubtitles}
            disabled={!youtubeOnly || !onFetchSubtitles}
            className={`
              flex items-center justify-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold
              ${youtubeOnly && onFetchSubtitles
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5' 
                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white/70 cursor-not-allowed'
              }
              transition-all
            `}
          >
            <Download className="w-4 h-4" />
            ✨ 一鍵抓字幕
          </button>
        </div>

        {/* 🔥 使用提示 */}
        <div className="md:col-span-4 pt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
          {uploadExcel 
            ? '✅ Excel + YouTube 組合模式' 
            : youtubeOnly 
              ? '✨ 只需 YouTube 連結即可一鍵抓取三軌字幕（漢字+平假名+中文）' 
              : '請填寫名稱和 YouTube 連結'
          }
        </div>
      </div>
    </div>
  )
}
