'use client'
import { useState, useEffect, useRef, useCallback } from 'react' // ✅ 加入 useCallback
import YouTube from 'react-youtube'
import { Upload, Play, FileText, Clock, ChevronLeft, Edit3, Trash2, Save, X, Menu, Settings, Sun, Moon, Type, Maximize2, Minimize2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { useTheme } from '@/context/ThemeContext'

type TranscriptLine = {
  id: number
  subtitle: string
  translation: string
  romaji: string
  start: number
  duration: number
}

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

export default function Home() {
  const { settings, updateSettings, toggleTheme } = useTheme()
  const [entries, setEntries] = useState<ExcelEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<ExcelEntry | null>(null)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [currentTab, setCurrentTab] = useState<'manage' | 'play'>('manage')
  const [uploadExcel, setUploadExcel] = useState<File | null>(null)
  const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState('')
  const [uploadDisplayName, setUploadDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const playerRef = useRef<any>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

// 🔥 在組件頂部正確定義 useCallback
const scrollToLine = useCallback((lineId: number) => {
  if (transcriptRef.current) {
    const el = transcriptRef.current.querySelector(`[data-id="${lineId}"]`) as HTMLElement
    el?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center', 
      inline: 'nearest' 
    })
  }
}, [])  // ✅ 空依賴陣列，避免無限循環

const handleSeekTo = useCallback((time: number) => {
  if (playerRef.current) {
    playerRef.current.seekTo(time, true)
  }
}, [])


  const parseVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : url
  }

  // 字體大小調整類別
  const fontSizeClass = settings.fontSize === 'small' ? 'text-xs sm:text-sm md:text-base' : 
                       settings.fontSize === 'medium' ? 'text-sm sm:text-base md:text-lg' : 'text-base sm:text-lg md:text-xl'
  const subtitleSizeClass = settings.subtitleSize === 'small' ? 'text-sm sm:text-base md:text-lg' : 
                           settings.subtitleSize === 'medium' ? 'text-base sm:text-lg md:text-xl' : 'text-lg sm:text-xl md:text-2xl leading-tight'

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id, filename, display_name, youtube_url, file_path, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const entriesWithUrl = data?.map((e: any) => ({
        ...e,
        file_url: `https://hbvfwkiwbyfnzliqdqlc.supabase.co/storage/v1/object/public/excel-files/${e.file_path}`,
        enabled: false,
        editing: false,
        temp_display_name: e.display_name,
        temp_youtube_url: e.youtube_url
      })) || []
      
      setEntries(entriesWithUrl)
    } catch (error) {
      console.error('載入失敗:', error)
      alert('載入檔案列表失敗')
    }
  }

  const handleUpload = async () => {
    if (!uploadExcel || !uploadYoutubeUrl || !uploadDisplayName) {
      alert('請填寫名稱、選擇檔案並輸入連結')
      return
    }

    const formData = new FormData()
    formData.append('excel', uploadExcel)
    formData.append('youtubeUrl', uploadYoutubeUrl)
    formData.append('displayName', uploadDisplayName)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const result = await res.json()

    if (result.success) {
      loadEntries()
      setUploadExcel(null)
      setUploadYoutubeUrl('')
      setUploadDisplayName('')
      alert('✅ 上傳成功！')
    } else {
      alert('❌ 上傳失敗：' + result.error)
    }
  }

  const handleEntryClick = (entry: ExcelEntry) => {
    setEntries(entries.map(e => ({ ...e, enabled: e.id === entry.id })))
    loadTranscript(entry)
  }

  const deleteEntry = async (id: number) => {
    if (!confirm('確定要刪除此檔案？')) return
    
    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      
      if (!res.ok) throw new Error('刪除失敗')
      loadEntries()
      alert('✅ 刪除成功！')
    } catch (error) {
      alert('刪除失敗')
    }
  }

  const startEdit = (entry: ExcelEntry) => {
    setEntries(entries.map(e => 
      e.id === entry.id 
        ? { ...e, editing: true, enabled: false, temp_display_name: e.display_name, temp_youtube_url: e.youtube_url }
        : { ...e, enabled: false, editing: false }
    ))
  }

  const cancelEdit = (entry: ExcelEntry) => {
    setEntries(entries.map(e => 
      e.id === entry.id ? { ...e, editing: false } : e
    ))
  }

  const updateTempValues = (entry: ExcelEntry, displayName: string, youtubeUrl: string) => {
    setEntries(entries.map(e => 
      e.id === entry.id ? { ...e, temp_display_name: displayName, temp_youtube_url: youtubeUrl } : e
    ))
  }

  const saveEdit = async (entry: ExcelEntry) => {
    try {
      const res = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: entry.id, 
          display_name: entry.temp_display_name,
          youtube_url: entry.temp_youtube_url 
        })
      })
      
      if (!res.ok) throw new Error('更新失敗')
      
      setEntries(entries.map(e => 
        e.id === entry.id 
          ? { ...e, editing: false, display_name: entry.temp_display_name!, youtube_url: entry.temp_youtube_url! }
          : e
      ))
      loadEntries()
      alert('✅ 更新成功！')
    } catch (error) {
      alert('更新失敗')
    }
  }

  const loadTranscript = async (entry: ExcelEntry) => {
    setLoading(true)
    try {
      const videoId = parseVideoId(entry.youtube_url)
      const res = await fetch(entry.file_url)
      if (!res.ok) throw new Error(`檔案載入失敗: ${res.status}`)
      
      const arrayBuffer = await res.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

      const headers = jsonData[0]
      const subtitleIdx = headers.findIndex(h => h?.toString().toLowerCase().includes('subtitle'))
      const translationIdx = headers.findIndex(h => 
        h?.toString().toLowerCase().includes('translation') || h?.toString().toLowerCase().includes('machine')
      )
      const timeIdx = headers.findIndex(h => h?.toString().toLowerCase().includes('time'))
      const romajiIdx = headers.findIndex(h => h?.toString().toLowerCase().includes('romaji'))

// 轉換時間並設定持續時間示範
const formatted: TranscriptLine[] = jsonData.slice(1).map((row, idx) => {
  const timeStr = row[timeIdx]?.toString() || '0'
  let start = 0
  if (timeStr.includes(':')) {
    const [m, s] = timeStr.split(':').map(Number)
    start = (m || 0) * 60 + (s || 0)
  } else {
    start = parseInt(timeStr) || 0
  }
  return {
    id: idx + 1,
    subtitle: row[subtitleIdx]?.toString().trim() || '',
    translation: row[translationIdx]?.toString().trim() || '',
    romaji: row[romajiIdx]?.toString().trim() || '',
    start,
    duration: 6 // 可根據需求調整或用Excel做欄位給定
  }
}).filter(line => line.subtitle)


      setTranscript(formatted)
      setActiveEntry({ ...entry, youtube_url: videoId })
      setCurrentTab('play')
    } catch (err: any) {
      alert(`載入失敗: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

// 🔥 超即時播放時間監控 - 100ms + useCallback
useEffect(() => {
  let interval: NodeJS.Timeout
  if (currentTab === 'play' && playerRef.current) {
    interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const time = Math.floor(playerRef.current.getCurrentTime() * 10) / 10
        setCurrentTime(time)
      }
    }, 100)
  }
  return () => interval && clearInterval(interval)
}, [currentTab])

// 🔥 超即時高亮 + 防抖滾動 + 安全檢查
useEffect(() => {
  if (currentTime === 0 || transcript.length === 0) return
  
  // 找最接近的字幕行（容錯範圍）
  const line = transcript.find(l => 
    currentTime >= l.start - 0.5 && currentTime < l.start + l.duration + 0.5
  ) || transcript.find(l => Math.abs(currentTime - l.start) < 2)
  
  if (line && line.id !== activeId) {  // ✅ 雙重安全檢查
    setActiveId(line.id)
    scrollToLine(line.id)  // ✅ 現在安全了
  }
}, [currentTime, transcript, activeId, scrollToLine])





  return (
    <main className={`min-h-screen transition-all duration-300 p-4 sm:p-6 lg:p-12 ${
      settings.theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-100' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto relative">

        {/* 單一頂部選單，含返回和齒輪 */}
        <header className="sticky top-0 z-50 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50 dark:border-slate-700/50 p-4 rounded-b-3xl mb-6">
          <button
            onClick={() => setCurrentTab('manage')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl"
          >
            <ChevronLeft size={20} />
            返回
          </button>

          <h1 className={`text-2xl font-bold truncate text-center flex-1 mx-4 ${
            settings.theme === 'dark'
              ? 'text-slate-100'
              : 'text-slate-900'
          }`}>
            {activeEntry ? activeEntry.display_name : '學習字幕筆記'}
          </h1>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-blue-600 text-white shadow-lg hover:shadow-xl"
          >
            <Settings size={24} />
          </button>
        </header>

        {/* 如果是播放頁 */}
        {currentTab === 'play' && activeEntry && (
          <div className="flex flex-col h-[80vh] md:h-[85vh]">

            {/* 影片區 固定高度約 50% */}
            <div className="relative flex-shrink-0 h-1/2 rounded-3xl overflow-hidden shadow-2xl border border-gray-300 dark:border-slate-700">
              <YouTube
                videoId={activeEntry.youtube_url}
                ref={playerRef}
                onReady={(e) => { playerRef.current = e.target }}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    controls: 1,
                    showinfo: 0,
                  },
                }}
                className="w-full h-full"
              />
            </div>

            {/* 獨立字幕區 可滑動，高度約50% */}
            <div
              ref={transcriptRef}
              className="flex-grow overflow-y-auto mt-4 p-4 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
            >
              {transcript.map(line => (
                <div
                  key={line.id}
                  data-id={line.id}
                  className={`p-4 rounded-xl mb-2 cursor-pointer transition-shadow ${
                    activeId === line.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-blue-100 dark:hover:bg-blue-900'
                  }`}
                  onClick={() => handleSeekTo(line.start)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono">{Math.floor(line.start / 60).toString().padStart(2, '0')}:{(line.start % 60).toString().padStart(2, '0')}</span>
                    {line.romaji && <span className="italic text-sm">{line.romaji}</span>}
                  </div>
                  <p className={`font-bold ${subtitleSizeClass}`}>{line.subtitle}</p>
                  {line.translation && <p className="mt-1 text-sm text-black-600 dark:text-black-400">💬 {line.translation}</p>}
                </div>
              ))}
              {transcript.length === 0 && <p className="text-center text-gray-400">載入字幕中...</p>}
            </div>

          </div>
        )}

        {/* 管理頁 */}
        {currentTab === 'manage' && (
          <div className="space-y-8">
            {/* 上傳區 */}
            <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border ${
              settings.theme === 'dark' ? 'border-slate-700/50' : 'border-white/50'
            }`}>
              <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-6 flex items-center gap-3">
                <Upload size={28} />
                上傳新檔案
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 items-end">
                <input
                  type="text"
                  placeholder="顯示名稱（例如：日文對話1）"
                  value={uploadDisplayName}
                  onChange={(e) => setUploadDisplayName(e.target.value)}
                  className="h-14 sm:h-16 px-4 sm:px-6 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-emerald-400 dark:focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900 text-lg transition-all md:col-span-1"
                />
                <div className="md:col-span-2">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setUploadExcel(e.target.files?.[0] || null)}
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
                <input
                  type="text"
                  placeholder="貼上 YouTube 連結或 ID"
                  value={uploadYoutubeUrl}
                  onChange={(e) => setUploadYoutubeUrl(e.target.value)}
                  className="h-14 sm:h-16 px-4 sm:px-6 border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-blue-400 dark:focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 text-lg transition-all"
                />
                <button
                  onClick={handleUpload}
                  disabled={!uploadExcel || !uploadYoutubeUrl || !uploadDisplayName}
                  className="h-14 sm:h-16 px-8 sm:px-12 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  🚀 上傳
                </button>
              </div>
            </div>

            {/* 檔案列表 */}
            <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border max-h-96 overflow-y-auto ${
              settings.theme === 'dark' ? 'border-slate-700/50' : 'border-white/50'
            }`}>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">📋 我的檔案 ({entries.length})</h3>
              <div className="space-y-4">
                {entries.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    📤 上傳你的第一個檔案開始學習吧！
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
                        entry.enabled
                          ? 'border-blue-400 dark:border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-2xl ring-2 ring-blue-200/50 dark:ring-blue-500/30'
                          : 'border-gray-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-500 bg-white/70 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <input
                          type="radio"
                          checked={entry.enabled}
                          onChange={() => {}}
                          className="w-5 h-5 sm:w-6 sm:h-6 mt-1 flex-shrink-0 text-blue-600 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0 space-y-2">
                          {entry.editing ? (
                            <>
                              <input
                                type="text"
                                value={entry.temp_display_name || ''}
                                onChange={(e) => updateTempValues(entry, e.target.value, entry.temp_youtube_url || '')}
                                className="w-full p-3 border-2 border-blue-300 dark:border-blue-500 rounded-xl bg-blue-50 dark:bg-blue-950/50 font-bold text-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                                placeholder="輸入顯示名稱"
                              />
                              <input
                                type="text"
                                value={entry.temp_youtube_url || ''}
                                onChange={(e) => updateTempValues(entry, entry.temp_display_name || '', e.target.value)}
                                className="w-full p-3 border-2 border-yellow-300 dark:border-yellow-500 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 text-sm font-mono"
                                placeholder="輸入 YouTube URL 或 ID"
                              />
                            </>
                          ) : (
                            <>
                              <div className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                📄 {entry.display_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                🎥 YouTube: <span className="font-mono bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-xs truncate max-w-[200px]">
                                  {entry.youtube_url.slice(0, 20)}...
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                          {entry.editing ? (
                            <>
                              <button
                                onClick={() => saveEdit(entry)}
                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-all shadow-md hover:shadow-lg"
                                title="儲存變更"
                              >
                                <Save size={20} />
                              </button>
                              <button
                                onClick={() => cancelEdit(entry)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                                title="取消編輯"
                              >
                                <X size={20} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEntryClick(entry)
                                }}
                                className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl rounded-2xl transition-all flex-shrink-0 scale-100 hover:scale-110 active:scale-95"
                                title="開始學習"
                              >
                                <Play size={20} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEdit(entry)
                                }}
                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-all shadow-md hover:shadow-lg"
                                title="編輯檔案"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteEntry(entry.id)
                                }}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-all shadow-md hover:shadow-lg"
                                title="刪除檔案"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                          <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1 whitespace-nowrap ml-2">
                            <Clock size={14} />
                            {new Date(entry.created_at).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

       

        {/* 背景遮罩 */}
        {(showMenu || showSettings) && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => {
              setShowMenu(false)
              setShowSettings(false)
            }}
          />
        )}
      </div>
    </main>
  )
}
