# Migrations

`../schema.sql` is the full, first-time schema.

For every change after you have real data, do NOT edit `schema.sql` and re-run it. Instead:

1. Add a new numbered file here, e.g. `002_add_task_images.sql`, containing only the change
   (`alter table ...`, `create index ...`).
2. Run that file in the Supabase SQL Editor (staging first, then production).
3. Mirror the change into `schema.sql` so new projects start up to date.

Keep each migration small and safe to run once.
