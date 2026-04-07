# Plans

This directory contains build plans for features and projects in this repo.

## Naming Convention

Files are named `NNN-short-description.md` where `NNN` is a zero-padded sequence number:

```
001-ear-training-tool.md
002-next-feature.md
```

The number determines execution order when multiple plans exist. When starting work, use the plan the user specifies — or default to the highest-numbered incomplete plan.

---

## Plan File Format

Each plan file should contain the following sections:

### 1. Title

```md
# Feature Name — Build Plan
```

### 2. Data Model (optional)

For features with non-trivial state, document the in-memory or database entities and their relationships. Use tables for fields and a text diagram for relationships.

```md
## Entity Relationship Diagram (Data Model)

### Entity: `Foo`
| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique ID |
| `name` | `string` | Display label |

### Relationships
\```
AppState
  └── foos: Foo[]
\```
```

### 3. Tech Stack (optional)

For greenfield work or significant new dependencies, document the choices and rationale.

```md
## Tech Stack
| Layer | Choice | Reason |
|---|---|---|
| Framework | React | ... |
```

### 4. Task Breakdown (required)

Tasks grouped into phases, with checkbox tracking. Each task gets a `Phase.Task` number used in commit messages.

```md
## Task Breakdown

### Phase 1: Setup
- [ ] 1.1 — Do the first thing
- [ ] 1.2 — Do the second thing

### Phase 2: Core Feature
- [ ] 2.1 — Build the main thing
- [ ] 2.2 — Wire it up
```

Tasks are checked off as they complete:

```md
- [x] 1.1 — Do the first thing
```

---

## Commit Message Format

Each task gets its own commit, referencing the task number:

```
[1.1] Scaffold Vite + React + TypeScript project
```

See `CLAUDE.md` for the full working method.
