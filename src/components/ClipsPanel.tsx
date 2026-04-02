import { Dispatch } from 'react'
import { Clip } from '@/types'
import { Action } from '@/state/reducer'
import { ClipCard } from './ClipCard'

interface Props {
  clips: Clip[]
  activeClipId: string | null
  playingClipId: string | null
  dispatch: Dispatch<Action>
  onPlayClip: (id: string) => void
}

export function ClipsPanel({ clips, activeClipId, playingClipId, dispatch, onPlayClip }: Props) {
  if (clips.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white/30 text-sm">Drag on the waveform to create a clip</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {clips.map((clip, i) => (
        <ClipCard
          key={clip.id}
          clip={clip}
          index={i}
          isActive={activeClipId === clip.id}
          isPlaying={playingClipId === clip.id}
          dispatch={dispatch}
          onPlay={() => onPlayClip(clip.id)}
        />
      ))}
    </div>
  )
}
