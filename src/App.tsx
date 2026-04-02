import { useRef, useState, useEffect, useCallback } from 'react'
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
  const [error, setError] = useState<string | null>(null)

  const onError = useCallback((msg: string) => setError(msg), [])

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error])

  const loadAudio = useAudioLoader(dispatch, onError)
  const { isDragging, handleFile } = useFileUpload(loadAudio, onError)
  const { toggleSong, toggleClip } = usePlayback(wsRef, state, dispatch)
  useKeyboardShortcuts({ state, dispatch, toggleSong, toggleClip })

  const { song, clips, playback } = state
  const activeClip = clips.find(c => c.id === playback.activeClipId)
  const nowPlayingLabel = activeClip ? activeClip.name : song?.name ?? ''

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col relative">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          {error}
        </div>
      )}

      {!song ? (
        <EmptyState isDragging={isDragging} onFile={handleFile} />
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
