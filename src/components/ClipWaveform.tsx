import { useLayoutEffect, useRef, useMemo } from 'react'

interface Props {
  audioBuffer: AudioBuffer
  startTime: number
  endTime: number
  currentTime: number
  isPlaying: boolean
}

export function ClipWaveform({ audioBuffer, startTime, endTime, currentTime, isPlaying }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Compute peak values for the clip's time range — only recompute when clip bounds change
  const peaks = useMemo(() => {
    const { sampleRate } = audioBuffer
    const data = audioBuffer.getChannelData(0)
    const startSample = Math.floor(startTime * sampleRate)
    const endSample = Math.floor(endTime * sampleRate)
    const numBars = 200
    const step = Math.max(1, Math.floor((endSample - startSample) / numBars))
    const bars: number[] = []
    for (let i = 0; i < numBars; i++) {
      let max = 0
      for (let j = 0; j < step; j++) {
        const s = data[startSample + i * step + j]
        if (s !== undefined) max = Math.max(max, Math.abs(s))
      }
      bars.push(max)
    }
    return bars
  }, [audioBuffer, startTime, endTime])

  const progress = isPlaying
    ? Math.max(0, Math.min(1, (currentTime - startTime) / (endTime - startTime)))
    : 0

  // useLayoutEffect so canvas dimensions are set before paint — avoids blurry first frame
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Scale canvas buffer to device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth || 300
    const H = canvas.offsetHeight || 32

    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, W, H)

    const barW = W / peaks.length
    const mid = H / 2

    peaks.forEach((peak, i) => {
      const x = i * barW
      const h = Math.max(1, peak * H * 0.9)
      const played = isPlaying && i / peaks.length <= progress
      ctx.fillStyle = played ? '#fb923c' : '#3f3f46'
      ctx.fillRect(x + 0.5, mid - h / 2, Math.max(1, barW - 1), h)
    })

    // Cursor line
    if (isPlaying) {
      const cursorX = Math.round(progress * W)
      ctx.fillStyle = '#fb923c'
      ctx.fillRect(cursorX - 1, 0, 2, H)
    }
  }, [peaks, progress, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-sm"
      style={{ height: 32 }}
    />
  )
}
