# Playground

Parked ideas and existing-but-out-of-scope work. Nothing here gets built
before MVP.md's done_when ships and survives real use. Nothing here gets
deleted from the database either — see CLAUDE.md working rules.

- **Learning Threads view** — surface the LT-01–LT-05 records with their
  `done_when`/`build`/`backlog` structure. Data preserved in the DB,
  untouched; just not built into MVP UI.
- **Nudges / proposed-actions queue** — an agent-populated suggestion feed
  (the "Today's 1% Better" nudges + housekeeping proposals). Data preserved;
  not surfaced in MVP.
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
- **Automatic learning-task generation** — a scheduled task that scans usage
  patterns or external sources (e.g. Anthropic changelog) and proposes new
  learning tasks. Discussed, not built, not in scope for MVP.
