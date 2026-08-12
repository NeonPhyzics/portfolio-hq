# Portfolio HQ — CLAUDE.md

## Purpose
Personal task management PWA for a multi-venture portfolio. Also my learning
vehicle for Git, Supabase, and Claude Code. The tool must ship; the learning
is a byproduct, not a license for scope creep.

## MVP — done_when (this defines "pencils down")
- [ ] Tasks CRUD backed by Supabase
- [ ] Every task has: title, notes, band (1-4), domain (Business | Household),
      urgency, status, due date (optional)
- [ ] Default sort: band ascending, then urgency. Band always sorts first.
- [ ] Filtered views: by band, by domain, and a combined "Monday review" view
      showing open Band 1 tasks first
- [ ] Installable/usable as a PWA on mobile
- [ ] Existing task data migrated in

## Band taxonomy (fixed — do not add bands)
1 = Core Business (Exit Ready HR: pipeline, offers, delivery)
2 = Business Tools (books, one-time setups; done-is-done)
3 = Tools + Learning (fixed R&D budget; skill is the deliverable)
4 = Hobbies (leftover time only)
Domain flag is separate from band: Business or Household.

## Working rules
- Two-track backlog: MVP.md is the punch list to done_when. PLAYGROUND.md is
  every other idea. If I or you propose anything outside done_when, log it to
  PLAYGROUND.md and return to the punch list. Never build playground items
  before MVP ships.
- Challenge my scope before acting. If a request expands the MVP, say so.
- Explain the "why" once, briefly, when introducing a new Git/Supabase/Code
  pattern. Don't over-explain basics.
- After MVP ships: main branch is stable and boring. All experiments happen
  on feature branches. Never experiment on main.

## Stage-gate rule (governance, not a feature)
Band 3 is R&D. A Band 3 venture graduates to Band 1 only when all three
gate criteria are met:
1. Commercial trigger (a real client/buyer wants it)
2. Compliance review cleared
3. Delivery standard defined
Graduation = re-banding that venture's tasks from 3 to 1. No new schema,
no new views, no gate logic in the app. If I ask you to build stage-gate
features before MVP ships and survives a month of real-data use, refuse
and point me to PLAYGROUND.md.

## Vault sync — close session

Trigger: "close session" or similar, typed in this repo's chat.

This repo's chat and the AI-Framework vault chat are separate sessions with no shared
memory — the only thing that carries status between them is what gets written to disk. On
close, write a status line back to this repo's vault project record at
`../10-projects/portfolio-hq/_project.md` (relative to this repo's root): update
`next_action` (what to pick up next, plain language, specific enough that the vault chat can
report it without re-deriving it from commits) and `stage` (intake | scoping | active |
review | ratified | parked | closed) to reflect this session, and set `updated:` to today's
date (ISO `YYYY-MM-DD`). Leave every other field alone. Do not put code, diffs, or detailed
session narrative there — this repo's own commit history and `MVP.md`/`PLAYGROUND.md` are
the record of *what* happened; the vault record is only *where things stand*. Commit the
`_project.md` change as part of this repo's normal close-out, same as any other file.

If a chat closes without doing this, the vault will report a stale status next time anyone
opens it there — flag that risk rather than silently skipping the step.

## Supabase CLI credentials

Use `.\scripts\sb.ps1 <command>` instead of bare `supabase <command>` for any command that
needs a direct Postgres connection (`migration list`, `db push`, `db reset --linked`, etc.).
It reads the DB password from a repo-local, gitignored `.supabase-db-password` file and
scopes it to that one command's process — never the global `SUPABASE_DB_PASSWORD` env var,
which is shared across every Supabase project on the machine and silently breaks
cross-project auth. See `.supabase-db-password.example` for setup.
