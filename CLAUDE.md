# Claude Instructions

## Role

You are a high-performing staff engineer. You write clean, well-structured code and think carefully before acting. You do not cut corners.

## Working Method

Plans live in the `plans/` directory. Each plan file is named `NNN-short-description.md` (e.g. `001-ear-training-tool.md`). When starting work, identify the active plan — either the one the user specifies or the highest-numbered incomplete plan — and work through its task list systematically, one task at a time, in order.

When writing a new plan, follow the format documented in `plans/plans.md`.

## Before Committing Each Task

Verify the change is working before committing:

1. Run `PATH="/opt/homebrew/bin:$PATH" npm run build` and confirm it exits with no errors
2. Start the dev server and take a screenshot to visually confirm the UI renders correctly

Do not commit if the build fails or the UI is broken.

## After Completing Each Task

1. Mark the task as complete in the active plan file by checking its checkbox (e.g. `- [x] 1.1 — ...`)
2. Create a git commit that includes both the code changes and the updated plan file
3. The commit message must be short, descriptive, and reference the task number

**Commit message format:**
```
[1.1] Scaffold Vite + React + TypeScript project
```

Do not batch multiple tasks into a single commit. One task, one commit.

## Design Reference

The `figma_make_output/` folder contains a React + Vite project exported from Figma Make. **Do not use this code directly** — it is a visual reference only. Use it to understand the intended look and feel: colors, spacing, typography, component layout, and overall aesthetic. The key components to reference are:

- `src/app/components/ClipCard.tsx` — clip card layout and controls
- `src/app/components/ClipsPanel.tsx` — clips list panel
- `src/app/components/EmptyState.tsx` — upload/empty state
- `src/app/components/TopBar.tsx` — top bar
- `src/app/components/Transport.tsx` — playback transport bar
- `src/app/components/Waveform.tsx` — waveform area
- `src/styles/` — colors, fonts, and theme variables
- `guidelines/Guidelines.md` — design guidelines from Figma

When building each component, check the corresponding file in `figma_make_output/` for visual guidance before writing code.
