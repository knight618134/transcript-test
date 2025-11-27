'use client'
import { useTheme } from '@/context/ThemeContext'
import { Settings, Sun, Moon, Type, Maximize2, Minimize2 } from 'lucide-react'

export default function SettingsPanel() {
  const { settings, updateSettings, toggleTheme } = useTheme()

  const getVideoHeightClass = () => {
    const heights = { small: 'min-h-[30vh]', medium: 'min-h-[50vh]', large: 'min-h-[60vh]' }
    return heights[settings.videoHeight]
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 設定按鈕 */}
      <button className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-3xl shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center gap-1 p-3 group">
        <Settings size={20} />
        <span className="text-xs font-bold group-hover:scale-110">設定</span>
      </button>

      {/* 設定面板 */}
      <div className="bg-glass dark:bg-dark-glass backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 mt-4 p-6 w-80 max-h-96 overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
          🎛️ 學習設定
        </h3>

        {/* 主題切換 */}
        <div className="space-y-4 mb-6">
          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-2xl border cursor-pointer hover:shadow-md transition-all">
            <span className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              深色模式
            </span>
            <input
              type="checkbox"
              checked={settings.theme === 'dark'}
              onChange={toggleTheme}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
            />
          </label>
        </div>

        {/* 字體大小 */}
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Type size={18} />
            字體大小
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => updateSettings({ fontSize: size })}
                className={`p-3 rounded-xl font-${size} transition-all ${
                  settings.fontSize === size
                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}
              >
                {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
              </button>
            ))}
          </div>
        </div>

        {/* 字幕大小 */}
        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Type size={18} className="text-lg" />
            字幕大小
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => updateSettings({ subtitleSize: size })}
                className={`p-3 rounded-xl text-${size === 'large' ? 'lg' : size} transition-all ${
                  settings.subtitleSize === size
                    ? 'bg-emerald-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}
              >
                {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
              </button>
            ))}
          </div>
        </div>

        {/* 影片高度 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Maximize2 size={18} />
            影片高度
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => updateSettings({ videoHeight: size })}
                className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                  settings.videoHeight === size
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                }`}
              >
                {size === 'small' ? <Minimize2 size={16} /> : size === 'medium' ? '中' : <Maximize2 size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
