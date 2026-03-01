# ResoSphere Quick Start Guide

## ✅ Setup Complete

Your ResoSphere app now has Supabase integration with:
- Authentication system
- Vibes table (mood tracking with audio/image support)
- Matches table (user connections with resonance scores)
- Realtime subscriptions for live updates

## 🚀 Next Steps

### 1. Configure Supabase

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`

### 3. Start Development

```bash
npm run dev
```

## 📚 Available Hooks

### Authentication
```typescript
import { useAuthContext } from '@/components/AuthProvider';

const { user, session, loading, signIn, signUp, signOut } = useAuthContext();
```

### Vibes (with realtime)
```typescript
import { useVibes } from '@/hooks/useVibes';

const { vibes, loading, error, createVibe } = useVibes(userId);

// Create a new vibe
await createVibe({
  user_id: userId,
  mood_score: 0.85,
  text: 'Feeling great!',
  audio_url: 'https://...',
  image_url: 'https://...'
});
```

### Matches (with realtime)
```typescript
import { useMatches } from '@/hooks/useMatches';

const { matches, loading, error, createMatch } = useMatches(userId);

// Create a new match
await createMatch({
  user_id: userId,
  matched_user_id: otherUserId,
  resonance_score: 0.92
});
```

## 🎨 Example Component

Check out `src/components/VibeExample.tsx` for a working example of how to use the hooks.

## 📖 Full Documentation

See `SUPABASE_SETUP.md` for detailed setup instructions and database schema information.

## 🔧 Tech Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Three.js + React Three Fiber
- Supabase (Auth + Database + Realtime)
- React Query

## 📝 Note

This is a Vite + React app (not Next.js). All environment variables must be prefixed with `VITE_`.
