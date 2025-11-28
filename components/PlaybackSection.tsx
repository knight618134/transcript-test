"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import YouTube from "react-youtube";
import { Clock, FileText } from "lucide-react";

export type TranscriptLine = {
  id: number;
  subtitle: string;
  translation: string;
  romaji: string;
  start: number;
  duration: number;
};

type PlaybackSectionProps = {
  videoId: string;
  transcript: TranscriptLine[];
  subtitleSize: "small" | "medium" | "large";
  isDarkTheme: boolean;
  onSeekTo: (time: number) => void;
  showSubtitle: boolean;
  showRomaji: boolean;
  showTranslation: boolean;
  videoHeight: "small" | "medium" | "large";
  onWordSelect?: (word: string) => void;
};

const getSubtitleSizeClass = (
  subtitleSize: "small" | "medium" | "large"
): string => {
  return subtitleSize === "small"
    ? "text-sm sm:text-base md:text-lg"
    : subtitleSize === "medium"
    ? "text-base sm:text-lg md:text-xl"
    : "text-lg sm:text-xl md:text-2xl leading-tight";
};

const getVideoHeightClass = (height: "small" | "medium" | "large") => {
  return height === "small"
    ? "h-1/3"
    : height === "medium"
    ? "h-1/2"
    : "h-2/3";
};

