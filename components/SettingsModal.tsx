'use client'
import { Sun, Moon, Type, Maximize2, Minimize2, X } from 'lucide-react'
import Settings from "@/components/Settings"
export default function SettingsModal({ settings, updateSettings, toggleTheme, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl border p-6 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Settings size={28} />
            學習設定
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* 主題切換 */}
        <label className="flex items-center justify-between mb-6 p-3 rounded-xl bg-gray-100 dark:bg-gray-700 cursor-pointer">
          <span className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
            {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />} 深色模式
          </span>
          <input 
            type="checkbox" 
            checked={settings.theme === 'dark'} 
            onChange={toggleTheme} 
            className="w-5 h-5 rounded border-gray-300 focus:ring-blue-500"
          />
        </label>

        {/* 字體大小 */}
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-lg text-gray-800 dark:text-gray-200">
            <Type size={18} /> 字體大小
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => updateSettings({ fontSize: size })}
                className={`rounded-xl p-3 transition-all border-2 font-${size} ${
                  settings.fontSize === size
                    ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
              </button>
            ))}
          </div>
        </div>

        {/* 字幕大小 */}
        <div className="mb-6">
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-lg text-gray-800 dark:text-gray-200">
            <Type size={18} /> 字幕大小
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => updateSettings({ subtitleSize: size })}
                className={`rounded-xl p-3 transition-all border-2 font-${size} ${
                  settings.subtitleSize === size
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
              </button>
            ))}
          </div>
        </div>

        {/* 影片高度 */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-lg text-gray-800 dark:text-gray-200">
            <Maximize2 size={18} />
            影片高度
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => updateSettings({ videoHeight: size })}
                className={`rounded-xl p-3 transition-all border-2 flex items-center justify-center ${
                  settings.videoHeight === size
                    ? 'bg-purple-600 text-white border-purple-700 shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                {size === 'small' ? <Minimize2 size={18} /> : size === 'medium' ? '中' : <Maximize2 size={18} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
