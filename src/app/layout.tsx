// app/layout.tsx 或相對應的根組件
import { ThemeProvider } from '@/context/ThemeContext'
import './globals.css'  // 如果有的話

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
