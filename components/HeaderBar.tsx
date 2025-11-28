import { ChevronLeft, Settings } from "lucide-react";

type HeaderBarProps = {
  onBack: () => void;
  title: string;
  onToggleSettings: () => void;
  isDarkTheme: boolean;
  titleColor?: string;
  showBackButton?: boolean;  // 🔥 新增：控制返回按鈕顯示
};

export function HeaderBar({
  onBack,
  title,
  onToggleSettings,
  isDarkTheme,
  titleColor = "",
  showBackButton = true,  // 🔥 預設顯示
}: HeaderBarProps) {
  return (
    <header
      className={`sticky top-0 z-50 flex items-center justify-between bg-white/95 ${
        isDarkTheme ? "dark:bg-slate-900/95" : ""
      } backdrop-blur-xl shadow border-b border-gray-200/50 dark:border-slate-700/50 rounded-b-3xl mb-0`}
    >
      {/* 🔥 條件顯示返回按鈕 */}
      {showBackButton ? (
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl px-3 py-1"
          aria-label="返回"
        >
          <ChevronLeft size={20} />
          返回
        </button>
      ) : (
        <div className="w-12" /> // 🔥 佔位避免布局跳動
      )}

      <h1
        className={`text-2xl font-bold truncate text-center flex-1 mx-4 ${
          titleColor || (isDarkTheme ? "text-slate-100" : "text-slate-900")
        }`}
      >
        {title}
      </h1>

      <button
        onClick={onToggleSettings}
        className="p-2 rounded-xl bg-blue-600 text-white shadow-lg hover:shadow-xl"
        aria-label="設定"
      >
        <Settings size={24} />
      </button>
    </header>
  );
}
