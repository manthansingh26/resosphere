# Supabase Integration Examples

## Using Authentication in Pages

### Example: Protected Route
```typescript
import { useAuthContext } from '@/components/AuthProvider';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProtectedPage() {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content for {user.email}</div>;
}
```

### Example: Login Form
```typescript
import { useAuthContext } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function LoginForm() {
  const { signIn, signUp } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    const { error } = await signIn(email, password);
    if (error) alert(error.message);
  };

  const handleSignUp = async () => {
    const { error } = await signUp(email, password);
    if (error) alert(error.message);
  };

  return (
    <div className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={handleSignIn}>Sign In</Button>
        <Button onClick={handleSignUp} variant="outline">Sign Up</Button>
      </div>
    </div>
  );
}
```

## Using Vibes in LogVibe Page

```typescript
// src/pages/LogVibe.tsx
import { useAuthContext } from '@/components/AuthProvider';
import { useVibes } from '@/hooks/useVibes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

export default function LogVibe() {
  const { user } = useAuthContext();
  const { createVibe } = useVibes(user?.id);
  const [text, setText] = useState('');
  const [moodScore, setMoodScore] = useState([0.5]);

  const handleSubmit = async () => {
    if (!user) return;

    const { error } = await createVibe({
      user_id: user.id,
      mood_score: moodScore[0],
      text: text || null,
    });

    if (error) {
      console.error('Error creating vibe:', error);
    } else {
      setText('');
      setMoodScore([0.5]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Log Your Vibe</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Mood Score: {(moodScore[0] * 100).toFixed(0)}%</label>
          <Slider
            value={moodScore}
            onValueChange={setMoodScore}
            max={1}
            step={0.01}
          />
        </div>

        <Textarea
          placeholder="How are you feeling?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={handleSubmit} disabled={!user}>
          Log Vibe
        </Button>
      </div>
    </div>
  );
}
```

## Using Matches in Matches Page

```typescript
// src/pages/Matches.tsx
import { useAuthContext } from '@/components/AuthProvider';
import { useMatches } from '@/hooks/useMatches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Matches() {
  const { user } = useAuthContext();
  const { matches, loading } = useMatches(user?.id);

  if (!user) {
    return <div className="container mx-auto p-6">Please sign in to view matches</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
      
      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>No matches yet. Keep vibing!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle>Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">
                    {(match.resonance_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Resonance Score
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(match.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Displaying User Vibes in MyAura Page

```typescript
// src/pages/MyAura.tsx
import { useAuthContext } from '@/components/AuthProvider';
import { useVibes } from '@/hooks/useVibes';
import { Card, CardContent } from '@/components/ui/card';

export default function MyAura() {
  const { user } = useAuthContext();
  const { vibes, loading } = useVibes(user?.id);

  if (!user) {
    return <div className="container mx-auto p-6">Please sign in to view your aura</div>;
  }

  const averageMood = vibes.length > 0
    ? vibes.reduce((sum, v) => sum + v.mood_score, 0) / vibes.length
    : 0;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Aura</h1>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-6xl font-bold mb-2">
              {(averageMood * 100).toFixed(0)}%
            </p>
            <p className="text-muted-foreground">Average Mood Score</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p>Loading vibes...</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Vibes</h2>
          {vibes.slice(0, 10).map((vibe) => (
            <Card key={vibe.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {vibe.text && <p className="mb-2">{vibe.text}</p>}
                    <p className="text-sm text-muted-foreground">
                      {new Date(vibe.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {(vibe.mood_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Realtime Updates

All hooks automatically subscribe to realtime updates. When data changes in Supabase:
- New vibes appear instantly in the UI
- New matches show up immediately
- Updates and deletes are reflected in real-time

No additional code needed - it's built into the hooks!

## File Upload Example (Optional)

If you want to upload audio/images to Supabase Storage:

```typescript
import { supabase } from '@/lib/supabase';

async function uploadFile(file: File, bucket: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Usage in LogVibe
const handleAudioUpload = async (file: File) => {
  const audioUrl = await uploadFile(file, 'vibes-audio');
  // Use audioUrl when creating vibe
};
```
