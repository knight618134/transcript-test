// components/FileManager.tsx
'use client'
import { useState } from 'react'
import { FileText, Play, Trash2, Edit3, Save, X, Upload, Clock } from 'lucide-react'  // ✅ 新增 Play

export default function FileManager() {
  return null // 不直接渲染，使用子元件
}

FileManager.Menu = function Menu({ currentTab, setCurrentTab, setShowMenu, activeEntry }) {
  return (
    <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border w-11/12 max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">選單</h2>
          <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-lg">
          <button 
            className={`w-full p-4 rounded-2xl font-semibold flex items-center gap-3 transition-all ${
              currentTab === 'manage'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => {
              setCurrentTab('manage')
              setShowMenu(false)
            }}
          >
            <FileText size={24} />
            管理檔案
          </button>

          <button 
            className={`w-full p-4 rounded-2xl font-semibold flex items-center gap-3 transition-all ${
              currentTab === 'play' && activeEntry
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-70'
            }`}
            disabled={!activeEntry}
            onClick={() => {
              setCurrentTab('play')
              setShowMenu(false)
            }}
          >
            <Play size={24} />  {/* ✅ 現在有 import 可以用了 */}
            播放學習
          </button>
        </div>
      </div>
    </div>
  )
}

FileManager.Main = function Main({ 
  entries, 
  setEntries, 
  setActiveEntry, 
  loadEntries, 
  loadTranscript 
}) {
  const [uploadExcel, setUploadExcel] = useState(null)
  const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState('')
  const [uploadDisplayName, setUploadDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!uploadExcel || !uploadYoutubeUrl || !uploadDisplayName) {
      alert('請填寫完整資訊')
      return
    }
    // 上傳邏輯...
    await loadEntries()
  }

  const deleteEntry = async (id) => {
    if (confirm('確定刪除？')) {
      // 刪除邏輯...
      await loadEntries()
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 上傳區 */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border">
        <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-6 flex items-center gap-3">
          <Upload size={28} />
          上傳新檔案
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <input
            type="text"
            placeholder="顯示名稱"
            value={uploadDisplayName}
            onChange={(e) => setUploadDisplayName(e.target.value)}
            className="h-14 px-4 border-2 rounded-xl focus:border-emerald-400"
          />
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setUploadExcel(e.target.files?.[0] || null)}
            className="hidden"
            id="excel-upload"
          />
          <label htmlFor="excel-upload" className="h-14 border-2 border-dashed border-emerald-400 rounded-xl flex items-center justify-center bg-emerald-50 cursor-pointer">
            選擇 Excel
          </label>
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="YouTube 連結"
              value={uploadYoutubeUrl}
              onChange={(e) => setUploadYoutubeUrl(e.target.value)}
              className="w-full h-14 px-4 border-2 rounded-xl focus:border-blue-400"
            />
          </div>
          <button
            onClick={handleUpload}
            className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl"
          >
            🚀 上傳
          </button>
        </div>
      </div>

      {/* 檔案列表 */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border max-h-96 overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          📋 我的檔案 ({entries.length})
        </h3>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-6 rounded-2xl border-2 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group bg-white/60 dark:bg-gray-700/40 hover:border-blue-300"
              onClick={() => loadTranscript(entry)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-none w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                  {entry.display_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600">
                    📄 {entry.display_name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Clock size={16} />
                    <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs truncate max-w-[200px]">
                      {entry.youtube_url.slice(0, 20)}...
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteEntry(entry.id)
                    }}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              📤 上傳你的第一個檔案開始學習吧！
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
