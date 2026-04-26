-- Если на странице не отображается количество мест 8/12, добавь эту политику.
-- Она позволяет сайту читать class_id записей, чтобы считать занятые места.

create policy "Anyone can view booking class ids for counts"
on public.class_bookings
for select
to anon, authenticated
using (true);
