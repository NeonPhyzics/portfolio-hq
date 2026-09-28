# Punch list â€” quick view rescope (2026-09-28)

Contract is CLAUDE.md done_when. Built on branch `quick-view`.

1. [x] Rescope agreed: vault-only data, desktop only, replace old app on a branch.
2. [x] `hq/` â€” vault reader, local server, single-page render.
3. [x] Project cards: stage, next action (clamped, expandable), blockers,
       open questions, overdue/stale flags, overdue-first sort.
4. [x] Note box per card + general box â†’ `00-inbox/` capture file; inbox count.
5. [x] Remove React/Vite/Supabase/PWA/Pages code; rewrite CLAUDE.md,
       MVP.md, PLAYGROUND.md, AGENTS.md, README.md.
6. [ ] David uses it for real, then merge `quick-view` â†’ main.

## Loose ends outside this repo (David's call, not code)
- GitHub Pages still serves the last deployed build of the old app until Pages
  is turned off in the repo's Settings â†’ Pages.
- Supabase project is paused, not deleted. Schema and seed data live in git
  history (last commit with them: `1f278d0`).
- The vault's own `.claude/CLAUDE.md` "Build dashboard (Portfolio HQ)" job still
  describes a `_build/` dashboard with Supabase â€” update it from a vault session.
