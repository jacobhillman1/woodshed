import { useEffect, useRef, Dispatch } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'
import { Song, Clip, PlaybackState } from '@/types'
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
  playback: PlaybackState
  dispatch: Dispatch<Action>
  wsRef: React.MutableRefObject<WaveSurfer | null>
  cancelLoopRef: React.MutableRefObject<() => void>
}

export function Waveform({ song, clips, playback, dispatch, wsRef, cancelLoopRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const regionsRef = useRef<RegionsPlugin | null>(null)
  const clipsRef = useRef(clips)
  const playbackRef = useRef(playback)
  const clipEndingRef = useRef(false)
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function syncRegions() {
    const regions = regionsRef.current
    if (!regions) return
    regions.clearRegions()
    const activeId = playbackRef.current.activeClipId
    const visible = activeId
      ? clipsRef.current.filter(c => c.id === activeId)
      : clipsRef.current
    visible.forEach((clip, i) => {
      regions.addRegion({
        id: `clip-${clip.id}`,
        start: clip.startTime,
        end: clip.endTime,
        color: CLIP_COLORS[i % CLIP_COLORS.length],
        drag: false,
        resize: false,
      })
    })
  }

  useEffect(() => { clipsRef.current = clips }, [clips])
  useEffect(() => { playbackRef.current = playback }, [playback])

  // Expose a way for usePlayback to cancel pending loop restarts before pausing
  cancelLoopRef.current = () => {
    clipEndingRef.current = false
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current)
      loopTimerRef.current = null
    }
  }

  // Freeze the main waveform cursor/progress during clip playback so the
  // animation lives only on the clip's own mini waveform.
  const { mode, status } = playback
  useEffect(() => {
    const ws = wsRef.current
    if (!ws) return
    const isClipPlaying = mode === 'clip' && status === 'playing'
    ws.setOptions({
      cursorWidth: isClipPlaying ? 0 : 1,
      progressColor: isClipPlaying ? '#3f3f46' : '#fb923c',
    })
  }, [mode, status, wsRef])

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
    ws.on('ready', () => syncRegions())

    ws.on('timeupdate', (currentTime) => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime })
      // Flag when we reach a clip's end — fires in same timer tick as the auto-pause
      const pb = playbackRef.current
      if (pb.mode === 'clip' && pb.activeClipId) {
        const clip = clipsRef.current.find(c => c.id === pb.activeClipId)
        if (clip && currentTime >= clip.endTime) clipEndingRef.current = true
      }
    })

    // 'finish' only fires when audio reaches end-of-file (media 'ended' event).
    // For clip playback, 'pause' fires instead — handled below.
    ws.on('finish', () => {
      if (playbackRef.current.mode !== 'clip') dispatch({ type: 'STOP' })
    })

    // Fires whenever WaveSurfer pauses — both user-initiated and clip-end auto-pause.
    // clipEndingRef distinguishes the two: it's set by timeupdate in the same timer
    // tick that triggers the auto-pause, so user pauses leave it false.
    ws.on('pause', () => {
      if (!clipEndingRef.current) return
      clipEndingRef.current = false
      const pb = playbackRef.current
      const clip = clipsRef.current.find(c => c.id === pb.activeClipId)
      if (clip?.isLooping) {
        loopTimerRef.current = setTimeout(() => {
          loopTimerRef.current = null
          ws.play(clip.startTime, clip.endTime)
        }, 0)
      } else {
        dispatch({ type: 'STOP' })
      }
    })

    regions.enableDragSelection({ color: 'rgba(251, 146, 60, 0.25)' })

    regions.on('region-created', (region) => {
      if (region.id.startsWith('clip-')) return
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
  }, [song.objectUrl, dispatch, wsRef])

  // Only recompute regions when clip boundaries or selection changes — not on
  // every UPDATE_CLIP (e.g. speed/name/loop changes), which would cause flicker.
  const regionKey = (
    playback.activeClipId
      ? clips.filter(c => c.id === playback.activeClipId)
      : clips
  ).map(c => `${c.id}:${c.startTime}:${c.endTime}`).join(',') + '|' + playback.activeClipId

  useEffect(() => {
    syncRegions()
  }, [regionKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="border-t border-white/10 flex-shrink-0">
      <div ref={containerRef} />
    </div>
  )
}
