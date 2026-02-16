-- =============================================
-- MIGRATION: Add college column (run this first if table already exists)
-- =============================================
ALTER TABLE teams ADD COLUMN IF NOT EXISTS college text DEFAULT 'Unknown';

-- =============================================
-- CLEAR EXISTING DATA (for re-seeding)
-- =============================================
DELETE FROM team_members;
DELETE FROM teams;

-- =============================================
-- SEED: 10 Teams with College Names
-- =============================================
INSERT INTO teams (name, code, college, category, project_status) VALUES
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

-- =============================================
-- SEED: Team Members (3-4 per team)
-- =============================================

-- Team Rygtus (TR01)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Keerthana D S', 'Hacker', true, 'Non-Veg'),
  ('Afnash Ali P', 'Hacker', true, 'Non-Veg'),
  ('Sajed Hussain', 'Hacker', true, 'N/A'),
  ('Ruvais P', 'Hacker', true, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TR01';

-- Team Alpha (TA02)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Arun Kumar', 'Hacker', true, 'Veg'),
  ('Sneha Mohan', 'Hacker', true, 'Veg'),
  ('Vivek Raj', 'Hacker', false, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TA02';

-- Team Nexus (TN03)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Priya Nair', 'Hacker', true, 'Veg'),
  ('Rahul Menon', 'Hacker', true, 'Non-Veg'),
  ('Anjali Krishnan', 'Hacker', true, 'Veg'),
  ('Deepak S', 'Hacker', false, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TN03';

-- Team Vortex (TV04)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Nikhil Thomas', 'Hacker', true, 'Non-Veg'),
  ('Reshma Das', 'Hacker', true, 'Veg'),
  ('Akash Pillai', 'Hacker', true, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TV04';

-- Team Blaze (TB05)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Fathima Zahra', 'Hacker', true, 'Veg'),
  ('Abishek R', 'Hacker', true, 'Non-Veg'),
  ('Meera Suresh', 'Hacker', false, 'Veg'),
  ('Rohit Varma', 'Hacker', true, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TB05';

-- Team Zenith (TZ06)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Sanjay Gopan', 'Hacker', true, 'Non-Veg'),
  ('Kavya Lal', 'Hacker', true, 'Veg'),
  ('Arjun Nambiar', 'Hacker', true, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TZ06';

-- Team Cipher (TC07)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Sreelakshmi K', 'Hacker', true, 'Veg'),
  ('Mohammed Irfan', 'Hacker', true, 'Non-Veg'),
  ('Lakshmi Priya', 'Hacker', true, 'Veg'),
  ('Vishnu Dev', 'Hacker', false, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TC07';

-- Team Orbit (TO08)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Adithya Menon', 'Hacker', true, 'Non-Veg'),
  ('Gopika S', 'Hacker', true, 'Veg'),
  ('Naveen Prasad', 'Hacker', true, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TO08';

-- Team Flux (TF09)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Haritha M', 'Hacker', true, 'Veg'),
  ('Subin Joseph', 'Hacker', false, 'Non-Veg'),
  ('Divya Raj', 'Hacker', true, 'Veg'),
  ('Akhil Babu', 'Hacker', true, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TF09';

-- Team Spark (TS10)
INSERT INTO team_members (team_id, name, role, is_checked_in, food_pref)
SELECT t.id, m.name, m.role, m.checked_in, m.food
FROM teams t,
(VALUES
  ('Amal Krishna', 'Hacker', true, 'Non-Veg'),
  ('Nandana S', 'Hacker', true, 'Veg'),
  ('Jithin George', 'Hacker', true, 'Non-Veg')
) AS m(name, role, checked_in, food)
WHERE t.code = 'TS10';
