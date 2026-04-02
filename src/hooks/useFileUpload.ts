import { useState, useEffect, useCallback } from 'react'

export function useFileUpload(onFile: (file: File) => void, onError: (msg: string) => void) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback((file: File) => {
    if (file.type === 'audio/mpeg') {
      onFile(file)
    } else {
      onError('Only MP3 files are supported.')
    }
  }, [onFile, onError])

  useEffect(() => {
    let dragCounter = 0

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter++
      setIsDragging(true)
    }

    const onDragLeave = () => {
      dragCounter--
      if (dragCounter === 0) setIsDragging(false)
    }

    const onDragOver = (e: DragEvent) => e.preventDefault()

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounter = 0
      setIsDragging(false)
      const file = e.dataTransfer?.files[0]
      if (file) handleFile(file)
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)

    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [handleFile])

  return { isDragging, handleFile }
}
