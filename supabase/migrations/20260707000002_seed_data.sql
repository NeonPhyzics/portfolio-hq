-- One-time seed migrating data.json content into the new schema.
-- user_id is set explicitly (not via auth.uid() default) since this runs
-- outside an authenticated session.

do $$
declare
  uid uuid := 'b220092f-a87e-44b9-9374-45100a29a0e9';
begin

-- Ventures
insert into ventures (user_id, slug, name, status, summary, focus) values
  (uid, 'exit-ready-hr', 'Exit Ready HR', 'Active', 'Fractional HR consulting for PE-backed and founder-led exits.', 'CRM build (Cowork), LinkedIn content engine.'),
  (uid, 'barbee-dreamhouse', 'Barbee Dreamhouse', 'Active', 'Luxury resale LLC.', 'Wave accounting setup.'),
  (uid, 'rental-properties', 'Rental Properties', 'Active', 'Kipling, Marquette, Melody Oaks.', 'Wave setup.'),
  (uid, 'faceless-video', 'Faceless Video', 'Active', 'TikTok/YT Shorts: true crime, Greek mythology, lucid dream, cosmic horror.', 'Consolidate to one Claude Project.'),
  (uid, 'neon-dreamhouse-ai', 'Neon Dreamhouse AI', 'Building', 'Software products (neondreamhouse.ai).', 'Career pathing tool (Lovable/Claude Code), Quix behavioral assessment app.');

-- Projects
insert into projects (user_id, venture_id, name, status, blocker) values
  (uid, null, 'Portfolio HQ build', 'In progress', null),
  (uid, (select id from ventures where user_id = uid and slug = 'exit-ready-hr'), 'CRM build', 'In progress', null),
  (uid, (select id from ventures where user_id = uid and slug = 'neon-dreamhouse-ai'), 'Quix migration + compliance review', 'In progress', 'Scope currently owned by DeepSeek, needs migrating.'),
  (uid, (select id from ventures where user_id = uid and slug = 'neon-dreamhouse-ai'), 'Neon Dreamhouse website', 'In progress', null),
  (uid, (select id from ventures where user_id = uid and slug = 'barbee-dreamhouse'), 'Wave accounting setup', 'In progress', null),
  (uid, null, 'Claude Project restructure', 'In progress', null),
  (uid, null, 'Cross-venture data/privacy standard', 'Deferred', 'Lower priority than active builds.');

-- Learning threads
insert into learning_threads (user_id, code, title, status, since, linked_label, venture_id, build, done_when, note) values
  (uid, 'LT-01', 'Custom Claude Skills', 'open', '2026-07-06', 'Exit Ready HR',
    (select id from ventures where user_id = uid and slug = 'exit-ready-hr'),
    'Exit Ready HR deliverable skill — packages frameworks, tone, and document standards for consistent client deliverables',
    'Skill produces a client-ready deliverable draft in one pass without manual tone/format correction', null),
  (uid, 'LT-02', 'Claude Settings & Configuration', 'open', '2026-07-06', 'All Claude Projects', null,
    'Fully configured 3-Project stack (Exit Ready HR, Neon Dreamhouse AI, Faceless Video)',
    'All 3 Projects have instructions + knowledge files, a LinkedIn voice style exists, and memory edits reviewed once — then CLOSE this thread', null),
  (uid, 'LT-03', 'Git & GitHub Fundamentals', 'open', '2026-07-07', 'Portfolio HQ / Neon Dreamhouse AI',
    (select id from ventures where user_id = uid and slug = 'neon-dreamhouse-ai'),
    'Manual version control of Portfolio HQ data updates',
    '10 manual commit/push cycles completed and one branch merged without help', null),
  (uid, 'LT-04', 'Code Review (Architect Skill)', 'open', '2026-07-07', 'Neon Dreamhouse AI',
    (select id from ventures where user_id = uid and slug = 'neon-dreamhouse-ai'),
    'Working fluency in reading and challenging AI-generated code',
    'You can review a Quix or career-tool PR and identify one real issue or improvement unprompted, 3 sessions in a row', null),
  (uid, 'LT-05', 'Prompt & Context Engineering', 'open', '2026-07-07', 'All Claude Projects', null,
    'Self-authored knowledge files for all 3 Projects',
    'All 3 Project knowledge files self-authored, critiqued, and revised; you can articulate why each element is included', null);

