import { useLayoutEffect, useRef, useMemo, useState } from 'react'

interface Props {
  audioBuffer: AudioBuffer
  startTime: number
  endTime: number
  currentTime: number
  isPlaying: boolean
  isActive: boolean
  onTrimChange?: (startTime: number, endTime: number) => void
}

export function ClipWaveform({
  audioBuffer,
  startTime,
  endTime,
  currentTime,
  isPlaying,
  isActive,
  onTrimChange
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<'left' | 'right' | null>(null)
  const [hoveredHandle, setHoveredHandle] = useState<'left' | 'right' | null>(null)
  const dragStartRef = useRef({ x: 0, startTime: 0, endTime: 0 })

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

    // Playhead line (thin orange vertical line)
    if (isPlaying && progress > 0 && progress < 1) {
      const cursorX = Math.round(progress * W)
      ctx.fillStyle = '#fb923c'
      ctx.fillRect(cursorX - 0.5, 0, 1, H)
    }
  }, [peaks, progress, isPlaying])

  const handleMouseDown = (e: React.MouseEvent, handle: 'left' | 'right') => {
    e.stopPropagation()
    setDragging(handle)
    dragStartRef.current = {
      x: e.clientX,
      startTime,
      endTime,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current || !onTrimChange) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const totalDuration = audioBuffer.duration
    const deltaX = e.clientX - dragStartRef.current.x
    const deltaTime = (deltaX / rect.width) * totalDuration * 0.1 // Scale sensitivity

    const minClipDuration = 0.05

    if (dragging === 'left') {
      const newStart = Math.max(
        0,
        Math.min(
          dragStartRef.current.endTime - minClipDuration,
          dragStartRef.current.startTime + deltaTime
        )
      )
      onTrimChange(+newStart.toFixed(2), endTime)
    } else {
      const newEnd = Math.min(
        totalDuration,
        Math.max(
          dragStartRef.current.startTime + minClipDuration,
          dragStartRef.current.endTime + deltaTime
        )
      )
      onTrimChange(startTime, +newEnd.toFixed(2))
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  useLayoutEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, startTime, endTime, audioBuffer.duration])

  const handleStyle = isActive
    ? 'bg-[#fb923c] shadow-md'
    : 'bg-[#fb923c]/60'

  const hoveredStyle = (handle: 'left' | 'right') =>
    hoveredHandle === handle ? 'bg-[#fb923c] scale-110' : handleStyle

  return (
    <div ref={containerRef} className="relative" style={{ height: 40 }}>
      {/* Orange frame - top rail */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] ${isActive ? 'bg-[#fb923c]' : 'bg-[#fb923c]/40'}`} />

      {/* Orange frame - bottom rail */}
      <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${isActive ? 'bg-[#fb923c]' : 'bg-[#fb923c]/40'}`} />

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-x-0 top-0 w-full"
        style={{ height: 40 }}
      />

      {/* Left trim handle */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize transition-all ${hoveredStyle('left')}`}
        onMouseDown={(e) => handleMouseDown(e, 'left')}
        onMouseEnter={() => setHoveredHandle('left')}
        onMouseLeave={() => setHoveredHandle(null)}
      >
        {/* Grip indicator - chevron */}
        <div className="absolute left-[3px] top-1/2 -translate-y-1/2 flex flex-col gap-[2px]">
          <div className={`w-[2px] h-2 bg-white/90 rounded-full ${isActive ? 'opacity-100' : 'opacity-60'}`} />
          <div className={`w-[2px] h-2 bg-white/90 rounded-full ${isActive ? 'opacity-100' : 'opacity-60'}`} />
        </div>
      </div>

      {/* Right trim handle */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize transition-all ${hoveredStyle('right')}`}
        onMouseDown={(e) => handleMouseDown(e, 'right')}
        onMouseEnter={() => setHoveredHandle('right')}
        onMouseLeave={() => setHoveredHandle(null)}
      >
        {/* Grip indicator - chevron */}
        <div className="absolute right-[3px] top-1/2 -translate-y-1/2 flex flex-col gap-[2px]">
          <div className={`w-[2px] h-2 bg-white/90 rounded-full ${isActive ? 'opacity-100' : 'opacity-60'}`} />
          <div className={`w-[2px] h-2 bg-white/90 rounded-full ${isActive ? 'opacity-100' : 'opacity-60'}`} />
        </div>
      </div>
    </div>
  )
}
