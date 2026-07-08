-- Single-blocker task dependency. Deliberately not a many-to-many
-- graph: personal task chains are almost always "do X before Y",
-- not a full DAG, so this keeps the model and UI simple.

alter table tasks add column blocked_by uuid references tasks(id) on delete set null;
create index tasks_blocked_by_idx on tasks (blocked_by);

-- A task can't block itself.
alter table tasks add constraint no_self_block check (blocked_by is distinct from id);
