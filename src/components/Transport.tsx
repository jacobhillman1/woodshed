import { Play, Pause } from 'lucide-react'

interface Props {
  isPlaying: boolean
  currentTime: number
  duration: number
  label: string
  onPlayPause: () => void
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60)
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}

export function Transport({ isPlaying, currentTime, duration, label, onPlayPause }: Props) {
  return (
    <div className="h-14 bg-black/30 border-t border-white/10 flex items-center gap-4 px-6 flex-shrink-0">
      <button
        onClick={onPlayPause}
        className="w-9 h-9 rounded-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors flex-shrink-0"
      >
        {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
      </button>

      <span className="font-mono text-sm text-white/60">
        {fmt(currentTime)} / {fmt(duration)}
      </span>

      <span className="text-sm text-white/40 truncate">{label}</span>
    </div>
  )
}
