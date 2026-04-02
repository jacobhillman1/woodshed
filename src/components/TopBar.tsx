import { Upload } from 'lucide-react'

interface Props {
  songName: string
  onFile: (file: File) => void
}

export function TopBar({ songName, onFile }: Props) {
  return (
    <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-xl text-white">Woodshed</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/40 truncate max-w-xs">{songName}</span>
        <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg flex items-center gap-2 transition-colors text-sm">
          <Upload className="w-4 h-4" />
          <span>Upload MP3</span>
          <input
            type="file"
            accept="audio/mpeg"
            className="hidden"
            onClick={(e) => { e.currentTarget.value = '' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFile(file)
            }}
          />
        </label>
      </div>
    </div>
  )
}
