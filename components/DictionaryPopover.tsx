// components/DictionaryPopover.tsx - 完整高對比度 + 發音功能版
"use client";
import { X, Search, Copy, Volume2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

interface DictionaryResult {
  keyword?: string;
  word?: string;
  definitions?: Array<{
    language: string;
    text: string;
    reading?: string;
    phonetic?: string;
    japanese?: string;
    partOfSpeech?: string;
  }>;
  examples?: string[];
  sources?: string[];
  error?: string;
  errors?: string[];
}

interface DictionaryPopoverProps {
  word: string;
  result: DictionaryResult | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
}

export function DictionaryPopover({
  word,
  result,
  isLoading,
  isOpen,
  onClose,
  isDarkTheme,
}: DictionaryPopoverProps) {
  // 🔥 發音狀態
  const [isPlaying, setIsPlaying] = useState(false);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // 🔥 初始化 TTS（SSR 安全）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const copyWord = async () => {
    try {
      await navigator.clipboard.writeText(word);
    } catch (err) {
      console.error("複製失敗:", err);
    }
  };

  // 🔥 播放發音
  const handlePlayPronunciation = useCallback(() => {
    if (!synthesisRef.current || !word) return;

    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(word);
    
    // 智能語言偵測
    if (result?.definitions?.some((def) => def.language === '日文')) {
      utterance.lang = 'ja-JP';
    } else if (result?.definitions?.some((def) => def.language === '英文')) {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'zh-TW';
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    synthesisRef.current.speak(utterance);
  }, [word, result]);

  // 🔥 安全檢查
  const hasSources = Array.isArray(result?.sources) && result.sources.length > 0;
  const hasDefinitions = Array.isArray(result?.definitions) && result.definitions.length > 0;
  const hasError = !!result?.error || 
                  (Array.isArray(result?.errors) && result.errors.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popover 內容 */}
      <div className={`
        relative w-full max-w-lg max-h-[85vh] overflow-y-auto
        ${isDarkTheme ? "bg-slate-800/95 text-slate-100" : "bg-white/95 text-slate-900"}
        backdrop-blur-2xl rounded-3xl shadow-2xl border 
        ${isDarkTheme ? "border-slate-600" : "border-gray-200"}
      `}>
        {/* Header */}
        <div className={`${isDarkTheme ? "bg-slate-700/50 border-slate-600" : "bg-gray-50/50 border-gray-200/50"} p-6 border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDarkTheme ? "bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent" : "bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent"}`}>
                  {word}
                </h3>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className={`${isDarkTheme ? "text-slate-300" : "text-slate-600"}`}>即時查詢</span>
                  {hasSources && (
                    <div className={`flex gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                      isDarkTheme ? "bg-blue-900/50 text-blue-200" : "bg-blue-100 text-blue-800"
                    }`}>
                      {result!.sources!.slice(0, 2).map((source, i) => (
                        <span key={i}>{source}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl transition-all hover:scale-110 ${
                isDarkTheme ? "hover:bg-slate-600 text-slate-200" : "hover:bg-gray-200 text-slate-700"
              }`}
              aria-label="關閉"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 內容區 */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className={`text-lg font-medium ${isDarkTheme ? "text-slate-200" : "text-slate-800"}`}>查詢中...</p>
              <p className={`text-sm mt-1 ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}>正在搜尋多國字典...</p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                isDarkTheme ? "bg-red-900/20 text-red-400" : "bg-red-100 text-red-500"
              }`}>
                <Search className="w-6 h-6" />
              </div>
              <p className={`text-lg font-medium ${isDarkTheme ? "text-red-400" : "text-red-600"}`}>
                {result?.error || result?.errors?.[0] || "查詢失敗"}
              </p>
              <p className={`text-sm mt-2 ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}>請檢查網路連線後重試</p>
            </div>
          ) : hasDefinitions ? (
            <div className="space-y-4">
              {result!.definitions!.map((def, index) => (
                <div key={index} className={`group pl-4 py-4 rounded-r-xl transition-all border-l-4 ${
                  isDarkTheme ? "border-blue-500 hover:bg-slate-700/50" : "border-blue-500 hover:bg-blue-50"
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isDarkTheme ? "bg-blue-900/50 text-blue-200" : "bg-blue-100 text-blue-800"
                    }`}>
                      {def.language}
                    </span>
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      {def.partOfSpeech && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          isDarkTheme ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-slate-700"
                        }`}>
                          {def.partOfSpeech}
                        </span>
                      )}
                      {def.japanese && <span className="font-bold text-lg">{def.japanese}</span>}
                      {def.reading && (
                        <span className={`italic font-light ${isDarkTheme ? "text-slate-300" : "text-slate-600"}`}>
                          ({def.reading})
                        </span>
                      )}
                      {def.phonetic && (
                        <span className={`font-mono text-xs ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}>
                          /{def.phonetic}/
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-lg leading-relaxed mb-4 font-medium ${isDarkTheme ? "text-slate-100" : "text-slate-800"}`}>
                    {def.text}
                  </p>
                  {Array.isArray(result.examples) && result.examples[index] && (
                    <div className={`p-3 rounded-xl border-l-2 ${
                      isDarkTheme ? "bg-slate-700/50 border-yellow-500/50 text-slate-200" : "bg-gray-50 border-yellow-300 text-slate-700"
                    }`}>
                      <span className="inline-block w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 mr-2">💡</span>
                      {result.examples[index]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                isDarkTheme ? "bg-slate-700 text-slate-500" : "bg-gray-100 text-gray-400"
              }`}>
                <Search className="w-6 h-6" />
              </div>
              <p className={`text-lg font-medium ${isDarkTheme ? "text-slate-200" : "text-slate-800"}`}>查無此單字</p>
              <p className={`text-sm mt-1 ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}>請試試其他拼寫或片語</p>
            </div>
          )}
        </div>

        {/* 底部工具列 */}
        <div className={`${isDarkTheme ? "bg-slate-700/50 border-slate-600" : "bg-gray-50/50 border-gray-200/50"} p-4 pt-0 border-t flex gap-2`}>
          <button 
            onClick={copyWord}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 shadow-lg transition-all hover:scale-[1.02]"
          >
            <Copy className="w-4 h-4" />
            複製單字
          </button>
          <button 
            onClick={handlePlayPronunciation}
            disabled={!word || isPlaying}
            className={`p-3 rounded-xl transition-all flex items-center justify-center relative overflow-hidden ${
              isPlaying 
                ? "bg-gradient-to-r from-orange-400 to-red-500 shadow-lg scale-105" 
                : isDarkTheme 
                  ? "bg-slate-700 hover:bg-slate-600 text-slate-200" 
                  : "bg-gray-200 hover:bg-gray-300 text-slate-700"
            } ${!word && "opacity-50 cursor-not-allowed"}`}
            aria-label="播放發音"
            title={isPlaying ? "播放中..." : "播放發音"}
          >
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-500/20 animate-pulse" />
            )}
            <Volume2 className={`w-5 h-5 relative z-10 ${isPlaying ? "text-white drop-shadow-lg" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
