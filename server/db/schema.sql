-- ExTask database schema (PostgreSQL on Supabase)
-- Paste this whole file into: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run on a fresh project. To start over, run the RESET block first.
--
-- RESET (uncomment to wipe ExTask tables; this deletes all data!):
-- drop table if exists reviews, bids, tasks, profiles cascade;
-- drop function if exists select_bid(uuid, uuid, uuid);
-- drop function if exists refresh_rating();

-- ============================================================
-- Tables
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text not null unique,
  email text unique,
  phone text unique,
  auth_email text not null unique,      -- the email Supabase Auth uses (real or generated)
  bio text,
  location text,
  id_verified boolean not null default false,
  id_details text,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text,
  budget numeric(10,2) not null check (budget > 0),
  location text,
  deadline date,
  status text not null default 'open'
    check (status in ('open','assigned','completed','cancelled')),
  selected_bid_id uuid,                 -- foreign key added below (tasks and bids reference each other)
  created_at timestamptz not null default now()
);

create table if not exists bids (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  bidder_id uuid not null references profiles(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  message text,
  availability text,
  status text not null default 'pending'
    check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  unique (task_id, bidder_id)           -- one bid per user per task
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'tasks_selected_bid_fk') then
    alter table tasks
      add constraint tasks_selected_bid_fk
      foreign key (selected_bid_id) references bids(id) on delete set null;
  end if;
end $$;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewee_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (task_id, reviewer_id)         -- one review per person per task
);

-- ============================================================
-- Indexes (speed up the common lookups)
-- ============================================================
create index if not exists tasks_status_created_idx on tasks (status, created_at desc);
create index if not exists tasks_poster_idx        on tasks (poster_id);
create index if not exists bids_task_idx           on bids (task_id);
create index if not exists bids_bidder_idx         on bids (bidder_id);
create index if not exists reviews_reviewee_idx    on reviews (reviewee_id);

-- ============================================================
-- Row level security
-- ============================================================
-- Only the Express server (service role key) touches the data. With RLS on and no policies,
-- nobody can read or write these tables from a browser using the public (anon) key.
alter table profiles enable row level security;
alter table tasks    enable row level security;
alter table bids     enable row level security;
alter table reviews  enable row level security;

revoke all on profiles, tasks, bids, reviews from anon, authenticated;

-- ============================================================
-- select_bid(): hire one bidder atomically
-- ============================================================
-- In ONE transaction: task -> assigned, chosen bid -> accepted, every other bid -> rejected.
-- Either all three changes happen or none do. Custom error codes are mapped to HTTP
-- statuses in server/controllers/taskController.js (EX403 / EX404 / EX409).
create or replace function select_bid(p_task_id uuid, p_bid_id uuid, p_poster_id uuid)
returns tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task tasks;
begin
  select * into v_task from tasks where id = p_task_id for update;   -- lock the row
  if not found then
    raise exception 'Task not found' using errcode = 'EX404';
  end if;
  if v_task.poster_id <> p_poster_id then
    raise exception 'Only the poster can select a bidder' using errcode = 'EX403';
  end if;
  if v_task.status <> 'open' then
    raise exception 'This task is no longer open' using errcode = 'EX409';
  end if;
  if not exists (select 1 from bids where id = p_bid_id and task_id = p_task_id) then
    raise exception 'Bid not found on this task' using errcode = 'EX404';
  end if;

  update bids
     set status = case when id = p_bid_id then 'accepted' else 'rejected' end
   where task_id = p_task_id;

  update tasks
     set status = 'assigned', selected_bid_id = p_bid_id
   where id = p_task_id
   returning * into v_task;

  return v_task;
end;
$$;

revoke all on function select_bid(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function select_bid(uuid, uuid, uuid) to service_role;

-- ============================================================
-- Rating trigger: keep profiles.rating_avg / rating_count current
-- ============================================================
create or replace function refresh_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles
     set rating_avg   = coalesce((select round(avg(rating)::numeric, 2) from reviews where reviewee_id = new.reviewee_id), 0),
         rating_count = (select count(*) from reviews where reviewee_id = new.reviewee_id)
   where id = new.reviewee_id;
  return new;
end;
$$;

drop trigger if exists trg_reviews_refresh_rating on reviews;
create trigger trg_reviews_refresh_rating
  after insert on reviews
  for each row execute function refresh_rating();
