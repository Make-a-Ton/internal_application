-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================
-- ENUM TYPES
-- =========================
create type track_enum as enum (
  'software',
  'hardware',
  'kireap'
);

create type food_enum as enum (
  'veg',
  'non-veg',
  'ramadan'
);

-- =============================================
-- 1. PROFILES (Linked to Supabase Auth - optional for now if using PINs)
-- =============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('admin', 'judge', 'participant')),
  display_name text,
  team_id uuid, -- For participants
  created_at timestamptz default now()
);

-- =============================================
-- 2. TEAM
-- =============================================
create table public.team (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  college text not null,
  track track_enum not null,
  problem_stat text,

  -- Random 4-digit password (1000–9999)
  password integer not null
    default (floor(random() * 9000 + 1000)::int),

  created_at timestamp default now(),

  -- Enforce 4-digit range
  constraint password_4_digit_check
    check (password between 1000 and 9999)
);

-- =============================================
-- 3. MEMBER
-- =============================================
create table public.member (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null
    references public.team(id)
    on delete cascade,

  name text not null,
  food food_enum not null,
  checkin boolean default false,

  created_at timestamp default now()
);

-- =============================================
-- 4. CHECKPOINTS
-- =============================================
create table checkpoints (
  id serial primary key,
  number int not null,
  title text not null,
  description text not null,
  is_locked boolean default true,
  released_at timestamptz,
  created_at timestamptz default now()
);

-- =============================================
-- 5. CHECKPOINT TASKS (Submissions)
-- =============================================
create table checkpoint_tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references team(id) on delete cascade not null,
  checkpoint_id int references checkpoints(id) on delete cascade not null,
  text text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- 6. HELP REQUESTS
-- =============================================
create table help_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references team(id) on delete cascade not null,
  category text not null,
  urgency text check (urgency in ('critical', 'normal')),
  message text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in-progress', 'done')),
  mentor_id uuid references public.mentor(id),
  created_at timestamptz default now()
);

-- =============================================
-- 7. NOTIFICATIONS
-- =============================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  url text,
  priority text default 'normal' check (priority in ('high', 'normal')),
  created_at timestamptz default now()
);

-- =============================================
-- 8. JUDGES
-- =============================================
create table judges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null unique, -- Secure PIN for login
  created_at timestamptz default now()
);

-- =============================================
-- 9. JUDGE ASSIGNMENTS
-- =============================================
create table judge_assignments (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid references judges(id) on delete cascade not null,
  team_id uuid references team(id) on delete cascade not null,
  unique(judge_id, team_id)
);

-- =============================================
-- 10. TEAM SCORES
-- =============================================
create table team_scores (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid references judges(id) on delete cascade not null,
  team_id uuid references team(id) on delete cascade not null,
  innovation int check (innovation between 0 and 10),
  technical_complexity int check (technical_complexity between 0 and 10),
  feasibility int check (feasibility between 0 and 10),
  market_viability int check (market_viability between 0 and 10),
  pitching int check (pitching between 0 and 10),
  completion int check (completion between 0 and 10),
  total int not null,
  created_at timestamptz default now(),
  unique(judge_id, team_id)
);

-- =============================================
-- 11. GALLERY IMAGES
-- =============================================
create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  uploaded_by_team_id uuid references team(id) on delete set null,
  alt_text text,
  created_at timestamptz default now()
);

-- =============================================
-- 12. MENTORS
-- =============================================
create table public.mentor (
  id uuid primary key default gen_random_uuid(),
  name text,
  domain text,
  created_at timestamptz default now()
);

-- =============================================
-- 13. ORDER ITEMS (Store)
-- =============================================
create table order_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prices text not null,
  image text,
  stock int default 0
);

-- =============================================
-- 13. ORDERS
-- =============================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references team(id) on delete cascade not null,
  item_ids uuid[] not null, -- Array of item IDs
  status text default 'pending' check (status in ('pending', 'in-progress', 'delivered')),
  created_at timestamptz default now()
);

-- =============================================
-- 14. FOOD COUPONS (Optional, tracking per member)
-- =============================================
create table food_coupons (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references member(id) on delete cascade not null,
  meal_type text not null, -- 'breakfast', 'lunch', etc.
  redeemed boolean default false,
  created_at timestamptz default now(),
  unique(member_id, meal_type)
);

