import { useEffect, useRef, Dispatch } from 'react'
import { AppState } from '@/types'
import { Action } from '@/state/reducer'

interface Params {
  state: AppState
  dispatch: Dispatch<Action>
  toggleSong: () => void
  toggleClip: (id: string) => void
}

export function useKeyboardShortcuts({ state, dispatch, toggleSong, toggleClip }: Params) {
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const { playback, clips } = stateRef.current

      const activeClip = clips.find(c => c.id === playback.activeClipId)

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (playback.activeClipId) toggleClip(playback.activeClipId)
          else toggleSong()
          break

        case 'l':
        case 'L':
          if (activeClip) {
            dispatch({ type: 'UPDATE_CLIP', payload: { id: activeClip.id, changes: { isLooping: !activeClip.isLooping } } })
          }
          break

        case '[':
          if (activeClip) {
            dispatch({ type: 'UPDATE_CLIP', payload: { id: activeClip.id, changes: { speed: Math.max(0.25, +(activeClip.speed - 0.05).toFixed(2)) } } })
          }
          break

        case ']':
          if (activeClip) {
            dispatch({ type: 'UPDATE_CLIP', payload: { id: activeClip.id, changes: { speed: Math.min(1.0, +(activeClip.speed + 0.05).toFixed(2)) } } })
          }
          break

        default: {
          const n = parseInt(e.key)
          if (n >= 1 && n <= 9 && clips[n - 1]) toggleClip(clips[n - 1].id)
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dispatch, toggleSong, toggleClip])
}
