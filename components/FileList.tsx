'use client'
import { Upload } from 'lucide-react'
import { FileListItem } from './FileListItem'

type ExcelEntry = {
  id: number
  filename: string
  display_name: string
  youtube_url: string
  file_url: string
  enabled: boolean
  editing?: boolean
  temp_display_name?: string
  temp_youtube_url?: string
  created_at: string
}

type FileListProps = {
  entries: ExcelEntry[]
  isDarkTheme: boolean
  onPlay: (entry: ExcelEntry) => void
  onEdit: (entry: ExcelEntry) => void
  onDelete: (id: number) => void
  onSave: (entry: ExcelEntry) => void
  onCancel: (entry: ExcelEntry) => void
  onNameChange: (entry: ExcelEntry, name: string) => void
  onUrlChange: (entry: ExcelEntry, url: string) => void
}

export function FileList({
  entries,
  isDarkTheme,
  onPlay,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onNameChange,
  onUrlChange
}: FileListProps) {
  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border overflow-hidden ${
      isDarkTheme ? 'border-slate-700/50' : 'border-white/50'
    }`}>
      {/* 🔥 手機：無內邊距，桌面有適當內邊距 */}
      <div className="p-3 sm:p-6 lg:p-8 max-h-[500px] sm:max-h-96 overflow-y-auto">
        
        {/* 🔥 響應式標題 */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 truncate">
            📋 我的檔案 ({entries.length})
          </h3>
          {/* 🔥 手機顯示總數 */}
          {entries.length > 0 && (
            <p className="text-xs sm:hidden text-gray-500 dark:text-gray-400 mt-1">
              點擊播放開始學習
            </p>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          {entries.length === 0 ? (
            /* 🔥 手機友好的空狀態 */
            <div className="text-center py-12 px-4 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                📤 還沒有檔案
              </p>
              <p className="text-sm opacity-75">上傳 Excel + YouTube 開始學習吧！</p>
            </div>
          ) : (
            entries.map((entry) => (
              <FileListItem
                key={entry.id}
                entry={entry}
                isDarkTheme={isDarkTheme}
                onPlay={onPlay}
                onEdit={onEdit}
                onDelete={onDelete}
                onSave={onSave}
                onCancel={onCancel}
                onNameChange={onNameChange}
                onUrlChange={onUrlChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
