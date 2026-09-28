# Portfolio HQ — CLAUDE.md

## Purpose
A local, read-mostly quick view of my portfolio: one card per project in the
AI-Framework vault (`10-projects/*/_project.md`), showing stage, next action,
blockers, open questions, and overdue/stale flags. Plus a note box that drops a
capture file into the vault's `00-inbox/` for the next vault session to triage.

It replaced a full Supabase-backed task/CRM app (2026-09-28) because that was
more project management than I need. The vault is the system of record; this
tool only shows it. Keep it small and boring.

## done_when (the contract — "pencils down")
- [x] `npm run hq` starts the local server and opens the quick view of every
      project in `10-projects/` (folders starting with `_` skipped)
- [x] Each card shows stage, next action, blockers, open questions;
      overdue reviews and stale records are flagged and sorted first
- [x] Notes from a card or the general box land in `00-inbox/` in the vault's
      capture format, and the page shows the inbox count
- [x] Old app code removed; CLAUDE.md / MVP.md / PLAYGROUND.md rewritten
- [x] Merged to main

## Hard boundaries
- **Write path is `00-inbox/` only, new files only.** Never edit, move, or
  delete anything else in the vault — not `_project.md`, not inbox notes.
  Filing notes and updating project status is the vault session's job.
- **No list/edit/delete of inbox notes in the UI.** That's the vault's Triage
  inbox job. Adding it is how this turns back into a PM tool.
- **Local only.** Server binds 127.0.0.1 and rejects cross-origin POSTs. No
  hosting, no database, no auth, no npm dependencies (Node standard library).
- Note format follows the vault's capture convention:
  `00-inbox/YYYY-MM-DD-HHmm-<slug>.md`, frontmatter `captured:` + `source:`,
  note text verbatim. The project goes in `source:` as a hint only — the vault
  says capture time never files or categorises.

## Layout
- `hq/server.js` — local HTTP server (`GET /` page, `POST /note`)
- `hq/vault.js` — reads project records, counts/writes inbox notes
- `hq/page.js` — renders the single HTML page
- Vault path defaults to `C:\Users\dnbar\OneDrive\Dreamhouse\AI-Framework`
  (same on both PCs); override with `HQ_VAULT`. Port 5180; override with `HQ_PORT`.

## Working rules
- Anything beyond done_when goes in PLAYGROUND.md, not into code.
- Challenge my scope before acting. If a request expands the tool, say so.
- Main is stable; changes happen on feature branches.

## Where this repo lives — two PCs

This repo is a local clone at `C:\Users\dnbar\Dreamhouse-Repos\portfolio-hq\` on each PC. It is
not synced by OneDrive: GitHub is the only way code moves between machines. **Start every
session with `git pull`** and end it with a push. Uncommitted work does not reach the other PC.
The tool needs no secrets.

## Vault sync — close session

Trigger: "close session" or similar, typed in this repo's chat.

This repo's chat and the AI-Framework vault chat are separate sessions with no shared
memory — the only thing that carries status between them is what gets written to disk. On
close, write a status line back to this repo's vault project record at
`C:\Users\dnbar\OneDrive\Dreamhouse\AI-Framework\10-projects\portfolio-hq\_project.md`
(absolute path — the vault is outside this repo, and the path is identical on both PCs):
update `next_action` (what to pick up next, plain language, specific enough that the vault chat
can report it without re-deriving it from commits) and `stage` (intake | scoping | active |
review | ratified | parked | closed) to reflect this session, and set `updated:` to today's
date (ISO `YYYY-MM-DD`). Leave every other field alone. Do not put code, diffs, or detailed
session narrative there — this repo's own commit history and `MVP.md`/`PLAYGROUND.md` are
the record of *what* happened; the vault record is only *where things stand*.

That file belongs to the **vault's** git repo, not this one. Commit only that file there, then
push it:
`git -C "C:\Users\dnbar\OneDrive\Dreamhouse\AI-Framework" commit -m "portfolio-hq: status sync" -- 10-projects/portfolio-hq/_project.md`,
then `git -C "C:\Users\dnbar\OneDrive\Dreamhouse\AI-Framework" push`. Stage nothing else in
the vault.

If a chat closes without doing this, the vault will report a stale status next time anyone
opens it there — flag that risk rather than silently skipping the step.
