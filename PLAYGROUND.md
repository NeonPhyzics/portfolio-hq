# Playground

Parked ideas. Nothing here gets built without a deliberate rescope of
CLAUDE.md's done_when. Earliest consideration: after the quick view has had a
month of real use.

## Ideas for the quick view
- **Phone access** — would need a hosted copy of the vault data (sync or
  export), which brings back hosting/auth. Dropped on purpose 2026-09-28.
- **Inbox list/edit/delete in the UI** — deliberately out; triage stays in
  the vault session. Adding it is the first step back to a PM tool.
- **Links into the vault** — open a project's folder or `_project.md` from its
  card (browsers block `file://` from an http page; would need a server route
  that shells out to Explorer/Obsidian).
- **Latest `30-log/` entry or repo `docs/handoffs/` summary on each card.**

## Retired with the old app (2026-09-28)
The Supabase task app was replaced by the quick view. All of this code and its
data model live in git history (last commit: `1f278d0`); the Supabase project
is paused, not deleted.
- **Exit Ready HR CRM** (Companies/Contacts/Opportunities/Follow-ups) and the
  **venture calendar** — previously approved next builds; parked.
- **Band taxonomy (1–4), domain flag, urgency sort, Monday review view, and
  the Band 3 → Band 1 stage-gate rule** — task-system concepts; the vault uses
  tier/category instead.
- **Learning Threads view, nudges/learning-task generation, critical-path /
  dependency features, venture/project card views.**
- **Auth email redirect fix** and **local-first data layer** — moot now; no
  Supabase dependency.
