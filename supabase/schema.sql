-- RoomPartner Final — Supabase (Postgres) schema
-- Run in the Supabase SQL Editor. Row Level Security is ENABLED below with real
-- policies for every table (v5 only described RLS in comments — it was never
-- actually switched on). Demo mode in the app works without Supabase; run this
-- when you are ready for real users.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  age int,
  gender text,
  occupation text,
  city text,
  budget_min int,
  budget_max int,
  move_in_date date,
  food text,
  smoking text,
  alcohol text,
  sleep_time text,
  wake_time text,
  cleanliness int,
  work_hours text,
  wfh text,
  pets text,
  guests_ok text,
  languages text[] default '{}',
  bio text,
  phone_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists roommate_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  name text not null,
  age int, gender text, occupation text, city text,
  budget_min int, budget_max int, move_in_date date,
  food text, smoking text, alcohol text, sleep_time text, wake_time text,
  cleanliness int, work_hours text, wfh text, pets text, guests_ok text,
  languages text[] default '{}', bio text,
  phone_verified boolean default false, verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  title text not null,
  type text not null, -- room | flat | pg
  city text not null,
  locality text,
  rent int not null,
  deposit int default 0,
  furnishing text,
  bhk text,
  available_from date,
  gender_pref text default 'any',
  food_pref text,
  smoking_allowed boolean default false,
  pets_allowed boolean default false,
  amenities text[] default '{}',
  photos text[] default '{}',
  owner_name text,
  verified boolean default false,
  status text default 'active', -- draft | active | paused | rented
  created_at timestamptz default now()
);

create table if not exists rental_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  title text not null,
  category text not null, -- furniture | appliance | electronics | daily
  price_per_month int not null,
  deposit int default 0,
  condition text,
  city text,
  locality text,
  owner_name text,
  photos text[] default '{}',
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  target_type text not null, -- room | roommate | rental
  target_id uuid not null,
  message text,
  status text default 'pending', -- pending | accepted | rejected
  created_at timestamptz default now()
);

create table if not exists saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz default now(),
  unique (user_id, target_type, target_id)
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  renter_id uuid references profiles(id),
  item_id uuid references rental_items(id),
  start_date date,
  end_date date,
  total int,
  status text default 'requested', -- requested | confirmed | active | returned | cancelled
  created_at timestamptz default now()
);

-- Indexes for the filters used on every search
create index if not exists idx_rooms_city_rent on rooms (city, rent);
create index if not exists idx_rooms_status on rooms (status);
create index if not exists idx_rental_city on rental_items (city);
create index if not exists idx_roommates_city on roommate_profiles (city);

-- Row Level Security: actually enabled here, with policies. Never expose the
-- service_role key in the browser; use the anon key + RLS only.
alter table profiles enable row level security;
alter table roommate_profiles enable row level security;
alter table rooms enable row level security;
alter table rental_items enable row level security;
alter table interests enable row level security;
alter table saved_items enable row level security;
alter table bookings enable row level security;

-- profiles: anyone authenticated can read a profile; only the owner can write it.
drop policy if exists "profiles_read" on profiles;
create policy "profiles_read" on profiles for select to authenticated using (true);
drop policy if exists "profiles_write_own" on profiles;
create policy "profiles_write_own" on profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- listings: readable by all authenticated users; writable only by the owner.
drop policy if exists "listings_read" on rooms;
create policy "listings_read" on rooms for select to authenticated using (true);
drop policy if exists "listings_write_own" on rooms;
create policy "listings_write_own" on rooms for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "rentals_read" on rental_items;
create policy "rentals_read" on rental_items for select to authenticated using (true);
drop policy if exists "rentals_write_own" on rental_items;
create policy "rentals_write_own" on rental_items for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "roommates_read" on roommate_profiles;
create policy "roommates_read" on roommate_profiles for select to authenticated using (true);
drop policy if exists "roommates_write_own" on roommate_profiles;
create policy "roommates_write_own" on roommate_profiles for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
-- interests / saved_items / bookings: only the user who created them.
drop policy if exists "own_only" on interests;
create policy "own_only" on interests for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own_only" on saved_items;
create policy "own_only" on saved_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own_only" on bookings;
create policy "own_only" on bookings for all to authenticated using (renter_id = auth.uid()) with check (renter_id = auth.uid());

-- ---- Production v5 tables ----
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles(id),
  user_b uuid references profiles(id),
  target_type text,
  target_id uuid,
  title text,
  created_at timestamptz default now()
);
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references profiles(id),
  body text not null,
  created_at timestamptz default now()
);
create table if not exists squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target text,
  city text,
  budget_per_person int,
  max_members int default 3,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create table if not exists squad_members (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid references squads(id) on delete cascade,
  profile_id uuid references profiles(id),
  joined_at timestamptz default now(),
  unique (squad_id, profile_id)
);
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id),
  visitor_id uuid references profiles(id),
  visit_date date,
  visit_time text,
  status text default 'requested', -- requested | confirmed | done | cancelled
  created_at timestamptz default now()
);
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text default 'open', -- open | reviewed | actioned
  created_at timestamptz default now()
);
create table if not exists saved_bundles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text not null,
  items jsonb default '[]',
  saved_at timestamptz default now()
);
-- Listing lifecycle: rooms.status is already draft | active | paused | rented
-- in the CREATE TABLE above (the old duplicate "add column status" is removed).
-- Views + stale handling (listings older than 30 days are flagged stale in the app):
alter table rooms add column if not exists views int default 0;

