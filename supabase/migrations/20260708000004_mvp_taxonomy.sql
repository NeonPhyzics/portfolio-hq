-- MVP restructure: band + domain taxonomy, flat venture tag, urgency rename.
-- venture_id/project_id/learning_thread_id/blocked_by stay dormant (not
-- dropped) — learning_thread_id rows are excluded from MVP views simply by
-- having band/domain left null, which also keeps the one existing blocked_by
-- cross-reference intact rather than splitting tables.

alter table tasks add column band int check (band between 1 and 4);
alter table tasks add column domain text check (domain in ('Business', 'Household'));
alter table tasks add column venture text;

alter table tasks rename column priority to urgency;

create index tasks_band_idx on tasks (band);
create index tasks_domain_idx on tasks (domain);
