# Supabase Setup Guide for ResoSphere

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be provisioned

## 2. Get Your API Keys

1. Go to Project Settings > API
2. Copy your project URL and anon/public key
3. Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Run the Database Migration

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL script

This will create:
- `vibes` table with columns: id, user_id, mood_score, text, audio_url, image_url, created_at
- `matches` table with columns: id, user_id, matched_user_id, resonance_score, created_at
- Row Level Security (RLS) policies for both tables
- Realtime subscriptions enabled for both tables

## 4. Enable Email Authentication

1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates if desired

## 5. Storage Setup (Optional)

If you want to store audio/images directly in Supabase:

1. Go to Storage
2. Create buckets: `vibes-audio` and `vibes-images`
3. Set up storage policies for user access

## 6. Test the Integration

Run the development server:

```bash
npm run dev
```

## Available Hooks

- `useAuth()` - Authentication management
- `useVibes(userId)` - Fetch and subscribe to vibes with realtime updates
- `useMatches(userId)` - Fetch and subscribe to matches with realtime updates

## Database Schema

### vibes table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `mood_score`: Numeric (0-1)
- `text`: Text (nullable)
- `audio_url`: Text (nullable)
- `image_url`: Text (nullable)
- `created_at`: Timestamp

### matches table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `matched_user_id`: UUID (foreign key to auth.users)
- `resonance_score`: Numeric (0-1)
- `created_at`: Timestamp
