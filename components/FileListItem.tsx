"use client";
import { Play, Edit3, Trash2, Save, X, Clock } from "lucide-react";
import { Upload } from "lucide-react";

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

type FileListItemProps = {
  entry: ExcelEntry;
  isDarkTheme: boolean;
  onPlay: (entry: ExcelEntry) => void;
  onEdit: (entry: ExcelEntry) => void;
  onDelete: (id: number) => void;
  onSave: (entry: ExcelEntry) => void;
  onCancel: (entry: ExcelEntry) => void;
  onNameChange: (entry: ExcelEntry, name: string) => void;
  onUrlChange: (entry: ExcelEntry, url: string) => void;
};

export function FileListItem({
  entry,
  isDarkTheme,
  onPlay,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onNameChange,
  onUrlChange,
}: FileListItemProps) {
  return (
    <div
      className={`p-3 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
        entry.enabled
          ? "border-blue-400 dark:border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-2xl ring-2 ring-blue-200/50 dark:ring-blue-500/30"
          : "border-gray-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500 bg-white/70 dark:bg-slate-800/50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3 sm:gap-4">
        {/* 🔥 手機：Radio + 日期獨立一行 */}
        <div className="flex justify-between sm:hidden mb-3 pb-2 border-b border-gray-200/50 dark:border-slate-600/50">
          <input
            type="radio"
            checked={entry.enabled}
            onChange={() => {}}
            className="w-4 h-4 text-blue-600 cursor-pointer flex-shrink-0"
            aria-label="選擇檔案"
          />
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
            {new Date(entry.created_at).toLocaleDateString("zh-TW", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* 🔥 桌面：原本的 radio 位置 */}
        {!entry.editing && (
          <input
            type="radio"
            checked={entry.enabled}
            onChange={() => {}}
            className="w-5 h-5 sm:w-6 sm:h-6 mt-1 flex-shrink-0 hidden sm:flex text-blue-600 cursor-pointer"
            aria-label="選擇檔案"
          />
        )}

        {/* 🔥 內容區 - 手機全寬，桌面有間距 */}
        <div className="flex-1 min-w-0 space-y-2 sm:pr-4 w-full sm:w-auto">
          {entry.editing ? (
            <>
              {/* 🔥 手機：輸入框全寬，減少 padding */}
              <input
                type="text"
                value={entry.temp_display_name || ""}
                onChange={(e) => onNameChange(entry, e.target.value)}
                className="w-full p-2 sm:p-3 border-2 border-blue-300 dark:border-blue-500 rounded-xl bg-blue-50 dark:bg-blue-950/50 font-bold text-base sm:text-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="輸入顯示名稱"
                aria-label="檔案名稱"
              />
              <input
                type="text"
                value={entry.temp_youtube_url || ""}
                onChange={(e) => onUrlChange(entry, e.target.value)}
                className="w-full p-2 sm:p-3 border-2 border-yellow-300 dark:border-yellow-500 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 text-sm font-mono"
                placeholder="輸入 YouTube URL 或 ID"
                aria-label="YouTube 連結"
              />
            </>
          ) : (
            <>
              <div className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                📄 {entry.display_name}
              </div>
              {/* 🔥 來源標記 + YouTube ID（新） */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {/* 自動判斷來源 */}
                {entry.filename.includes("youtube_") ? (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900/50 dark:to-orange-900/50 dark:text-yellow-200 rounded-full font-medium text-xs shadow-sm">
                    ✨ YouTube 三軌字幕
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 rounded-full font-medium text-xs shadow-sm">
                    📊 Excel 字幕
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="flex items-center gap-1 mb-1 sm:mb-0">
                  🎥 YouTube:
                </span>
                <span className="font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-xs truncate max-w-[150px] sm:max-w-[200px]">
                  {entry.youtube_url.slice(0, 20)}...
                </span>
              </div>
            </>
          )}
        </div>

        {/* 🔥 操作按鈕區 - 手機垂直堆疊，桌面水平 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 ml-auto sm:ml-0 flex-shrink-0 space-y-2 sm:space-y-0 w-full sm:w-auto">
          {entry.editing ? (
            <>
              {/* 🔥 編輯狀態按鈕 - 手機垂直 */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onSave(entry)}
                  className="flex-1 sm:flex-none p-2.5 sm:p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                  title="儲存變更"
                  aria-label="儲存"
                >
                  <Save
                    size={18}
                    className="sm:inline hidden mx-auto block sm:mr-1"
                  />
                  <span className="sm:hidden text-xs">儲存</span>
                  <span className="hidden sm:inline">儲存</span>
                </button>

                <button
                  onClick={() => onCancel(entry)}
                  className="flex-1 sm:flex-none p-2.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all shadow-md hover:shadow-lg font-medium"
                  title="取消編輯"
                  aria-label="取消"
                >
                  <X
                    size={18}
                    className="sm:inline hidden mx-auto block sm:mr-1"
                  />
                  <span className="sm:hidden text-xs">取消</span>
                  <span className="hidden sm:inline">取消</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 🔥 正常狀態按鈕 - 手機垂直堆疊 */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(entry);
                  }}
                  className="flex-1 sm:flex-none p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl rounded-2xl transition-all flex-shrink-0 scale-100 hover:scale-105 active:scale-95 font-medium"
                  title="開始學習"
                  aria-label="播放"
                >
                  <Play size={18} className="mx-auto block sm:inline" />
                  <span className="hidden sm:inline ml-1">播放</span>
                </button>

                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                    className="p-2.5 sm:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all shadow-md hover:shadow-lg flex-1 sm:flex-none"
                    title="編輯檔案"
                    aria-label="編輯"
                  >
                    <Edit3 size={16} className="mx-auto block sm:inline" />
                    <span className="hidden sm:inline ml-1 text-xs">編輯</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                    className="p-2.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-all shadow-md hover:shadow-lg flex-1 sm:flex-none"
                    title="刪除檔案"
                    aria-label="刪除"
                  >
                    <Trash2 size={16} className="mx-auto block sm:inline" />
                    <span className="hidden sm:inline ml-1 text-xs">刪除</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 🔥 桌面日期顯示 */}
          {!entry.editing && (
            <div className="hidden sm:flex sm:items-center sm:gap-1 sm:whitespace-nowrap sm:ml-2 sm:text-xs sm:text-gray-400 dark:sm:text-gray-500">
              <Clock size={12} />
              {new Date(entry.created_at).toLocaleDateString("zh-TW", {
                month: "short",
                day: "numeric",
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
