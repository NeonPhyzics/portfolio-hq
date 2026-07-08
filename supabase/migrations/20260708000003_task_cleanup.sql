-- Clean up seed-data artifacts from the original data.json migration:
-- duplicate venture/project tasks, a uniformly-'high' priority default,
-- one task that's now actually done, and the first real dependency.

-- Duplicates: venture-level tasks that just repeated a more specific
-- project-level task. Keep the project-level one, drop the venture one.
delete from tasks
where title = 'Finalize Wave profiles.'
  and venture_id = (select id from ventures where slug = 'barbee-dreamhouse');

delete from tasks
where title = 'Migrate Quix scope from DeepSeek.'
  and venture_id = (select id from ventures where slug = 'neon-dreamhouse-ai');

-- Already done: this migration itself is complete.
update tasks
set status = 'done', completed_at = now()
where title = 'Migrate data layer to Supabase, add tasks/Today view, PWA manifest.';

-- First real dependency: Exit Ready HR's Claude Project consolidation
-- is blocked on writing that Project's instructions first.
update tasks
set blocked_by = (select id from tasks where title = 'Write project instructions for Exit Ready HR Project')
where title = 'Consolidate into a single Claude Project.';

-- Priority re-triage. Everything was seeded 'high' by default; this
-- reflects an actual first pass, not the last word — several of these
-- (Faceless Video urgency, Quix urgency) are flagged separately for
-- Dustin to confirm since they depend on business context this
-- migration doesn't have.
update tasks set priority = 'low' where title = 'Finalize Wave profiles across Barbee Dreamhouse and Rental Properties.';
update tasks set priority = 'medium' where title = 'Continue build in Cowork.';
update tasks set priority = 'medium' where title = 'Continue buildout (neondreamhouse.ai).';
update tasks set priority = 'medium' where title = 'Create Exit Ready HR + Neon Dreamhouse projects, merge Faceless Video projects into one.';
update tasks set priority = 'low' where title = 'Define once active builds stabilize.';
update tasks set priority = 'medium' where title = 'In a Claude Code session, ask for the skill-creator guide and scaffold the skill folder (SKILL.md + templates)';
update tasks set priority = 'medium' where title = 'Write instructions for Neon Dreamhouse AI Project';
update tasks set priority = 'medium' where title = 'Write instructions for consolidated Faceless Video Project';
update tasks set priority = 'medium' where title = 'Create LinkedIn voice style';
update tasks set priority = 'low' where title = 'Quarterly memory-edit prune (recurring)';
update tasks set priority = 'medium' where title = 'Create a branch, make a change, merge it';
update tasks set priority = 'low' where title = 'Intentionally break something, then git revert';
update tasks set priority = 'medium' where title = 'Repeat walkthrough ritual each Claude Code build session (one file per session)';
update tasks set priority = 'medium' where title = 'Neon Dreamhouse AI knowledge file';
update tasks set priority = 'medium' where title = 'Faceless Video knowledge file';
