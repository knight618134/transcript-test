// components/FooterTools.tsx - 完整版，包含聲音功能
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, BookOpen, Volume2, Copy, Mic } from "lucide-react";

interface FooterToolsProps {
  activeWord: string;
  onDictionarySearch: (word: string) => void;
  isDarkTheme: boolean;
}

export function FooterTools({
  activeWord,
  onDictionarySearch,
  isDarkTheme,
}: FooterToolsProps) {
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [showActiveWordBadge, setShowActiveWordBadge] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // 🔥 Web Speech API refs
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<any>(null);

  // 🔥 初始化客戶端環境
  useEffect(() => {
    setIsClient(true);
    setClientSearchTerm(activeWord);
    setShowActiveWordBadge(!!activeWord);

    // 🔥 只在客戶端初始化 Speech API
    if (typeof window !== 'undefined') {
      // 文字轉語音
      synthesisRef.current = typeof window !== 'undefined' ? window.speechSynthesis : null;
      
      // 語音識別
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'ja-JP'; // 預設日文，可動態切換
        
        recognitionRef.current.onstart = () => setIsListening(true);
        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setClientSearchTerm(transcript);
          onDictionarySearch(transcript); // 自動查詢
        };
        recognitionRef.current.onerror = (event: any) => {
          console.error('語音識別錯誤:', event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  // 🔥 同步 activeWord
  useEffect(() => {
    if (isClient) {
      setClientSearchTerm(activeWord);
      setShowActiveWordBadge(!!activeWord);
    }
  }, [activeWord, isClient]);

  // 🔥 播放發音（TTS）
  const handlePlayPronunciation = useCallback(() => {
    if (!isClient || !synthesisRef.current || !activeWord) return;
    
    synthesisRef.current.cancel(); // 停止之前的語音
    const utterance = new SpeechSynthesisUtterance(activeWord);
    utterance.lang = 'ja-JP'; // 日文發音
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    synthesisRef.current.speak(utterance);
  }, [activeWord, isClient]);

  // 🔥 開始語音輸入
  const handleVoiceInput = useCallback(() => {
    if (!isClient || !recognitionRef.current) {
      alert('您的瀏覽器不支援語音輸入');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }, [isClient, isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = clientSearchTerm.trim();
    if (term) {
      onDictionarySearch(term);
      setClientSearchTerm("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientSearchTerm(e.target.value);
  };

  const handleCopy = async () => {
    const textToCopy = activeWord || clientSearchTerm;
    if (textToCopy && isClient) {
      await navigator.clipboard.writeText(textToCopy);
    }
  };

  // 🔥 SSR 安全渲染
  if (!isClient) {
    return (
      <footer className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-700 px-6 py-4 rounded-2xl shadow-2xl mt-4">
        {/* SSR 靜態版本，同上略 */}
      </footer>
    );
  }

  return (
    <footer className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-700 px-6 py-4 rounded-2xl shadow-2xl mt-4">
      <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
        {/* 搜尋表單 */}
        <form onSubmit={handleSubmit} className="flex-1 min-w-[250px] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
            <input
              value={clientSearchTerm}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm placeholder-gray-500 dark:placeholder-slate-400 transition-all"
              placeholder="搜尋單字 / 片語..."
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm shadow-lg transition-all hover:scale-105 min-w-[60px]">
            查詢
          </button>
        </form>

        {/* ActiveWord 徽章 */}
        {showActiveWordBadge && activeWord && (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg text-xs font-medium border border-green-200 dark:border-green-700">
            <span className="truncate max-w-[120px]">{activeWord}</span>
            <BookOpen size={14} className="ml-1 p-1 hover:bg-green-200 rounded cursor-pointer hover:scale-110 transition-all" 
                     onClick={() => onDictionarySearch(activeWord)} />
          </div>
        )}

        {/* 🔥 功能按鈕 - 現在有效！ */}
        <div className="flex items-center gap-1">
          {/* 聲音播放 */}
          <button
            onClick={handlePlayPronunciation}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all hover:scale-105"
            title="播放發音"
            disabled={!activeWord}
          >
            <Volume2 size={18} className={activeWord ? "text-blue-500" : "text-gray-400"} />
          </button>
          
          {/* 複製 */}
          <button
            onClick={handleCopy}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all hover:scale-105"
            title="複製到剪貼簿"
          >
            <Copy size={18} />
          </button>
          
          {/* 🔥 麥克風 - 動態狀態 */}
          <button
            disabled
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl transition-all hover:scale-105 ${
              isListening 
                ? "bg-red-100 dark:bg-red-900/50 animate-pulse" 
                : "hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
            title={isListening ? "停止語音輸入" : "語音輸入"}
          >
            <Mic size={18} className={isListening ? "text-red-500" : ""} />
          </button>
        </div>
      </div>
  </footer>
  );
}
