# 🌌 ResoSphere Quick Reference

## 🔑 Environment Setup

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📦 Zustand Stores

### Auth
```typescript
import { useAuthStore } from '@/store/authStore';

const { user, session, loading, signIn, signUp, signOut } = useAuthStore();

// Sign up
await signUp('email@example.com', 'password');

// Sign in
await signIn('email@example.com', 'password');

// Sign out
await signOut();
```

### Vibes (with Realtime)
```typescript
import { useVibesStore } from '@/store/vibesStore';

const { 
  vibes, 
  loading, 
  fetchVibes, 
  createVibe, 
  subscribeToVibes, 
  unsubscribe 
} = useVibesStore();

// Fetch vibes
await fetchVibes(userId); // or fetchVibes() for all public vibes

// Create vibe
await createVibe({
  user_id: user.id,
  energy: 0.8,
  calm: 0.6,
  creative: 0.9,
  focus: 0.7,
  joy: 0.85,
  text: 'Feeling cosmic!',
  orb_color: '#8B5CF6',
  insight: 'AI generated insight here'
});

// Subscribe to realtime (in useEffect)
useEffect(() => {
  subscribeToVibes();
  return () => unsubscribe();
}, []);
```

### Matches
```typescript
import { useMatchesStore } from '@/store/matchesStore';

const { matches, loading, fetchMatches, createMatch } = useMatchesStore();

// Fetch matches
await fetchMatches(userId);

// Create match
await createMatch({
  user1_id: user.id,
  user2_id: otherUserId,
  resonance_score: 0.92
});
```

## 🗄️ Direct Supabase Client

```typescript
import { supabase } from '@/supabase/client';

// Query profiles
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', 'cosmic_user');

// Update profile
await supabase
  .from('profiles')
  .update({ aura_color: '#06B6D4' })
  .eq('id', user.id);
```

## 🎨 Database Schema

### Vibes Dimensions (0-1 scale)
- `energy` - High/low energy level
- `calm` - Peaceful/anxious state
- `creative` - Creative flow intensity
- `focus` - Concentration level
- `joy` - Happiness/contentment

### Orb Colors (Hex)
- Purple: `#8B5CF6`
- Cyan: `#06B6D4`
- Indigo: `#6366F1`
- Pink: `#EC4899`
- Custom: Any hex color

## 🎯 Component Patterns

### Protected Route
```typescript
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedPage() {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

### Realtime Vibes Feed
```typescript
import { useVibesStore } from '@/store/vibesStore';
import { useEffect } from 'react';

export default function VibesFeed() {
  const { vibes, loading, fetchVibes, subscribeToVibes, unsubscribe } = useVibesStore();

  useEffect(() => {
    fetchVibes(); // Fetch all public vibes
    subscribeToVibes(); // Subscribe to realtime updates
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading vibes...</div>;

  return (
    <div>
      {vibes.map(vibe => (
        <div key={vibe.id}>
          <p>Energy: {vibe.energy}</p>
          <p>Joy: {vibe.joy}</p>
          <p>{vibe.text}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🌐 3D Globe (react-globe.gl)

```typescript
import Globe from 'react-globe.gl';

<Globe
  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
  backgroundColor="rgba(0,0,0,0)"
  pointsData={matches}
  pointLat={d => d.lat}
  pointLng={d => d.lng}
  pointColor={() => '#8B5CF6'}
  pointAltitude={0.1}
  pointRadius={0.5}
/>
```

## 🎨 Theme Colors

```css
/* Cosmic Indigo-Purple-Cyan */
--primary: #8B5CF6 (purple)
--secondary: #06B6D4 (cyan)
--accent: #6366F1 (indigo)
--glow: rgba(139, 92, 246, 0.5)

/* Glassmorphism */
background: rgba(17, 24, 39, 0.8);
backdrop-filter: blur(12px);
border: 1px solid rgba(139, 92, 246, 0.2);
box-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
```

## 🔔 Toast Notifications (Sonner)

```typescript
import { toast } from 'sonner';

// Success
toast.success('Vibe logged successfully!');

// Error
toast.error('Failed to create vibe');

// Info
toast.info('Realtime connection established');

// Custom
toast('Custom message', {
  description: 'Additional details',
  duration: 3000,
});
```

## 📱 Responsive Breakpoints

```typescript
// Tailwind breakpoints
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 🚀 Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## ✨ Ready to Build!

All backend infrastructure is ready. Theme is preserved. Start building your cosmic vibe experience! 🌌
