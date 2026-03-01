import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AuraOrb from "@/components/AuraOrb";
import ParticleField from "@/components/ParticleField";
import { ResonanceChatModal } from "@/components/ResonanceChatModal";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useVibesStore } from "@/store/vibesStore";
import { calculateCosineSimilarity } from "@/lib/ai";
import { format } from "date-fns";

interface MatchedVibe {
  id: string;
  userId: string;
  text: string | null;
  orbColor: string;
  mood: number;
  similarity: number;
  timestamp: string;
  sliders: {
    energy: number;
    calm: number;
    creative: number;
    focus: number;
    joy: number;
  };
}

const MatchesContent = () => {
  const { user } = useAuthStore();
  const { vibes, loading, fetchVibes, subscribeToVibes, unsubscribe } = useVibesStore();
  const [sentResonance, setSentResonance] = useState<Set<string>>(new Set());
  const [chatModal, setChatModal] = useState<{
    isOpen: boolean;
    match: MatchedVibe | null;
  }>({ isOpen: false, match: null });

  useEffect(() => {
    fetchVibes(); // Fetch all public vibes
    subscribeToVibes();
    return () => unsubscribe();
  }, [fetchVibes, subscribeToVibes, unsubscribe]);

  const userLatestVibe = useMemo(() => {
    if (!user) return null;
    return vibes.find(v => v.user_id === user.id);
  }, [vibes, user]);

  const matches = useMemo(() => {
    if (!userLatestVibe) return [];

    const userSliders = {
      energy: userLatestVibe.energy,
      calm: userLatestVibe.calm,
      creative: userLatestVibe.creative,
      focus: userLatestVibe.focus,
      joy: userLatestVibe.joy,
    };

    // Get last 50 vibes from other users
    const otherVibes = vibes
      .filter(v => v.user_id !== user?.id)
      .slice(0, 50);

    // Calculate similarity and create matches
    const matchedVibes: MatchedVibe[] = otherVibes.map(vibe => {
      const vibeSliders = {
        energy: vibe.energy,
        calm: vibe.calm,
        creative: vibe.creative,
        focus: vibe.focus,
        joy: vibe.joy,
      };

      const similarity = calculateCosineSimilarity(userSliders, vibeSliders);
      const mood = (vibe.energy + vibe.calm + vibe.creative + vibe.focus + vibe.joy) / 5;

      return {
        id: vibe.id,
        userId: vibe.user_id,
        text: vibe.text,
        orbColor: vibe.orb_color || "#8B5CF6",
        mood,
        similarity,
        timestamp: vibe.created_at,
        sliders: vibeSliders,
      };
    });

    // Sort by similarity and return top 6
    return matchedVibes
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);
  }, [vibes, userLatestVibe, user]);

  const handleSendResonance = (match: MatchedVibe) => {
    setSentResonance(prev => new Set(prev).add(match.id));
    setChatModal({ isOpen: true, match });
    toast.success("Opening resonance chat! ✨");
  };

  if (loading && vibes.length === 0) {
    return (
      <div className="relative min-h-screen pt-24 pb-16 px-4 cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Finding your resonance...</p>
        </div>
      </div>
    );
  }

  if (!userLatestVibe) {
    return (
      <div className="relative min-h-screen pt-24 pb-16 px-4 cosmic-gradient">
        <ParticleField count={15} />
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl font-display font-bold gradient-text mb-4">
            Resonance Matches
          </h1>
          <div className="glass-card p-8">
            <p className="text-muted-foreground mb-6">
              Log your first vibe to discover cosmic connections
            </p>
            <a
              href="/log-vibe"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold"
            >
              Log Your Vibe
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 cosmic-gradient">
      <ParticleField count={20} />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Resonance Matches
          </h1>
          <p className="text-muted-foreground">
            Souls vibrating on your frequency
          </p>
        </motion.div>

        {matches.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">
              No matches found yet. More vibes are being logged every moment...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:border-purple-500/40 transition-all"
              >
                {/* Mini Orb */}
                <div className="w-32 h-32 mx-auto mb-4">
                  <AuraOrb
                    className="w-full h-full"
                    color1={match.orbColor}
                    color2="#9333ea"
                    scale={1.5}
                    distort={0.3}
                    speed={1.2}
                    overallMood={match.mood}
                    showParticles={false}
                  />
                </div>

                {/* Resonance Score */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="text-3xl font-bold gradient-text">
                      {Math.round(match.similarity)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">resonance match</p>
                </div>

                {/* Vibe Text */}
                {match.text && (
                  <p className="text-sm text-foreground mb-4 line-clamp-2 italic">
                    "{match.text}"
                  </p>
                )}

                {/* Stats */}
                <div className="flex gap-1 mb-4 flex-wrap justify-center">
                  {[
                    { name: "E", value: match.sliders.energy, color: "#EC4899" },
                    { name: "C", value: match.sliders.calm, color: "#06B6D4" },
                    { name: "Cr", value: match.sliders.creative, color: "#A855F7" },
                    { name: "F", value: match.sliders.focus, color: "#6366F1" },
                    { name: "J", value: match.sliders.joy, color: "#FBBF24" },
                  ].map((stat) => (
                    <div
                      key={stat.name}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                      }}
                    >
                      {Math.round(stat.value * 100)}
                    </div>
                  ))}
                </div>

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground text-center mb-4">
                  {format(new Date(match.timestamp), "MMM d, h:mm a")}
                </p>

                {/* Send Resonance Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendResonance(match)}
                  disabled={sentResonance.has(match.id)}
                  className={`w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                    sentResonance.has(match.id)
                      ? "bg-purple-500/20 text-purple-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                  }`}
                >
                  {sentResonance.has(match.id) ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Resonance Sent
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Resonance
                    </>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {chatModal.match && (
        <ResonanceChatModal
          isOpen={chatModal.isOpen}
          onClose={() => setChatModal({ isOpen: false, match: null })}
          matchData={{
            orbColor: chatModal.match.orbColor,
            similarity: chatModal.match.similarity,
            text: chatModal.match.text,
          }}
        />
      )}
    </div>
  );
};

const Matches = () => (
  <ProtectedRoute>
    <MatchesContent />
  </ProtectedRoute>
);

export default Matches;
