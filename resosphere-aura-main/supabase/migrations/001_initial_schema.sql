-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create vibes table
create table public.vibes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mood_score numeric(3,2) not null check (mood_score >= 0 and mood_score <= 1),
  text text,
  audio_url text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create matches table
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  matched_user_id uuid references auth.users(id) on delete cascade not null,
  resonance_score numeric(3,2) not null check (resonance_score >= 0 and resonance_score <= 1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_match unique (user_id, matched_user_id)
);

-- Enable Row Level Security
alter table public.vibes enable row level security;
alter table public.matches enable row level security;

-- Vibes policies
create policy "Users can view their own vibes"
  on public.vibes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own vibes"
  on public.vibes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own vibes"
  on public.vibes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own vibes"
  on public.vibes for delete
  using (auth.uid() = user_id);

-- Matches policies
create policy "Users can view their own matches"
  on public.matches for select
  using (auth.uid() = user_id or auth.uid() = matched_user_id);

create policy "Users can insert their own matches"
  on public.matches for insert
  with check (auth.uid() = user_id);

-- Create indexes for better performance
create index vibes_user_id_idx on public.vibes(user_id);
create index vibes_created_at_idx on public.vibes(created_at desc);
create index matches_user_id_idx on public.matches(user_id);
create index matches_matched_user_id_idx on public.matches(matched_user_id);

-- Enable realtime for both tables
alter publication supabase_realtime add table public.vibes;
alter publication supabase_realtime add table public.matches;
