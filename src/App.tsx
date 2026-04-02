import { useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { useAppState } from './state/AppContext'
import { useFileUpload } from './hooks/useFileUpload'
import { useAudioLoader } from './hooks/useAudioLoader'
import { usePlayback } from './hooks/usePlayback'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { EmptyState } from './components/EmptyState'
import { TopBar } from './components/TopBar'
import { Waveform } from './components/Waveform'
import { ClipsPanel } from './components/ClipsPanel'
import { Transport } from './components/Transport'

export default function App() {
  const { state, dispatch } = useAppState()
  const wsRef = useRef<WaveSurfer | null>(null)
  const loadAudio = useAudioLoader(dispatch)
  const { isDragging, handleFile } = useFileUpload(loadAudio)
  const { toggleSong, toggleClip } = usePlayback(wsRef, state, dispatch)
  useKeyboardShortcuts({ state, dispatch, toggleSong, toggleClip })

  if (!state.song) {
    return (
      <div className="h-screen bg-zinc-950 text-white flex flex-col">
        <EmptyState isDragging={isDragging} onFile={handleFile} />
      </div>
    )
  }

  const { song, clips, playback } = state
  const activeClip = clips.find(c => c.id === playback.activeClipId)
  const nowPlayingLabel = activeClip ? activeClip.name : song.name

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col">
      <TopBar songName={song.name} onFile={handleFile} />
      <ClipsPanel
        clips={clips}
        activeClipId={playback.activeClipId}
        playingClipId={playback.status === 'playing' ? playback.activeClipId : null}
        dispatch={dispatch}
        onPlayClip={toggleClip}
      />
      <Waveform
        song={song}
        clips={clips}
        playback={playback}
        dispatch={dispatch}
        wsRef={wsRef}
      />
      <Transport
        isPlaying={playback.status === 'playing'}
        currentTime={playback.currentTime}
        duration={song.duration}
        label={nowPlayingLabel}
        onPlayPause={toggleSong}
      />
    </div>
  )
}
