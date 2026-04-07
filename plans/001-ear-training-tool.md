# Ear Training Tool — Build Plan

---

## Entity Relationship Diagram (Data Model)

Since this app is fully client-side with no database, the ERD describes the **in-memory state model** — the core data structures the app manages at runtime.

---

### Entity: `Song`

Represents the currently loaded audio file. Only one song can be loaded at a time.

| Field | Type | Description |
|---|---|---|
| `file` | `File` | The raw File object from the upload |
| `name` | `string` | Filename, used as display label |
| `duration` | `number` | Total duration in seconds |
| `audioBuffer` | `AudioBuffer` | Decoded PCM audio data (Web Audio API) |
| `objectUrl` | `string` | Blob URL for WaveSurfer to render the waveform |

---

### Entity: `Clip`

Represents a user-defined region of the song. Multiple clips can exist per song, and they can overlap freely.

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique ID (uuid) |
| `name` | `string` | User-editable label (e.g. "Intro Riff") |
| `startTime` | `number` | Start position in seconds |
| `endTime` | `number` | End position in seconds |
| `isLooping` | `boolean` | Whether playback loops within this clip |
| `speed` | `number` | Playback speed (0.25–1.0, step 0.05) |

---

### Entity: `PlaybackState`

Tracks what is currently playing and its status. Shared across the full app.

| Field | Type | Description |
|---|---|---|
| `status` | `'idle' \| 'playing' \| 'paused'` | Current playback status |
| `mode` | `'song' \| 'clip'` | Whether the full song or a clip is active |
| `activeClipId` | `string \| null` | ID of the active clip (null if playing full song) |
| `currentTime` | `number` | Current playhead position in seconds |

---

### Entity: `AppState` (top-level)

The root state that holds all the above.

| Field | Type | Description |
|---|---|---|
| `song` | `Song \| null` | The loaded song, or null if nothing is uploaded |
| `clips` | `Clip[]` | Ordered list of all clips |
| `playback` | `PlaybackState` | Current playback state |

---

### Relationships

```
AppState
  └── song: Song (0 or 1)
  └── clips: Clip[] (0 to 20)
  └── playback: PlaybackState (always 1)

PlaybackState
  └── activeClipId → references Clip.id (nullable)
```

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | **React** | Component-driven UI maps cleanly to clip cards, song state, and playback context |
| Build tool | **Vite** | Fast dev server, minimal config, great React support |
| Waveform | **WaveSurfer.js** | Best-in-class waveform rendering, built-in region selection plugin for clip creation |
| Audio engine | **Web Audio API** | Native browser API for decoding audio and time-stretching without pitch change |
| State management | **React Context + useReducer** | App state is simple enough — no need for Redux or Zustand |
| Styling | **CSS Modules or Tailwind** | Either works; Tailwind is faster to iterate with |
| IDs | **crypto.randomUUID()** | Built-in, no library needed |
| Language | **TypeScript** | Entities above map directly to interfaces; catches bugs early |

No backend. No persistence. Everything lives in browser memory.

---

## Task Breakdown

Tasks are ordered by dependency — each builds on the previous.

### Phase 1: Project Setup
- [x] 1.1 — Scaffold Vite + React + TypeScript project
- [x] 1.2 — Install dependencies: WaveSurfer.js, uuid (or use crypto.randomUUID)
- [x] 1.3 — Set up folder structure: `components/`, `hooks/`, `state/`, `types/`
- [x] 1.4 — Define TypeScript interfaces for `Song`, `Clip`, `PlaybackState`, `AppState`
- [x] 1.5 — Set up global state with `useReducer` and React Context

### Phase 2: Upload & Empty State
- [x] 2.1 — Build full-screen drag-and-drop upload zone (empty state)
- [x] 2.2 — Handle file input (drag-and-drop + click-to-browse)
- [x] 2.3 — Decode uploaded MP3 into `AudioBuffer` via Web Audio API
- [x] 2.4 — Generate object URL and populate `Song` in app state
- [x] 2.5 — Transition from empty state to main app layout on successful upload

### Phase 3: Waveform
- [x] 3.1 — Integrate WaveSurfer.js and render waveform from loaded song
- [x] 3.2 — Display playhead that tracks current time
- [x] 3.3 — Enable click-to-seek on waveform
- [x] 3.4 — Enable click-and-drag to define a region → creates a new Clip
- [x] 3.5 — Render colored highlight overlays on waveform for each clip

### Phase 4: Clip Cards
- [x] 4.1 — Build `ClipCard` component with all fields (name, times, controls)
- [x] 4.2 — Render clips panel (scrollable list of ClipCards)
- [x] 4.3 — Editable clip name (inline text input)
- [x] 4.4 — Start/end time display with nudge buttons (±0.05s increments)
- [x] 4.5 — Delete clip button
- [x] 4.6 — Empty state inside clips panel ("Drag on the waveform to create a clip")

### Phase 5: Playback Engine
- [x] 5.1 — Full song play/pause via WaveSurfer
- [x] 5.2 — Clip play/pause (seek to start, play to end, stop or loop)
- [x] 5.3 — Loop toggle per clip
- [x] 5.4 — Speed control per clip (0.25x–1.0x, pitch-preserved via Web Audio API)
- [x] 5.5 — Transport bar: current time, total duration, now-playing label
- [x] 5.6 — Visual active state on clip card when that clip is playing

### Phase 6: Keyboard Shortcuts
- [x] 6.1 — Space: play/pause active context (song or selected clip)
- [x] 6.2 — L: toggle loop on active clip
- [x] 6.3 — `[` / `]`: decrease/increase speed by 0.05x
- [x] 6.4 — 1–9: select clip by number

### Phase 7: Polish
- [x] 7.1 — Apply dark theme and accent color throughout
- [x] 7.2 — Responsive layout (clips panel + waveform at bottom)
- [x] 7.3 — Hover states, transitions, focus styles
- [x] 7.4 — Error handling (unsupported file type, decode failure)
- [x] 7.5 — Final QA pass against PRD checklist
