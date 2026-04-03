import { Dispatch, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, RotateCw, Trash2 } from 'lucide-react'

const SPEEDS = [0.25, 0.5, 0.75, 1.0]
const SPEED_LABELS = ['0.25x', '0.5x', '0.75x', '1x']
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

// Parse "m:ss", "m:ss.ff", or plain seconds. Returns null on invalid input.
const parseTime = (raw: string): number | null => {
  const colon = raw.match(/^(\d+):(\d+(?:\.\d+)?)$/)
  if (colon) return parseInt(colon[1]) * 60 + parseFloat(colon[2])
  const plain = raw.match(/^\d+(?:\.\d+)?$/)
  if (plain) return parseFloat(raw)
  return null
}

export function ClipCard({ clip, index, isActive, isPlaying, duration, audioBuffer, currentTime, dispatch, onPlay, onSelect }: Props) {
  const update = (changes: Partial<Clip>) =>
    dispatch({ type: 'UPDATE_CLIP', payload: { id: clip.id, changes } })

  const [editStart, setEditStart] = useState<string | null>(null)
  const [editEnd, setEditEnd] = useState<string | null>(null)

  const commitStart = (raw: string) => {
    const t = parseTime(raw)
    if (t !== null) update({ startTime: +Math.max(0, Math.min(t, clip.endTime - 0.05)).toFixed(2) })
    setEditStart(null)
  }
  const commitEnd = (raw: string) => {
    const t = parseTime(raw)
    if (t !== null) update({ endTime: +Math.min(duration, Math.max(t, clip.startTime + 0.05)).toFixed(2) })
    setEditEnd(null)
  }

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
          <input
            type="text"
            value={editStart ?? fmt(clip.startTime)}
            onFocus={(e) => { setEditStart(fmt(clip.startTime)); e.target.select() }}
            onChange={(e) => setEditStart(e.target.value)}
            onBlur={(e) => commitStart(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
              if (e.key === 'Escape') { setEditStart(null); e.currentTarget.blur() }
            }}
            className="font-mono text-sm text-white bg-white/5 rounded px-2 py-0.5 w-20 text-center outline-none focus:ring-1 focus:ring-orange-500/50 transition-shadow"
          />
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
          <input
            type="text"
            value={editEnd ?? fmt(clip.endTime)}
            onFocus={(e) => { setEditEnd(fmt(clip.endTime)); e.target.select() }}
            onChange={(e) => setEditEnd(e.target.value)}
            onBlur={(e) => commitEnd(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
              if (e.key === 'Escape') { setEditEnd(null); e.currentTarget.blur() }
            }}
            className="font-mono text-sm text-white bg-white/5 rounded px-2 py-0.5 w-20 text-center outline-none focus:ring-1 focus:ring-orange-500/50 transition-shadow"
          />
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

          <button onClick={() => dispatch({ type: 'DELETE_CLIP', payload: clip.id })}
            className="w-7 h-7 rounded-md bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 flex items-center justify-center transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Speed slider */}
      {(() => {
        const speedIndex = Math.max(0, Math.min(3, Math.round((clip.speed - 0.25) / 0.25)))
        return (
          <div className="flex flex-col gap-0.5 px-0.5">
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={speedIndex}
              onChange={(e) => update({ speed: SPEEDS[+e.target.value] })}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between">
              {SPEED_LABELS.map((label, i) => (
                <span key={label} className={`text-[10px] ${i === speedIndex ? 'text-orange-400' : 'text-white/30'}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Mini waveform with current-time overlay */}
      <div className="relative">
        <ClipWaveform
          audioBuffer={audioBuffer}
          startTime={clip.startTime}
          endTime={clip.endTime}
          currentTime={currentTime}
          isPlaying={isPlaying}
        />
        {isPlaying && (
          <span className="absolute bottom-0.5 right-1 text-[10px] font-mono text-orange-300/70 pointer-events-none">
            {fmt(currentTime)}
          </span>
        )}
      </div>
    </div>
  )
}
