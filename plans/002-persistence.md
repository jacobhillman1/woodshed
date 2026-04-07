# Session Persistence — Build Plan

All app state (uploaded MP3, clips) currently lives only in memory — a page refresh destroys everything. This plan adds semi-persistent storage using IndexedDB (via the `idb` wrapper) so the user's session survives refreshes without a backend.

---

## Data Model

A single IndexedDB record represents the full session. Only one session exists at a time.

**Database:** `woodshed`, version 1
**Object store:** `session`, keyPath: `id`

### Entity: `PersistedSession`

| Field | Type | Description |
|---|---|---|
| `id` | `'current'` | Fixed key — only one session record |
| `audioBlob` | `Blob` | The raw audio file bytes |
| `audioFileName` | `string` | Original filename for display |
| `clips` | `Clip[]` | Full clip list at time of save |

---

## Tech Stack

| Addition | Choice | Reason |
|---|---|---|
| IndexedDB wrapper | `idb` | Thin promise-based wrapper; avoids raw IDBRequest callbacks |

---

## Task Breakdown

Tasks are ordered by dependency.

### Phase 1: Install & Setup
- [ ] 1.1 — Install `idb` via npm
- [ ] 1.2 — Create `src/lib/persistence.ts` with `openDB` schema and three exported functions: `saveSession`, `loadSession`, `clearSession`

### Phase 2: Restore on Mount
- [ ] 2.1 — In `App.tsx`, add `audioFileName` state (`string | null`)
- [ ] 2.2 — On mount, call `loadSession()` and if a session exists, run the blob through the existing decode path, restore clips, and set `audioFileName`

### Phase 3: Save on Upload
- [ ] 3.1 — In `handleFileSelect`, after successful decode, call `saveSession(file, file.name, clips)`

### Phase 4: Save on Clips Change
- [ ] 4.1 — Add a debounced `useEffect` (500ms) that calls `saveSession` whenever `clips` changes — covers create, rename, nudge, delete, loop toggle, and speed change

---

## Critical Files

| File | Action |
|---|---|
| `package.json` | Add `idb` dependency |
| `src/lib/persistence.ts` | Create — IndexedDB wrapper |
| `src/App.tsx` | Modify — mount restore, upload save, clips save |

---

## Verification

1. Load app fresh — empty state (no session yet)
2. Upload an MP3 — waveform renders
3. Create 2–3 clips, rename one
4. Hard-refresh (`Cmd+Shift+R`)
5. App should restore the audio and all clips automatically
6. DevTools → Application → IndexedDB → `woodshed` → `session` → `"current"` record should be visible
7. Upload a different song — session updates to new file; old clips cleared