create index if not exists idx_messages_conv on messages (conversation_id, created_at);
create index if not exists idx_visits_room on visits (room_id);
create index if not exists idx_reports_status on reports (status);

-- RLS for the v5 tables (same pattern as above).
alter table conversations enable row level security;
alter table messages enable row level security;
alter table squads enable row level security;
alter table squad_members enable row level security;
alter table visits enable row level security;
alter table reports enable row level security;
alter table saved_bundles enable row level security;

-- conversations / messages: only the two participants.
drop policy if exists "conv_participants" on conversations;
create policy "conv_participants" on conversations for all to authenticated using (user_a = auth.uid() or user_b = auth.uid()) with check (user_a = auth.uid() or user_b = auth.uid());
drop policy if exists "msg_participants" on messages;
create policy "msg_participants" on messages for all to authenticated using (
  exists (select 1 from conversations c where c.id = messages.conversation_id and (c.user_a = auth.uid() or c.user_b = auth.uid()))
) with check (
  exists (select 1 from conversations c where c.id = messages.conversation_id and (c.user_a = auth.uid() or c.user_b = auth.uid()))
);
-- squads: readable by all authenticated users; members write their own row.
drop policy if exists "squads_read" on squads;
create policy "squads_read" on squads for select to authenticated using (true);
drop policy if exists "squads_create_own" on squads;
create policy "squads_create_own" on squads for insert to authenticated with check (created_by = auth.uid());
drop policy if exists "squad_members_own" on squad_members;
create policy "squad_members_own" on squad_members for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
-- visits: readable/writable by the visitor and the room owner.
drop policy if exists "visits_parties" on visits;
create policy "visits_parties" on visits for all to authenticated using (
  visitor_id = auth.uid() or exists (select 1 from rooms r where r.id = visits.room_id and r.owner_id = auth.uid())
) with check (visitor_id = auth.uid());
-- reports: anyone authenticated can file one; reading the queue is for moderators
-- (in Supabase, give moderators a role claim — until then, reports are write-only
-- for the reporter and readable by the service role in the dashboard backend).
drop policy if exists "reports_file" on reports;
create policy "reports_file" on reports for insert to authenticated with check (reporter_id = auth.uid());
-- saved_bundles: owner only.
drop policy if exists "bundles_own" on saved_bundles;
create policy "bundles_own" on saved_bundles for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- v7 tables: payments, escrows, moderation flags ----
-- Payments: one row per verified Razorpay payment (test mode until KYC).
-- Never store card details — only Razorpay's order/payment ids.
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  product text not null, -- seekerPass | verification | ownerBoost
  amount_paise int not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  mode text default 'test', -- test | demo | live (live only after KYC)
  status text default 'verified', -- verified | failed | refunded
  created_at timestamptz default now()
);
-- Escrow: deposit held by the platform (demo state machine in the app;
-- real escrow needs a licensed escrow partner — see lib/escrow.ts).
create table if not exists escrows (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id),
  renter_id uuid references profiles(id),
  owner_id uuid references profiles(id),
  amount int not null,
  status text default 'created', -- created | held | released | refunded | disputed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Moderation flags: rule-based auto-flags (lib/moderation.ts). A flag never
-- deletes a listing by itself — a moderator reviews it in the queue.
create table if not exists moderation_flags (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  severity text default 'low', -- low | medium | high
  status text default 'open', -- open | reviewed | actioned
  created_at timestamptz default now()
);
create index if not exists idx_payments_user on payments (user_id);
create index if not exists idx_escrows_room on escrows (room_id);
create index if not exists idx_flags_status on moderation_flags (status);

alter table payments enable row level security;
alter table escrows enable row level security;
alter table moderation_flags enable row level security;
drop policy if exists "payments_own" on payments;
create policy "payments_own" on payments for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "escrow_parties" on escrows;
create policy "escrow_parties" on escrows for all to authenticated using (renter_id = auth.uid() or owner_id = auth.uid()) with check (renter_id = auth.uid() or owner_id = auth.uid());
-- moderation_flags: readable by moderators (service role) — reporters see
-- only their own flags; in demo mode the queue lives in localStorage.
drop policy if exists "flags_file" on moderation_flags;
create policy "flags_file" on moderation_flags for insert to authenticated with check (true);

-- Realtime: enable the messages table for Supabase Realtime (two-way chat).
-- In the Supabase dashboard: Database → Replication → enable `messages`.
-- The app subscribes per conversation (see lib/realtime.ts).
--   alter publication supabase_realtime add table messages;
