import { AppState, Clip, Song } from '@/types'

export type Action =
  | { type: 'LOAD_SONG'; payload: Song }
  | { type: 'UNLOAD_SONG' }
  | { type: 'ADD_CLIP'; payload: Clip }
  | { type: 'UPDATE_CLIP'; payload: { id: string; changes: Partial<Clip> } }
  | { type: 'DELETE_CLIP'; payload: string }
  | { type: 'PLAY_SONG' }
  | { type: 'PLAY_CLIP'; payload: string }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SET_CURRENT_TIME'; payload: number }

export const initialState: AppState = {
  song: null,
  clips: [],
  playback: {
    status: 'idle',
    mode: 'song',
    activeClipId: null,
    currentTime: 0,
  },
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_SONG':
      return { ...initialState, song: action.payload }

    case 'UNLOAD_SONG':
      return { ...initialState }

    case 'ADD_CLIP':
      return { ...state, clips: [...state.clips, action.payload] }

    case 'UPDATE_CLIP':
      return {
        ...state,
        clips: state.clips.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c
        ),
      }

    case 'DELETE_CLIP':
      return {
        ...state,
        clips: state.clips.filter((c) => c.id !== action.payload),
        playback:
          state.playback.activeClipId === action.payload
            ? { ...state.playback, status: 'idle', activeClipId: null }
            : state.playback,
      }

    case 'PLAY_SONG':
      return {
        ...state,
        playback: { ...state.playback, status: 'playing', mode: 'song', activeClipId: null },
      }

    case 'PLAY_CLIP':
      return {
        ...state,
        playback: { ...state.playback, status: 'playing', mode: 'clip', activeClipId: action.payload },
      }

    case 'PAUSE':
      return { ...state, playback: { ...state.playback, status: 'paused' } }

    case 'STOP':
      return {
        ...state,
        playback: { ...state.playback, status: 'idle', activeClipId: null, currentTime: 0 },
      }

    case 'SET_CURRENT_TIME':
      return { ...state, playback: { ...state.playback, currentTime: action.payload } }

    default:
      return state
  }
}
