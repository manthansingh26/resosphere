-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  username text,
  avatar_url text,
  aura_color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create vibes table
create table public.vibes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  energy numeric(3,2) not null check (energy >= 0 and energy <= 1),
  calm numeric(3,2) not null check (calm >= 0 and calm <= 1),
  creative numeric(3,2) not null check (creative >= 0 and creative <= 1),
  focus numeric(3,2) not null check (focus >= 0 and focus <= 1),
  joy numeric(3,2) not null check (joy >= 0 and joy <= 1),
  text text,
  audio_url text,
  image_url text,
  insight text,
  orb_color text,
  latitude float8,
  longitude float8,
  location_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create matches table
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references auth.users(id) on delete cascade not null,
  user2_id uuid references auth.users(id) on delete cascade not null,
  resonance_score numeric(3,2) not null check (resonance_score >= 0 and resonance_score <= 1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_match unique (user1_id, user2_id),
  constraint different_users check (user1_id != user2_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.vibes enable row level security;
alter table public.matches enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Vibes policies (public read, authenticated write)
create policy "Vibes are viewable by everyone"
  on public.vibes for select
  using (true);

create policy "Authenticated users can insert vibes"
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
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Authenticated users can create matches"
  on public.matches for insert
  with check (auth.uid() = user1_id);

-- Create indexes for better performance
create index profiles_username_idx on public.profiles(username);
create index vibes_user_id_idx on public.vibes(user_id);
create index vibes_created_at_idx on public.vibes(created_at desc);
create index vibes_location_idx on public.vibes(latitude, longitude) where latitude is not null and longitude is not null;
create index matches_user1_id_idx on public.matches(user1_id);
create index matches_user2_id_idx on public.matches(user2_id);
create index matches_resonance_score_idx on public.matches(resonance_score desc);

-- Enable realtime for vibes table (public read)
alter publication supabase_realtime add table public.vibes;

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, aura_color)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    '#8B5CF6'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