export function PlaybackSection({
  videoId,
  transcript,
  subtitleSize,
  isDarkTheme,
  onSeekTo,
  showSubtitle,
  showRomaji,
  showTranslation,
  videoHeight,
  onWordSelect,
}: PlaybackSectionProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showTimeOverlay, setShowTimeOverlay] = useState(false);
  const [permanentTimeDisplay, setPermanentTimeDisplay] = useState(false);

  const playerRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timeOverlayTimeoutRef = useRef<NodeJS.Timeout>();

  const subtitleSizeClass = getSubtitleSizeClass(subtitleSize);

  const scrollToLine = useCallback((lineId: number) => {
    requestAnimationFrame(() => {
      if (transcriptRef.current) {
        const el = transcriptRef.current.querySelector(
          `[data-id="${lineId}"]`
        ) as HTMLElement;
        el?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    });
  }, []);

  const handleSeekTo = useCallback(
    (time: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time, true);
      }
      onSeekTo?.(time);
    },
    [onSeekTo]
  );

  const handleMouseEnter = () => {
    setShowTimeOverlay(true);
    if (timeOverlayTimeoutRef.current)
      clearTimeout(timeOverlayTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    if (!permanentTimeDisplay) {
      timeOverlayTimeoutRef.current = setTimeout(() => {
        setShowTimeOverlay(false);
      }, 2500);
    }
  };

  const handleTouchStart = () => {
    setShowTimeOverlay(true);
    if (timeOverlayTimeoutRef.current)
      clearTimeout(timeOverlayTimeoutRef.current);
  };

  const handleDoubleClick = () => {
    setPermanentTimeDisplay((prev) => !prev);
    setShowTimeOverlay(true);
  };

  // 🔥 手機旋轉重新計算高度
  useEffect(() => {
    const handleResize = () => {
      if (playerRef.current?.getIframe) {
        const iframe = playerRef.current.getIframe();
        iframe.style.height = "100%";
        iframe.style.width = "100%";
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastTime = 0;

    const updateTime = () => {
      if (playerRef.current?.getCurrentTime) {
        const now = playerRef.current.getCurrentTime();
        if (Math.abs(now - lastTime) > 0.1) {
          setCurrentTime(Math.floor(now * 10) / 10);
          lastTime = now;
        }
      }
      rafId = requestAnimationFrame(updateTime);
    };

    updateTime();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (currentTime === 0 || transcript.length === 0) return;

    let activeLine: TranscriptLine | null =
      transcript.find(
        (line) =>
          currentTime >= line.start - 0.3 &&
          currentTime < line.start + line.duration
      ) || null;

    if (!activeLine) {
      activeLine = transcript.reduce((closest, line) => {
        const dist = Math.abs(currentTime - line.start);
        return dist <
          (closest ? Math.abs(currentTime - closest.start) : Infinity)
          ? line
          : closest;
      }, null as TranscriptLine | null);
    }

    if (!activeLine) {
      activeLine =
        transcript.find(
          (line) => line.start > currentTime && line.start - currentTime < 2
        ) || null;
    }

    if (activeLine && activeLine.id !== activeId) {
      setActiveId(activeLine.id);
      scrollToLine(activeLine.id);
    }
  }, [currentTime, transcript, activeId, scrollToLine]);

  useEffect(() => {
    return () => {
      if (timeOverlayTimeoutRef.current) {
        clearTimeout(timeOverlayTimeoutRef.current);
      }
    };
  }, []);

  return (
    // 手機直立上下排版，md 以上左右排版（保留原本行為）
    <div className="flex flex-col md:flex-row h-[80vh] md:h-[85vh] gap-4">
      {/* 🔥 修正版影片區：aspect-video + md:aspect-auto */}
      <div
        className={`
          relative flex-shrink-0
          ${getVideoHeightClass(videoHeight)}
          md:h-full md:w-1/2
          aspect-video md:aspect-auto
          rounded-3xl overflow-hidden shadow-2xl
          border border-gray-300 dark:border-slate-700
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
      >
        {/* 直接填滿容器 */}
        <YouTube
          videoId={videoId}
          ref={playerRef}
          onReady={(e) => {
            playerRef.current = e.target;
          }}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              modestbranding: 1,
              rel: 0,
              controls: 1,
              showinfo: 0,
              enablejsapi: 1,
            },
          }}
          className="absolute inset-0 w-full h-full"
        />

        {/* 時間顯示 */}
        <div
          className={`
            absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-mono
            backdrop-blur-md cursor-pointer select-none transition-all duration-300 ease-in-out
            shadow-lg group
            ${
              showTimeOverlay || permanentTimeDisplay
                ? "bg-black/85 text-white scale-105 ring-2 ring-white/40 shadow-2xl"
                : "bg-black/20 text-white/60 hover:bg-black/50 hover:text-white hover:shadow-md hover:scale-100"
            }
          `}
          style={{
            opacity: showTimeOverlay || permanentTimeDisplay ? 1 : 0.5,
          }}
          title={permanentTimeDisplay ? "雙擊隱藏時間顯示" : "雙擊永久顯示時間"}
        >
          <Clock
            size={14}
            className="inline mr-1.5 group-hover:scale-110 transition-transform duration-200"
          />
          <span className="tracking-wider font-medium">
            {Math.floor(currentTime / 60)
              .toString()
              .padStart(2, "0")}
            :
            {Math.floor(currentTime % 60)
              .toString()
              .padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* 字幕區：套用 Notion 風格＋左側淡色條 */}
      <div
        ref={transcriptRef}
        className={`
          flex-grow overflow-y-auto p-6
          border border-gray-300 dark:border-slate-700
          rounded-3xl bg-white/90 dark:bg-slate-800/90
          backdrop-blur-xl shadow-inner
          md:w-1/2
          ${isDarkTheme ? "dark:text-slate-100" : "dark:text-slate-900"}
        `}
      >
        {transcript.map((line) => (
          <div
            key={line.id}
            data-id={line.id}
            onClick={() => {
              handleSeekTo(line.start);
              onWordSelect?.(line.subtitle);
            }}
            className={[
              "group relative p-5 pl-4 rounded-2xl mb-3 cursor-pointer",
              "transition-all duration-200 hover:shadow-md border flex",
              // Notion 風：active 行淡灰底＋微縮放
              activeId === line.id
                ? "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-500 scale-[1.01]"
                : "bg-white/60 dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-600",
            ].join(" ")}
          >
            {/* 左側淡淡色條（提示目前行） */}
            <div
              className={[
                "w-1 rounded-full mr-4 self-stretch",
                "transition-all duration-200",
                activeId === line.id
                  ? "bg-sky-300/80 dark:bg-sky-400/80"
                  : "bg-slate-200 dark:bg-slate-600 group-hover:bg-sky-200 dark:group-hover:bg-sky-400/70",
              ].join(" ")}
            />

            <div className="flex-1">
              {/* 時間戳 ＋ romaji */}
              <div className="flex justify-between items-center mb-2 text-xs opacity-80">
                <span className="font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  {Math.floor(line.start / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(line.start % 60).toString().padStart(2, "0")}
                </span>
                {showRomaji && line.romaji && (
                  <span className="italic text-xs font-light tracking-wide">
                    {line.romaji}
                  </span>
                )}
              </div>

              {/* 日文字幕 */}
              {showSubtitle && (
                <p className={`font-bold mb-2 ${subtitleSizeClass}`}>
                  {line.subtitle}
                </p>
              )}

              {/* 翻譯 */}
              {showTranslation && line.translation && (
                <p className="text-sm opacity-90 leading-relaxed">
                  💬 {line.translation}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* 空狀態 */}
        {transcript.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText size={48} className="mb-4 opacity-50" />
            <p className="text-lg">載入字幕中...]</p>
          </div>
        )}
      </div>
    </div>
  );
}
