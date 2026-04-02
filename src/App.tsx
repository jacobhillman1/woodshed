import { useAppState } from './state/AppContext'
import { useFileUpload } from './hooks/useFileUpload'
import { useAudioLoader } from './hooks/useAudioLoader'
import { EmptyState } from './components/EmptyState'
import { TopBar } from './components/TopBar'
import { Waveform } from './components/Waveform'
import { ClipsPanel } from './components/ClipsPanel'

export default function App() {
  const { state, dispatch } = useAppState()
  const loadAudio = useAudioLoader(dispatch)
  const { isDragging, handleFile } = useFileUpload(loadAudio)

  if (!state.song) {
    return (
      <div className="h-screen bg-zinc-950 text-white flex flex-col">
        <EmptyState isDragging={isDragging} onFile={handleFile} />
      </div>
    )
  }

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col">
      <TopBar songName={state.song.name} onFile={handleFile} />
      <ClipsPanel
        clips={state.clips}
        activeClipId={state.playback.activeClipId}
        playingClipId={state.playback.status === 'playing' ? state.playback.activeClipId : null}
        dispatch={dispatch}
        onPlayClip={(id) => dispatch({ type: 'PLAY_CLIP', payload: id })}
      />
      <Waveform song={state.song} clips={state.clips} dispatch={dispatch} />
    </div>
  )
}
