import { useCallback, useEffect, useRef, Dispatch } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { AppState, Clip } from '@/types'
import { Action } from '@/state/reducer'

export function usePlayback(
  wsRef: React.MutableRefObject<WaveSurfer | null>,
  state: AppState,
  dispatch: Dispatch<Action>,
  cancelLoopRef?: React.MutableRefObject<() => void>
) {
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  const pause = useCallback(() => {
    cancelLoopRef?.current()
    wsRef.current?.pause()
    dispatch({ type: 'PAUSE' })
  }, [wsRef, dispatch, cancelLoopRef])

  const playClip = useCallback((clip: Clip) => {
    const ws = wsRef.current
    if (!ws) return
    ws.setPlaybackRate(clip.speed, true)
    ws.play(clip.startTime, clip.endTime)
    dispatch({ type: 'PLAY_CLIP', payload: clip.id })
  }, [wsRef, dispatch])

  const playSong = useCallback(() => {
    const ws = wsRef.current
    if (!ws) return
    ws.setPlaybackRate(1.0, true)
    ws.play()
    dispatch({ type: 'PLAY_SONG' })
  }, [wsRef, dispatch])

  const toggleSong = useCallback(() => {
    const { status, mode } = stateRef.current.playback
    if (status === 'playing' && mode === 'song') pause()
    else playSong()
  }, [playSong, pause])

  const toggleClip = useCallback((clipId: string) => {
    const { status, activeClipId } = stateRef.current.playback
    if (status === 'playing' && activeClipId === clipId) {
      pause()
    } else {
      const clip = stateRef.current.clips.find(c => c.id === clipId)
      if (clip) playClip(clip)
    }
  }, [playClip, pause])

  // Apply speed change to WaveSurfer if that clip is currently playing
  useEffect(() => {
    const { status, mode, activeClipId } = state.playback
    if (status !== 'playing' || mode !== 'clip' || !activeClipId) return
    const clip = state.clips.find(c => c.id === activeClipId)
    if (clip) wsRef.current?.setPlaybackRate(clip.speed, true)
  }, [state.clips, state.playback, wsRef])

  return { toggleSong, toggleClip }
}
