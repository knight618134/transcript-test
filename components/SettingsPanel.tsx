'use client'
import { X, Eye, Type, Palette, Sun, Moon, Settings } from 'lucide-react'
import { THEME_Settings } from '@/context/ThemeContext'  // ✅ 匯入你的 Settings 介面

type SettingsPanelProps = {
  settings: THEME_Settings  // ✅ 使用你的 Settings 型別
  updateSettings: (newSettings: Partial<THEME_Settings>) => void  // ✅ Partial<Settings>
  toggleTheme: () => void
  isDarkTheme: boolean
  onClose: () => void
}

// ✅ 你的預設設定
const DEFAULT_SETTINGS: THEME_Settings = {
  theme: 'dark',
  fontSize: 'medium',
  subtitleSize: 'medium',
  showRomaji: true,
  videoHeight: 'medium',
  showSubtitle: true,
  showTranslation: true,
  titleColor: 'auto'
}

export function SettingsPanel({ 
  settings, 
  updateSettings, 
  toggleTheme, 
  isDarkTheme, 
  onClose 
}: SettingsPanelProps) {
  
  const updateSetting = (key: keyof THEME_Settings, value: any) => {
    updateSettings({ [key]: value } as Partial<THEME_Settings>)
  }

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center p-4 ${
      isDarkTheme ? 'bg-black/70 backdrop-blur-md' : 'bg-white/90 backdrop-blur-md'
    }`}>
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 ${
        isDarkTheme 
          ? 'bg-slate-900/95 border border-slate-700/50 text-slate-100' 
          : 'bg-white/95 border border-gray-200/50 text-slate-900'
      }`}>
        
        {/* 標題 */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Settings size={32} />
            播放設定
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700">
            <X size={24} />
          </button>
        </div>

        {/* 顯示控制 */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
            <Eye size={24} /> 顯示內容
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showSubtitle}
                onChange={(e) => updateSetting('showSubtitle', e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="font-medium">原始字幕</span>
            </label>
            
            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showRomaji}
                onChange={(e) => updateSetting('showRomaji', e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded"
              />
              <span className="font-medium">羅馬字</span>
            </label>
            
            <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showTranslation}
                onChange={(e) => updateSetting('showTranslation', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <span className="font-medium">機器翻譯</span>
            </label>
          </div>
        </div>

        {/* 字體大小 */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
            <Type size={24} /> 字體大小
          </h3>
          
          {/* 一般字體 */}
          <div className="space-y-2">
            <span className="text-sm opacity-75 block mb-2">一般文字</span>
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={`font-${size}`}
                onClick={() => updateSetting('fontSize', size)}
                className={`p-3 rounded-xl w-full flex items-center gap-3 transition-all ${
                  settings.fontSize === size
                    ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-300'
                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                <div className={`${size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'} font-bold`}>
                  測試文字
                </div>
                <span className="text-xs opacity-75 capitalize">{size}</span>
              </button>
            ))}
          </div>

          {/* 字幕字體 */}
          <div className="space-y-2">
            <span className="text-sm opacity-75 block mb-2">字幕專用</span>
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={`subtitle-${size}`}
                onClick={() => updateSetting('subtitleSize', size)}
                className={`p-3 rounded-xl w-full flex items-center gap-3 transition-all ${
                  settings.subtitleSize === size
                    ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-300'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
                }`}
              >
                <div className={`${size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'} font-bold`}>
                  字幕測試]
                </div>
                <span className="text-xs opacity-75 capitalize">{size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 視頻高度 */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
            📺 影片高度
          </h3>
          {(['small', 'medium', 'large'] as const).map(size => (
            <button
              key={size}
              onClick={() => updateSetting('videoHeight', size)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                settings.videoHeight === size
                  ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-300'
                  : 'hover:bg-purple-50 dark:hover:bg-purple-900/30'
              }`}
            >
              <div className={`w-16 h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg flex-shrink-0 ${size}`} />
              <span className="font-medium capitalize">{size}</span>
            </button>
          ))}
        </div>

        {/* 主題切換 */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
            <Palette size={24} /> 外觀
          </h3>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-medium transition-all shadow-md ${
              isDarkTheme
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800'
            }`}
          >
            {isDarkTheme ? <Sun size={24} /> : <Moon size={24} />}
            {isDarkTheme ? '切換淺色模式' : '切換黑暗模式'}
          </button>
        </div>

        {/* 重置按鈕 */}
        <div className="pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
          <button
            onClick={() => updateSettings(DEFAULT_SETTINGS)}  // ✅ 完美契合你的 API
            className="w-full p-3 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
          >
            重置所有設定
          </button>
        </div>
      </div>
    </div>
  )
}
