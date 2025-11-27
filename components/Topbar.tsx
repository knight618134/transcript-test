'use client'
import { Menu, Settings, FileText, Play } from 'lucide-react'

export default function Topbar({ settings, setShowSettings, showMenu, setShowMenu, currentTab, setCurrentTab, activeEntry }) {
  return (
    <div className="flex justify-between items-center mb-8 lg:mb-12">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="lg:hidden p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>
      
      <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r ${
        settings.theme === 'dark' 
          ? 'from-blue-400 to-purple-400' 
          : 'from-blue-600 to-purple-600'
      } bg-clip-text text-transparent text-center flex-1 drop-shadow-lg`}>
        🎯 Excel + YouTube 字幕學習器
      </h1>

      <button
        onClick={() => setShowSettings(true)}
        className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all lg:hidden"
        aria-label="Settings"
      >
        <Settings size={24} />
      </button>
    </div>
  )
}
