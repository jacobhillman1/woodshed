import { useEffect, useRef } from 'react'
import { Dispatch } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'
import { Song, Clip } from '@/types'
import { Action } from '@/state/reducer'

const CLIP_COLORS = [
  'rgba(59, 130, 246, 0.3)',
  'rgba(34, 197, 94, 0.3)',
  'rgba(168, 85, 247, 0.3)',
  'rgba(236, 72, 153, 0.3)',
  'rgba(251, 191, 36, 0.3)',
]

interface Props {
  song: Song
  clips: Clip[]
  dispatch: Dispatch<Action>
}

export function Waveform({ song, clips, dispatch }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WaveSurfer | null>(null)
  const regionsRef = useRef<RegionsPlugin | null>(null)
  const clipsRef = useRef(clips)
  const addingRef = useRef(false)

  useEffect(() => { clipsRef.current = clips }, [clips])

  useEffect(() => {
    if (!containerRef.current) return

    const regions = RegionsPlugin.create()
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#3f3f46',
      progressColor: '#fb923c',
      cursorColor: '#fb923c',
      height: 128,
      normalize: true,
      interact: true,
      plugins: [regions],
    })

    ws.load(song.objectUrl)

    ws.on('timeupdate', (currentTime) => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime })
    })

    regions.enableDragSelection({ color: 'rgba(251, 146, 60, 0.25)' })

    regions.on('region-created', (region) => {
      if (addingRef.current) return
      const clip: Clip = {
        id: crypto.randomUUID(),
        name: `Clip ${clipsRef.current.length + 1}`,
        startTime: region.start,
        endTime: region.end,
        isLooping: false,
        speed: 1.0,
      }
      region.remove()
      dispatch({ type: 'ADD_CLIP', payload: clip })
    })

    wsRef.current = ws
    regionsRef.current = regions

    return () => {
      ws.destroy()
      wsRef.current = null
      regionsRef.current = null
    }
  }, [song.objectUrl, dispatch])

  // Sync clips to regions
  useEffect(() => {
    const regions = regionsRef.current
    if (!regions) return
    addingRef.current = true
    regions.clearRegions()
    clips.forEach((clip, i) => {
      regions.addRegion({
        id: `clip-${clip.id}`,
        start: clip.startTime,
        end: clip.endTime,
        color: CLIP_COLORS[i % CLIP_COLORS.length],
        drag: false,
        resize: false,
      })
    })
    addingRef.current = false
  }, [clips])

  return (
    <div className="border-t border-white/10 flex-shrink-0">
      <div ref={containerRef} />
    </div>
  )
}
