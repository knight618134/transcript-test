'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'
type FontSize = 'small' | 'medium' | 'large'

interface Settings {
  theme: Theme
  fontSize: FontSize
  subtitleSize: FontSize
  showRomaji: boolean
  videoHeight: 'small' | 'medium' | 'large'
}

interface ThemeContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    fontSize: 'medium',
    subtitleSize: 'medium',
    showRomaji: true,
    videoHeight: 'medium'
  })

  // 載入本地儲存設定
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subtitle-player-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings(prev => ({ ...prev, ...parsed }))
        document.documentElement.classList.toggle('dark', parsed.theme === 'dark')
      }
    }
  }, [])

  // 儲存到本地儲存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('subtitle-player-settings', JSON.stringify(settings))
      document.documentElement.classList.toggle('dark', settings.theme === 'dark')
    }
  }, [settings])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
  }

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
