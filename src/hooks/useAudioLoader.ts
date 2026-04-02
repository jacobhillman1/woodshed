import { useCallback, Dispatch } from 'react'
import { Action } from '@/state/reducer'

export function useAudioLoader(dispatch: Dispatch<Action>, onError: (msg: string) => void) {
  return useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioCtx = new AudioContext()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const objectUrl = URL.createObjectURL(file)
      dispatch({
        type: 'LOAD_SONG',
        payload: { file, name: file.name, duration: audioBuffer.duration, audioBuffer, objectUrl },
      })
    } catch {
      onError('Could not decode audio. Make sure the file is a valid MP3.')
    }
  }, [dispatch, onError])
}
