'use client'
import YouTube from 'react-youtube'

export default function YouTubePlayer({ videoId, playerRef, heightClass }) {
  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden shadow-2xl bg-black border-4 border-gray-200/30 dark:border-gray-800/50`}>
      <YouTube
        videoId={videoId}
        ref={playerRef}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            modestbranding: 1,
            rel: 0,
            controls: 1,
            showinfo: 0
          },
        }}
        className="!w-full !h-full"
      />
    </div>
  )
}
