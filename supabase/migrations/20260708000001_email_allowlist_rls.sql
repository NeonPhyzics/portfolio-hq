-- Switch RLS from exact user_id match to an email allowlist, so either
-- account (neonphyzics@gmail.com, dnbarbee@gmail.com) can read/write
-- all rows regardless of which one originally created them.

create or replace function is_allowed_user()
returns boolean as $$
  select (auth.jwt() ->> 'email') = any (array['neonphyzics@gmail.com', 'dnbarbee@gmail.com']);
$$ language sql stable;

do $$
declare
  t text;
begin
  foreach t in array array['ventures', 'projects', 'learning_threads', 'tasks', 'nudges']
  loop
    execute format('drop policy if exists "select own" on %I', t);
    execute format('drop policy if exists "insert own" on %I', t);
    execute format('drop policy if exists "update own" on %I', t);
    execute format('drop policy if exists "delete own" on %I', t);

    execute format('create policy "select allowed" on %I for select using (is_allowed_user())', t);
    execute format('create policy "insert allowed" on %I for insert with check (is_allowed_user())', t);
    execute format('create policy "update allowed" on %I for update using (is_allowed_user()) with check (is_allowed_user())', t);
    execute format('create policy "delete allowed" on %I for delete using (is_allowed_user())', t);
  end loop;
end $$;
