-- Portfolio HQ initial schema
-- Single-user read/write task & learning management tool.
-- Every table is user-scoped via RLS keyed on auth.uid() = user_id.

create table ventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  slug text not null,
  name text not null,
  status text not null,
  summary text,
  focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  venture_id uuid references ventures(id) on delete set null,
  name text not null,
  status text not null,
  blocker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table learning_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  code text not null,
  title text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  since date not null default current_date,
  linked_label text,
  venture_id uuid references ventures(id) on delete set null,
  build text,
  done_when text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, code)
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  title text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'blocked', 'done')),
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  due_date date,
  notes text,
  venture_id uuid references ventures(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  learning_thread_id uuid references learning_threads(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint exactly_one_parent check (
    (venture_id is not null)::int + (project_id is not null)::int + (learning_thread_id is not null)::int = 1
  )
);

create table nudges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  tag text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create index tasks_venture_idx on tasks (venture_id);
create index tasks_project_idx on tasks (project_id);
create index tasks_learning_thread_idx on tasks (learning_thread_id);
create index tasks_status_priority_idx on tasks (user_id, status, priority);
create index projects_venture_idx on projects (venture_id);
create index learning_threads_venture_idx on learning_threads (venture_id);

-- Row Level Security: every table scoped to auth.uid() = user_id.
-- An unauthenticated (anon) request gets zero rows back, not an error.

alter table ventures enable row level security;
alter table projects enable row level security;
alter table learning_threads enable row level security;
alter table tasks enable row level security;
alter table nudges enable row level security;

create policy "select own" on ventures for select using (auth.uid() = user_id);
create policy "insert own" on ventures for insert with check (auth.uid() = user_id);
create policy "update own" on ventures for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on ventures for delete using (auth.uid() = user_id);

create policy "select own" on projects for select using (auth.uid() = user_id);
create policy "insert own" on projects for insert with check (auth.uid() = user_id);
create policy "update own" on projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on projects for delete using (auth.uid() = user_id);

create policy "select own" on learning_threads for select using (auth.uid() = user_id);
create policy "insert own" on learning_threads for insert with check (auth.uid() = user_id);
create policy "update own" on learning_threads for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on learning_threads for delete using (auth.uid() = user_id);

create policy "select own" on tasks for select using (auth.uid() = user_id);
create policy "insert own" on tasks for insert with check (auth.uid() = user_id);
create policy "update own" on tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on tasks for delete using (auth.uid() = user_id);

create policy "select own" on nudges for select using (auth.uid() = user_id);
create policy "insert own" on nudges for insert with check (auth.uid() = user_id);
create policy "update own" on nudges for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on nudges for delete using (auth.uid() = user_id);

-- Keep updated_at current on every row update.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ventures_set_updated_at before update on ventures
  for each row execute function set_updated_at();
create trigger projects_set_updated_at before update on projects
  for each row execute function set_updated_at();
create trigger learning_threads_set_updated_at before update on learning_threads
  for each row execute function set_updated_at();
create trigger tasks_set_updated_at before update on tasks
  for each row execute function set_updated_at();