-- Tasks derived from venture "next" fields (skip Rental Properties: "None open")
insert into tasks (user_id, title, priority, venture_id) values
  (uid, 'Consolidate into a single Claude Project.', 'high', (select id from ventures where user_id = uid and slug = 'exit-ready-hr')),
  (uid, 'Finalize Wave profiles.', 'high', (select id from ventures where user_id = uid and slug = 'barbee-dreamhouse')),
  (uid, 'Merge projects, kill GPT+Make pipeline.', 'high', (select id from ventures where user_id = uid and slug = 'faceless-video')),
  (uid, 'Migrate Quix scope from DeepSeek.', 'high', (select id from ventures where user_id = uid and slug = 'neon-dreamhouse-ai'));

-- Tasks derived from project "next" fields
insert into tasks (user_id, title, priority, project_id) values
  (uid, 'Migrate data layer to Supabase, add tasks/Today view, PWA manifest.', 'high', (select id from projects where user_id = uid and name = 'Portfolio HQ build')),
  (uid, 'Continue build in Cowork.', 'high', (select id from projects where user_id = uid and name = 'CRM build')),
  (uid, 'Migrate Quix scope from DeepSeek and run compliance review.', 'high', (select id from projects where user_id = uid and name = 'Quix migration + compliance review')),
  (uid, 'Continue buildout (neondreamhouse.ai).', 'medium', (select id from projects where user_id = uid and name = 'Neon Dreamhouse website')),
  (uid, 'Finalize Wave profiles across Barbee Dreamhouse and Rental Properties.', 'high', (select id from projects where user_id = uid and name = 'Wave accounting setup')),
  (uid, 'Create Exit Ready HR + Neon Dreamhouse projects, merge Faceless Video projects into one.', 'medium', (select id from projects where user_id = uid and name = 'Claude Project restructure')),
  (uid, 'Define once active builds stabilize.', 'low', (select id from projects where user_id = uid and name = 'Cross-venture data/privacy standard'));

-- Tasks derived from LT-01 next_action + backlog
insert into tasks (user_id, title, priority, learning_thread_id) values
  (uid, 'In a Claude Code session, ask for the skill-creator guide and scaffold the skill folder (SKILL.md + templates)', 'high',
    (select id from learning_threads where user_id = uid and code = 'LT-01')),
  (uid, 'Transaction-categorization skill for Wave bookkeeping across all entities', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-01'));

-- LT-02
insert into tasks (user_id, title, priority, learning_thread_id) values
  (uid, 'Write project instructions for Exit Ready HR Project', 'high',
    (select id from learning_threads where user_id = uid and code = 'LT-02')),
  (uid, 'Write instructions for Neon Dreamhouse AI Project', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-02')),
  (uid, 'Write instructions for consolidated Faceless Video Project', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-02')),
  (uid, 'Create LinkedIn voice style', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-02')),
  (uid, 'Quarterly memory-edit prune (recurring)', 'low',
    (select id from learning_threads where user_id = uid and code = 'LT-02'));

-- LT-03
insert into tasks (user_id, title, priority, learning_thread_id) values
  (uid, 'Make the next data.json update via command line yourself: edit, git add, git commit -m, git push — no Claude Code assist', 'high',
    (select id from learning_threads where user_id = uid and code = 'LT-03')),
  (uid, 'Create a branch, make a change, merge it', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-03')),
  (uid, 'Intentionally break something, then git revert', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-03'));

-- LT-04
insert into tasks (user_id, title, priority, learning_thread_id) values
  (uid, 'In the Portfolio HQ session, have Claude walk through one file and explain its architecture choices; challenge at least one decision', 'high',
    (select id from learning_threads where user_id = uid and code = 'LT-04')),
  (uid, 'Repeat walkthrough ritual each Claude Code build session (one file per session)', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-04'));

-- LT-05
insert into tasks (user_id, title, priority, learning_thread_id) values
  (uid, 'Draft the Exit Ready HR knowledge file yourself, then have Claude critique it — compare its rewrite to yours', 'high',
    (select id from learning_threads where user_id = uid and code = 'LT-05')),
  (uid, 'Neon Dreamhouse AI knowledge file', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-05')),
  (uid, 'Faceless Video knowledge file', 'medium',
    (select id from learning_threads where user_id = uid and code = 'LT-05'));

-- Nudges
insert into nudges (user_id, tag, text) values
  (uid, 'Cowork', 'Your Cowork folder is live alongside Code on this same project. Since automated marks-done only happen via file writes (not conversation), get in the habit of confirming in whichever tool you used that day that the state actually got updated — don''t assume a Cowork chat reply means the file changed.'),
  (uid, 'Habit', 'Marking an item "done" only happens when you tell Claude directly — nothing closes itself automatically. Make it a two-second habit: after you review this dashboard, say what you actioned.'),
  (uid, 'Migration', 'For Faceless Video''s move off GPT+Make: treat it as its own project — have Claude help extract your existing prompts/workflow first, then rebuild them as a single Claude Project''s custom instructions, rather than starting over in freeform chat.');

end $$;
