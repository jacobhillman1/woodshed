import { useEffect, useRef, useMemo } from 'react'

interface Props {
  audioBuffer: AudioBuffer
  startTime: number
  endTime: number
  currentTime: number
  isActive: boolean
}

export function ClipWaveform({ audioBuffer, startTime, endTime, currentTime, isActive }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Compute peak values for the clip's time range — only recompute when clip bounds change
  const peaks = useMemo(() => {
    const { sampleRate } = audioBuffer
    const data = audioBuffer.getChannelData(0)
    const startSample = Math.floor(startTime * sampleRate)
    const endSample = Math.floor(endTime * sampleRate)
    const numBars = 120
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

  const progress = isActive
    ? Math.max(0, Math.min(1, (currentTime - startTime) / (endTime - startTime)))
    : 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    const barW = width / peaks.length
    const mid = height / 2

    peaks.forEach((peak, i) => {
      const x = i * barW
      const h = Math.max(1, peak * height * 0.9)
      const played = isActive && i / peaks.length <= progress
      ctx.fillStyle = played ? '#fb923c' : '#3f3f46'
      ctx.fillRect(x + 0.5, mid - h / 2, Math.max(1, barW - 1), h)
    })

    // Cursor line
    if (isActive) {
      const cursorX = Math.round(progress * width)
      ctx.fillStyle = '#fb923c'
      ctx.fillRect(cursorX - 1, 0, 2, height)
    }
  }, [peaks, progress, isActive])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={32}
      className="w-full rounded-sm"
      style={{ height: 32 }}
    />
  )
}
