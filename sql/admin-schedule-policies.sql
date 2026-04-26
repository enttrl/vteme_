
alter table public.classes enable row level security;


drop policy if exists "Anyone can view classes" on public.classes;
create policy "Anyone can view classes"
on public.classes
for select
to anon, authenticated
using (true);


drop policy if exists "Admin can insert classes" on public.classes;
create policy "Admin can insert classes"
on public.classes
for insert
to authenticated
with check (
  (auth.jwt() ->> 'email') in ('mari.anisimova.05@inbox.ru')
);


drop policy if exists "Admin can update classes" on public.classes;
create policy "Admin can update classes"
on public.classes
for update
to authenticated
using (
  (auth.jwt() ->> 'email') in ('mari.anisimova.05@inbox.ru')
)
with check (
  (auth.jwt() ->> 'email') in ('mari.anisimova.05@inbox.ru')
);


drop policy if exists "Admin can delete classes" on public.classes;
create policy "Admin can delete classes"
on public.classes
for delete
to authenticated
using (
  (auth.jwt() ->> 'email') in ('mari.anisimova.05@inbox.ru')
);
