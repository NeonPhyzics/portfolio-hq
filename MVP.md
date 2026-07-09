# MVP punch list

Ordered smallest/most mechanical first. Nothing here starts until go-ahead.

1. **Schema migration**: add `band` (int, check 1-4), `domain` (text, check
   Business|Household), `venture` (text, nullable flat tag — display/filter
   only, no FK). Rename `priority` → `urgency` (same values: urgent/high/
   medium/low). Keep `venture_id`/`project_id`/`learning_thread_id`/
   `blocked_by` columns as-is, dormant — not dropped (see audit note on why).
2. **Backfill band/domain/venture** on the ~8 open venture/project-linked
   tasks, per the confirmed mapping (see audit). Learning-thread-linked
   tasks are left with `band`/`domain` null — that's what keeps them
   excluded from MVP views without moving/deleting anything.
3. **Create-task UI** — doesn't exist yet today; only edit exists. Minimal
   form: title, notes, band, domain, urgency, due date.
4. **Notes field editing** — extend the existing inline-edit pattern
   (already built for priority/due date) to notes and band/domain.
5. **Delete-task UI** — doesn't exist yet either.
6. **Band filter view.**
7. **Domain filter view.**
8. **"Monday review" view** — combined view, open Band 1 tasks first.
9. **Default sort everywhere**: band ascending, then urgency.
10. **Nav rework**: drop Today/Ventures/Active Projects/Skills tabs in favor
    of Band/Domain/Monday-review views (see audit — this removes UI for
    venture cards and Learning Threads/nudges, not just adds new views).
11. **PWA sanity check** — manifest/icons already built; confirm still
    correct after the nav rework, no new work expected.
12. **Deploy + verify.**
