'use client'
import { useState, useEffect, useRef } from 'react'
import YouTubePlayer from '@/components/YouTubePlayer'
import FileManager from '@/components/FileManager'
import TranscriptList from '@/components/TranscriptList'
import Topbar from '@/components/Topbar'
import SettingsModal from '@/components/SettingsModal'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/context/ThemeContext'

export default function Home() {
  const { settings, updateSettings, toggleTheme } = useTheme()
  const [entries, setEntries] = useState([])
  const [activeEntry, setActiveEntry] = useState(null)
  const [transcript, setTranscript] = useState([])
  const [currentTime, setCurrentTime] = useState(0)
  const [activeId, setActiveId] = useState(null)
  const [currentTab, setCurrentTab] = useState('manage')
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const playerRef = useRef(null)
  const transcriptRef = useRef(null)

  // Load entries from supabase
  async function loadEntries() {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id, filename, display_name, youtube_url, file_path, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatted = data.map(e => ({
        ...e,
        file_url: `https://hbvfwkiwbyfnzliqdqlc.supabase.co/storage/v1/object/public/excel-files/${e.file_path}`,
        enabled: false,
        editing: false,
        temp_display_name: e.display_name,
        temp_youtube_url: e.youtube_url,
      }))

      setEntries(formatted)
    } catch {
      alert('載入檔案失敗')
    }
  }

  // Update current time 癥結與同步字幕滾動
  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime())
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const currentLine = transcript.find(l => l.start <= currentTime && currentTime < l.start + l.duration)
    setActiveId(currentLine?.id || null)

    if (currentLine && transcriptRef.current) {
      const el = transcriptRef.current.querySelector(`[data-id="${currentLine.id}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentTime])

  // 動態取得影片高度class
  const videoHeightClass = settings.videoHeight === 'small' ? 'min-h-[35vh] sm:min-h-[40vh]' : 
                          settings.videoHeight === 'medium' ? 'min-h-[45vh] sm:min-h-[50vh]' : 'min-h-[55vh] sm:min-h-[60vh]'

  return (
    <main
      className={`min-h-screen transition-all duration-300 p-4 sm:p-6 lg:p-12 ${settings.theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-gray-900 text-slate-100' : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900'}`}
    >
      <div className="max-w-6xl mx-auto relative">
        <Topbar 
          settings={settings} 
          setShowSettings={setShowSettings} 
          showMenu={showMenu} 
          setShowMenu={setShowMenu} 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          activeEntry={activeEntry} 
        />

        {showMenu && currentTab === 'manage' && (
          <FileManager.Menu 
            currentTab={currentTab} 
            setCurrentTab={setCurrentTab}
            setShowMenu={setShowMenu}
            activeEntry={activeEntry}
          />
        )}

        {currentTab === 'manage' && (
          <FileManager.Main 
            entries={entries} 
            loadEntries={loadEntries}
            setEntries={setEntries}
            setActiveEntry={setActiveEntry} 
            loadTranscript={async (entry) => {
              // 請用你現有的loadTranscript或youtube字幕fetch邏輯
              // Example placeholder: 
              alert("將你Excel或YouTube截取字幕後設定transcript")
              setTranscript([]) 
              setCurrentTab('play')
            }}
          />
        )}

        {currentTab === 'play' && activeEntry && (
          <>
            <div className="text-center mb-6">
              <button
                onClick={() => setCurrentTab('manage')}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                返回管理
              </button>
              <h2 className="font-bold text-lg mt-4">{activeEntry.display_name}</h2>
            </div>

            <YouTubePlayer 
              videoId={activeEntry.youtube_url} 
              playerRef={playerRef} 
              heightClass={videoHeightClass} 
            />

            <TranscriptList 
              transcript={transcript} 
              activeId={activeId} 
              playerRef={playerRef} 
              settings={settings} 
              transcriptRef={transcriptRef}
            />
          </>
        )}

        {showSettings && (
          <SettingsModal 
            settings={settings} 
            updateSettings={updateSettings} 
            toggleTheme={toggleTheme} 
            onClose={() => setShowSettings(false)} 
          />
        )}
      </div>
    </main>
  )
}