-- =============================================
-- SECURITY & RLS POLICIES
-- =============================================
alter table profiles enable row level security;
alter table team enable row level security;
alter table member enable row level security;
alter table checkpoints enable row level security;
alter table checkpoint_tasks enable row level security;
alter table help_requests enable row level security;
alter table notifications enable row level security;
alter table judges enable row level security;
alter table judge_assignments enable row level security;
alter table team_scores enable row level security;
alter table gallery_images enable row level security;
alter table order_items enable row level security;
alter table orders enable row level security;
alter table food_coupons enable row level security;
alter table mentor enable row level security;

-- PUBLIC READ ACCESS (Simplest for Hackathon context)
create policy "Public Read Teams" on team for select using (true);
create policy "Public Read Members" on member for select using (true);
create policy "Public Read Checkpoints" on checkpoints for select using (true);
create policy "Public Read Tasks" on checkpoint_tasks for select using (true);
create policy "Public Read Items" on order_items for select using (true);
create policy "Public Read Notifications" on notifications for select using (true);
create policy "Public Read Gallery" on gallery_images for select using (true);
create policy "Public Read Mentors" on mentor for select using (true);

-- SECURE PIN CHECK FUNCTION
create or replace function verify_pin(pin_input text)
returns json as $$
declare
  judge_record record;
begin
  if pin_input = '0000' then
    return json_build_object('role', 'admin');
  end if;

  select * into judge_record from judges where pin = pin_input;
  if found then
    return json_build_object('role', 'judge', 'id', judge_record.id, 'name', judge_record.name);
  end if;

  return json_build_object('error', 'Invalid PIN');
end;
$$ language plpgsql security definer;

-- =============================================
-- SEED DATA (For Testing)
-- =============================================

-- Checkpoints
insert into checkpoints (number, title, description, is_locked, released_at) values
(1, 'Ideation', 'Complete the required tasks and document your progress.', false, now()),
(2, 'Prototyping', 'Build your MVP.', true, null),
(3, 'Final Pitch', 'Prepare for presentation.', true, null);

-- Judges
insert into judges (name, pin) values
('Judge 1', '1001'),
('Judge 2', '1002'),
('Judge 3', '1003');

-- Teams (password auto-generated by default constraint)
insert into team (name, college, track, problem_stat) values
('Team Rygtus', 'GEC Thrissur', 'software', 'AI-powered study assistant'),
('Team Alpha', 'CET Trivandrum', 'software', null),
('Team Nexus', 'NIT Calicut', 'software', null),
('Team Vortex', 'CUSAT Kochi', 'hardware', null),
('Team Blaze', 'MEC Thrissur', 'hardware', 'Smart irrigation system'),
('Team Zenith', 'FISAT Angamaly', 'software', null),
('Team Cipher', 'MBCET Trivandrum', 'kireap', null),
('Team Orbit', 'SCMS Kochi', 'software', 'Real-time collab whiteboard'),
('Team Flux', 'TKM Kollam', 'kireap', null),
('Team Spark', 'RIT Kottayam', 'hardware', null);

-- Members (sample members for first few teams)
insert into member (team_id, name, food) values
((select id from team where name = 'Team Rygtus'), 'Keerthana D S', 'veg'),
((select id from team where name = 'Team Rygtus'), 'Afnash Ali P', 'non-veg'),
((select id from team where name = 'Team Rygtus'), 'Sajed Hussain', 'non-veg'),
((select id from team where name = 'Team Rygtus'), 'Ruvais P', 'veg'),
((select id from team where name = 'Team Alpha'), 'Alice Thomas', 'veg'),
((select id from team where name = 'Team Alpha'), 'Bob Kurien', 'non-veg'),
((select id from team where name = 'Team Alpha'), 'Clara Jose', 'ramadan'),
((select id from team where name = 'Team Nexus'), 'Dev Nair', 'veg'),
((select id from team where name = 'Team Nexus'), 'Eva Menon', 'non-veg'),
((select id from team where name = 'Team Vortex'), 'Faisal K', 'ramadan'),
((select id from team where name = 'Team Vortex'), 'Geetha S', 'veg');
