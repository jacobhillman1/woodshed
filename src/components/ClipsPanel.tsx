import { Dispatch } from 'react'
import { Clip } from '@/types'
import { Action } from '@/state/reducer'
import { ClipCard } from './ClipCard'

interface Props {
  clips: Clip[]
  activeClipId: string | null
  playingClipId: string | null
  duration: number
  audioBuffer: AudioBuffer
  currentTime: number
  dispatch: Dispatch<Action>
  onPlayClip: (id: string) => void
  onSelectClip: (id: string) => void
  onDeselectClip: () => void
}

export function ClipsPanel({ clips, activeClipId, playingClipId, duration, audioBuffer, currentTime, dispatch, onPlayClip, onSelectClip, onDeselectClip }: Props) {
  if (clips.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/30 text-sm">Drag on the waveform to create a clip</p>
      </div>
    )
  }

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 min-w-0"
      onClick={(e) => { if (e.target === e.currentTarget) onDeselectClip() }}
    >
      {clips.map((clip, i) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          index={i}
          isActive={activeClipId === clip.id}
          isPlaying={playingClipId === clip.id}
          duration={duration}
          audioBuffer={audioBuffer}
          currentTime={currentTime}
          dispatch={dispatch}
          onPlay={() => onPlayClip(clip.id)}
          onSelect={() => onSelectClip(clip.id)}
        />
      ))}
    </div>
  )
}
