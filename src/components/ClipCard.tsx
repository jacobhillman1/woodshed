import { Dispatch } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, RotateCw, Trash2 } from 'lucide-react'
import { Clip } from '@/types'
import { Action } from '@/state/reducer'
import { ClipWaveform } from './ClipWaveform'

interface Props {
  clip: Clip
  index: number
  isActive: boolean
  isPlaying: boolean
  duration: number
  audioBuffer: AudioBuffer
  currentTime: number
  dispatch: Dispatch<Action>
  onPlay: () => void
  onSelect: () => void
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toFixed(2).padStart(5, '0')}`
}

export function ClipCard({ clip, index, isActive, isPlaying, duration, audioBuffer, currentTime, dispatch, onPlay, onSelect }: Props) {
  const update = (changes: Partial<Clip>) =>
    dispatch({ type: 'UPDATE_CLIP', payload: { id: clip.id, changes } })

  return (
    <div
      className={`bg-white/5 rounded-lg p-3 flex flex-col gap-2 transition-all cursor-pointer
        ${isActive ? 'ring-2 ring-orange-500 shadow-lg shadow-orange-500/20' : 'hover:bg-white/[0.07]'}`}
      onClick={(e) => {
        // Only select when clicking the card background, not interactive controls
        if (!(e.target as HTMLElement).closest('button, input')) onSelect()
      }}
    >
      {/* Controls row */}
      <div className="flex items-center gap-3">
        <span className="text-white/30 text-sm w-5 flex-shrink-0 text-center">{index + 1}</span>

        <input
          type="text"
          value={clip.name}
          onChange={(e) => update({ name: e.target.value })}
          className="bg-transparent text-white text-sm outline-none w-24 flex-shrink-0 min-w-0 border-b border-transparent focus:border-white/30 transition-colors"
        />

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => update({ startTime: Math.max(0, +(clip.startTime - 0.05).toFixed(2)) })}
            className="text-white/30 hover:text-white/70 p-0.5">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="font-mono text-sm text-white bg-white/5 rounded px-2 py-0.5 w-[4.5rem] text-center">
            {fmt(clip.startTime)}
          </span>
          <button onClick={() => update({ startTime: Math.min(+(clip.startTime + 0.05).toFixed(2), clip.endTime - 0.05) })}
            className="text-white/30 hover:text-white/70 p-0.5">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <span className="text-white/20 flex-shrink-0">—</span>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => update({ endTime: Math.max(clip.startTime + 0.05, +(clip.endTime - 0.05).toFixed(2)) })}
            className="text-white/30 hover:text-white/70 p-0.5">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <span className="font-mono text-sm text-white bg-white/5 rounded px-2 py-0.5 w-[4.5rem] text-center">
            {fmt(clip.endTime)}
          </span>
          <button onClick={() => update({ endTime: Math.min(duration, +(clip.endTime + 0.05).toFixed(2)) })}
            className="text-white/30 hover:text-white/70 p-0.5">
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <button onClick={onPlay}
            className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors">
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button onClick={() => update({ isLooping: !clip.isLooping })}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors
              ${clip.isLooping ? 'bg-orange-500' : 'bg-white/10 hover:bg-white/15'}`}>
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 bg-white/5 rounded-md px-1.5 py-0.5">
            <button onClick={() => update({ speed: Math.max(0.25, +(clip.speed - 0.05).toFixed(2)) })}
              disabled={clip.speed <= 0.25}
              className="text-white/30 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-sm text-white w-10 text-center">{clip.speed.toFixed(2)}x</span>
            <button onClick={() => update({ speed: Math.min(1.0, +(clip.speed + 0.05).toFixed(2)) })}
              disabled={clip.speed >= 1.0}
              className="text-white/30 hover:text-white/70 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <button onClick={() => dispatch({ type: 'DELETE_CLIP', payload: clip.id })}
            className="w-7 h-7 rounded-md bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 flex items-center justify-center transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mini waveform */}
      <ClipWaveform
        audioBuffer={audioBuffer}
        startTime={clip.startTime}
        endTime={clip.endTime}
        currentTime={currentTime}
        isPlaying={isPlaying}
      />
    </div>
  )
}
