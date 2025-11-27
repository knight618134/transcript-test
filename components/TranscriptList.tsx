'use client'

export default function TranscriptList({ transcript, activeId, playerRef, settings, transcriptRef }) {
  // 字體大小與顏色依settings調整也可以放這

  return (
    <div 
      ref={transcriptRef}
      className={`max-h-[55vh] overflow-y-auto rounded-2xl p-4 sm:p-6 shadow-2xl border-2 space-y-4 ${
        settings.theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      {transcript.map(line => (
        <div
          key={line.id}
          data-id={line.id}
          className={`p-4 rounded-lg cursor-pointer border-2 transition ${
            activeId === line.id 
              ? 'border-emerald-400 bg-gradient-to-r from-emerald-200/10 to-teal-300/20 ring-4 ring-emerald-300/50 scale-[1.02]'
              : 'border-transparent hover:border-blue-300'
          }`}
          onClick={() => playerRef.current?.seekTo(line.start, true)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-none w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {Math.floor(line.start / 60).toString().padStart(2, '0')}:
              {(line.start % 60).toString().padStart(2, '0')}
            </div>
            <div className={`flex-1 space-y-2`}>
              <div className={`font-bold text-lg leading-relaxed text-gray-900 dark:text-gray-100`}>
                {line.subtitle}
              </div>
              {settings.showRomaji && line.romaji && (
                <div className="text-xs italic text-gray-600 dark:text-gray-400">
                  {line.romaji}
                </div>
              )}
              {line.translation && (
                <div className="border-l-4 pl-4 text-gray-700 dark:text-gray-300">
                  💬 {line.translation}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
