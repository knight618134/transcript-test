'use client'
import { Upload } from 'lucide-react'

type UploadSectionProps = {
  uploadDisplayName: string
  uploadYoutubeUrl: string
  uploadExcel: File | null
  onDisplayNameChange: (value: string) => void
  onYoutubeUrlChange: (value: string) => void
  onExcelChange: (file: File | null) => void
  onUpload: () => void
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
  isDarkTheme
}: UploadSectionProps) {
  return (
    <div className={`bg-white/80 ${isDarkTheme ? 'dark:bg-slate-800/80' : ''} backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border ${
      isDarkTheme ? 'border-slate-700/50' : 'border-white/50'
    }`}>
      <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-6 flex items-center gap-3">
        <Upload size={28} />
        上傳新檔案
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 items-end">
        {/* 名稱輸入 */}
        <input
          type="text"
          placeholder="顯示名稱（例如：日文對話1）"
          value={uploadDisplayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          className="h-14 sm:h-16 px-4 sm:px-6 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-emerald-400 dark:focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-lg transition-all md:col-span-1"
        />
        
        {/* Excel 上傳 */}
        <div className="md:col-span-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => onExcelChange(e.target.files?.[0] || null)}
            className="hidden"
            id="excel-upload"
          />
          <label 
            htmlFor="excel-upload" 
            className="block w-full h-14 sm:h-16 border-2 border-dashed border-emerald-300 dark:border-emerald-500 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-800/30 cursor-pointer transition-all flex items-center justify-center text-lg font-medium text-emerald-700 dark:text-emerald-400 hover:shadow-lg"
          >
            {uploadExcel ? uploadExcel.name : '選擇 Excel 檔案'}
          </label>
        </div>
        
        {/* YouTube 連結 */}
        <input
          type="text"
          placeholder="貼上 YouTube 連結或 ID"
          value={uploadYoutubeUrl}
          onChange={(e) => onYoutubeUrlChange(e.target.value)}
          className="h-14 sm:h-16 px-4 sm:px-6 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 text-lg transition-all"
        />
        
        {/* 上傳按鈕 */}
        <button
          onClick={onUpload}
          disabled={!uploadExcel || !uploadYoutubeUrl || !uploadDisplayName}
          className="h-14 sm:h-16 px-8 sm:px-12 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          🚀 上傳
        </button>
      </div>
    </div>
  )
}
