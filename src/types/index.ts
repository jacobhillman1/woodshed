export interface Song {
  file: File
  name: string
  duration: number
  audioBuffer: AudioBuffer
  objectUrl: string
}

export interface Clip {
  id: string
  name: string
  startTime: number
  endTime: number
  isLooping: boolean
  speed: number
}

export interface PlaybackState {
  status: 'idle' | 'playing' | 'paused'
  mode: 'song' | 'clip'
  activeClipId: string | null
  currentTime: number
}

export interface AppState {
  song: Song | null
  clips: Clip[]
  playback: PlaybackState
}
