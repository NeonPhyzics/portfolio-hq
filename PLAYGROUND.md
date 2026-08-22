# Playground

Parked ideas and existing-but-out-of-scope work. Nothing here gets built
before MVP.md's done_when ships and survives real use. Nothing here gets
deleted from the database either — see CLAUDE.md working rules.

- **Learning Threads view** — surface the LT-01–LT-05 records with their
  `done_when`/`build`/`backlog` structure. Data preserved in the DB,
  untouched; just not built into MVP UI.
- **Nudges/learning-task generation (agent-populated queue)**:
  (a) internal source — scheduled scan of session transcripts, propose
      learning tasks from observed patterns
  (b) external source — scheduled web check (e.g., Anthropic changelogs),
      propose "learn X" tasks on relevant releases
  Requires: HQ task-write API/auth, scheduled task infra (Claude Code/
  Cowork), proposal-approval flow (nothing auto-enters Band 3 without my
  sign-off)
  Trigger to activate: HQ MVP shipped + 30 days real use, AND Band 3 has
  spare R&D budget after career tool closes
- **Critical path / dependency features** — anything beyond the single
  frozen `blocked_by` column: multi-dependency graphs, critical-path
  calculation, dependency visualization, cascading logic.
- **Stage-gate view** — venture-level R&D vs. commercialized status with a
  gate-criteria checklist (commercial trigger / compliance review / delivery
  standard). Earliest consideration: post-MVP + 30 days of real use.
- **Venture/Active-Project card views** — the current Ventures and Active
  Projects tabs (venture summary cards, "next action" derivation). Being
  dropped from MVP nav in favor of Band/Domain views; the underlying
  `ventures`/`projects` tables aren't deleted, just unused by the UI.
- **Auth email redirect goes to Supabase instead of the app** — sign-up/
  magic-link emails redirect to a Supabase URL instead of back to the app.
  `src/lib/useAuth.js` already sets `emailRedirectTo` correctly to
  `window.location.origin + pathname`; the likely cause is Supabase's Auth
  "Redirect URLs" allowlist not including localhost/prod URLs, causing a
  silent fallback. Supabase is the right call here — data needs to be
  dynamic across devices — so this is a config fix, not an architecture
  change. Fix: add the app's URLs to Supabase Auth → URL Configuration →
  Redirect URLs.
