import { useAuthContext } from './AuthProvider';
import { useVibes } from '@/hooks/useVibes';
import { useMatches } from '@/hooks/useMatches';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function VibeExample() {
  const { user } = useAuthContext();
  const { vibes, loading: vibesLoading, createVibe } = useVibes(user?.id);
  const { matches, loading: matchesLoading } = useMatches(user?.id);

  const handleCreateVibe = async () => {
    if (!user) return;

    const { error } = await createVibe({
      user_id: user.id,
      mood_score: Math.random(),
      text: 'Feeling the vibes! 🌟',
    });

    if (error) {
      console.error('Error creating vibe:', error);
    }
  };

  if (!user) {
    return <div>Please sign in to view vibes</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Vibes</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateVibe} className="mb-4">
            Create New Vibe
          </Button>
          {vibesLoading ? (
            <p>Loading vibes...</p>
          ) : (
            <div className="space-y-2">
              {vibes.map((vibe) => (
                <div key={vibe.id} className="p-3 border rounded">
                  <p className="font-semibold">Mood: {(vibe.mood_score * 100).toFixed(0)}%</p>
                  {vibe.text && <p className="text-sm">{vibe.text}</p>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(vibe.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {matchesLoading ? (
            <p>Loading matches...</p>
          ) : (
            <div className="space-y-2">
              {matches.map((match) => (
                <div key={match.id} className="p-3 border rounded">
                  <p className="font-semibold">
                    Resonance: {(match.resonance_score * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(match.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
