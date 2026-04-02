import { useAppState } from './state/AppContext'
import { useFileUpload } from './hooks/useFileUpload'
import { useAudioLoader } from './hooks/useAudioLoader'
import { EmptyState } from './components/EmptyState'
import { TopBar } from './components/TopBar'
import { Waveform } from './components/Waveform'

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
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <p className="text-white/20 text-sm">Clips panel — Phase 4</p>
      </div>
      <Waveform song={state.song} clips={state.clips} dispatch={dispatch} />
    </div>
  )
}
