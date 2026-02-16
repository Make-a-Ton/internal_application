-- Enable UUID extension
create extension if not exists "pgcrypto";

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
-- 2. TEAMS
-- =============================================
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  college text default 'Unknown',
  category text default 'GENERAL',
  project_status text default 'pending' check (project_status in ('submitted', 'pending', 'in-progress')),
  created_at timestamptz default now()
);

-- =============================================
-- 3. TEAM MEMBERS
-- =============================================
create table team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  name text not null,
  role text default 'Hacker',
  is_checked_in boolean default false,
  food_pref text default 'N/A', -- e.g. "Veg", "Non-Veg"
  created_at timestamptz default now()
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
  team_id uuid references teams(id) on delete cascade not null,
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
  team_id uuid references teams(id) on delete cascade not null,
  category text not null,
  urgency text check (urgency in ('critical', 'normal')),
  message text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in-progress', 'done')),
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
  team_id uuid references teams(id) on delete cascade not null,
  unique(judge_id, team_id)
);

-- =============================================
-- 10. TEAM SCORES
-- =============================================
create table team_scores (
  id uuid primary key default gen_random_uuid(),
  judge_id uuid references judges(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade not null,
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
  uploaded_by_team_id uuid references teams(id) on delete set null,
  alt_text text,
  created_at timestamptz default now()
);

-- =============================================
-- 12. ORDER ITEMS (Store)
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
  team_id uuid references teams(id) on delete cascade not null,
  item_ids uuid[] not null, -- Array of item IDs
  status text default 'pending' check (status in ('pending', 'in-progress', 'delivered')),
  created_at timestamptz default now()
);

-- =============================================
-- 14. FOOD COUPONS (Optional, tracking per member)
-- =============================================
create table food_coupons (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references team_members(id) on delete cascade not null,
  meal_type text not null, -- 'breakfast', 'lunch', etc.
  redeemed boolean default false,
  created_at timestamptz default now(),
  unique(member_id, meal_type)
);

-- =============================================
-- SECURITY & RLS POLICIES
-- =============================================
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
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

-- PUBLIC READ ACCESS (Simplest for Hackathon context)
-- In a real app, strict policies would be better. Here we allow reading most data.
create policy "Public Read Teams" on teams for select using (true);
create policy "Public Read Members" on team_members for select using (true);
create policy "Public Read Checkpoints" on checkpoints for select using (true);
create policy "Public Read Tasks" on checkpoint_tasks for select using (true);
create policy "Public Read Items" on order_items for select using (true);
create policy "Public Read Notifications" on notifications for select using (true);
create policy "Public Read Gallery" on gallery_images for select using (true);

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

-- SEED DATA (For Testing)
insert into checkpoints (number, title, description, is_locked, released_at) values
(1, 'Ideation', 'Complete the required tasks and document your progress.', false, now()),
(2, 'Prototyping', 'Build your MVP.', true, null),
(3, 'Final Pitch', 'Prepare for presentation.', true, null);

insert into judges (name, pin) values
('Judge 1', '1001'),
('Judge 2', '1002'),
('Judge 3', '1003');

insert into teams (name, code, college, category, project_status) values
('Team Rygtus', 'TR01', 'GEC Thrissur', 'GENERAL', 'submitted'),
('Team Alpha', 'TA02', 'CET Trivandrum', 'GENERAL', 'in-progress'),
('Team Nexus', 'TN03', 'NIT Calicut', 'AI/ML', 'pending'),
('Team Vortex', 'TV04', 'CUSAT Kochi', 'GENERAL', 'in-progress'),
('Team Blaze', 'TB05', 'MEC Thrissur', 'IoT', 'submitted'),
('Team Zenith', 'TZ06', 'FISAT Angamaly', 'GENERAL', 'pending'),
('Team Cipher', 'TC07', 'MBCET Trivandrum', 'CYBERSECURITY', 'in-progress'),
('Team Orbit', 'TO08', 'SCMS Kochi', 'AI/ML', 'submitted'),
('Team Flux', 'TF09', 'TKM Kollam', 'GENERAL', 'pending'),
('Team Spark', 'TS10', 'RIT Kottayam', 'IoT', 'in-progress');
