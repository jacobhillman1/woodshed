import { useCallback } from 'react'
import { Dispatch } from 'react'
import { Action } from '@/state/reducer'

export function useAudioLoader(dispatch: Dispatch<Action>) {
  return useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()
    const audioCtx = new AudioContext()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    const objectUrl = URL.createObjectURL(file)

    dispatch({
      type: 'LOAD_SONG',
      payload: {
        file,
        name: file.name,
        duration: audioBuffer.duration,
        audioBuffer,
        objectUrl,
      },
    })
  }, [dispatch])
}
