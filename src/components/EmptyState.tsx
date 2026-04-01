import { Upload } from 'lucide-react'

interface Props {
  isDragging: boolean
  onFile: (file: File) => void
}

export function EmptyState({ isDragging, onFile }: Props) {
  return (
    <label
      className={`flex-1 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed rounded-xl m-8 transition-all
        ${isDragging
          ? 'border-orange-500 bg-orange-500/10'
          : 'border-white/20 hover:border-white/30 hover:bg-white/5'
        }`}
    >
      <Upload className={`w-16 h-16 mb-4 transition-colors ${isDragging ? 'text-orange-500' : 'text-white/40'}`} />
      <p className="text-lg text-white/60 mb-2">Drop an MP3 anywhere to get started</p>
      <p className="text-sm text-white/40">or click to browse</p>
      <input
        type="file"
        accept="audio/mpeg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
    </label>
  )
}
