-- Data changes per corrected task truth (2026-07-08): delete superseded
-- tasks, replace/retitle two, backfill the kept one, add three new ones.

-- The old "exactly one of venture_id/project_id/learning_thread_id" rule
-- belonged to the FK-structural model. Under the flat venture-tag model,
-- new/replaced tasks intentionally have none of those set, so the
-- constraint is now obsolete rather than a safety net.
alter table tasks drop constraint exactly_one_parent;

-- DELETE: decisions already made, no work remains.
delete from tasks where title = 'Merge projects, kill GPT+Make pipeline.';
delete from tasks where title = 'Create Exit Ready HR + Neon Dreamhouse projects, merge Faceless Video projects into one.';
delete from tasks where title = 'Consolidate into a single Claude Project.';
delete from tasks where title = 'Define once active builds stabilize.';

-- REPLACE: retitle + tag in place.
update tasks
set title = 'Ship final career-tool correction, deploy outputs at employer, close project',
    band = 3, domain = 'Business', venture = 'Neon Dreamhouse AI'
where title = 'Continue buildout (neondreamhouse.ai).';

-- REPLACE: "Continue build in Cowork" becomes two tasks. Retitle the
-- existing row to the first, insert the second alongside it.
update tasks
set title = 'Create Cowork project linked to Practice',
    band = 1, domain = 'Business', venture = 'Exit Ready HR'
where title = 'Continue build in Cowork.';

insert into tasks (user_id, title, urgency, band, domain, venture)
values (
  'b220092f-a87e-44b9-9374-45100a29a0e9',
  'Run first target-list job (PE portcos 12-24mo post-close)',
  'high', 1, 'Business', 'Exit Ready HR'
);

-- KEEP: backfill taxonomy only, title unchanged.
update tasks
set band = 2, domain = 'Business', venture = 'Barbee Dreamhouse'
where title = 'Finalize Wave profiles across Barbee Dreamhouse and Rental Properties.';

-- Housekeeping backfill on the one already-done task (harmless, keeps data
-- consistent; not part of the user's explicit list).
update tasks
set band = 3, domain = 'Business'
where title = 'Migrate data layer to Supabase, add tasks/Today view, PWA manifest.';

-- ADD: three new Band 1 Exit Ready HR tasks.
insert into tasks (user_id, title, urgency, band, domain, venture) values
  ('b220092f-a87e-44b9-9374-45100a29a0e9', 'Write offer sheet: exit-readiness assessment + AI working session, with prices', 'high', 1, 'Business', 'Exit Ready HR'),
  ('b220092f-a87e-44b9-9374-45100a29a0e9', 'Build announcement list: first 20 warm PE/deal contacts', 'high', 1, 'Business', 'Exit Ready HR'),
  ('b220092f-a87e-44b9-9374-45100a29a0e9', 'Draft announcement message template', 'high', 1, 'Business', 'Exit Ready HR');
