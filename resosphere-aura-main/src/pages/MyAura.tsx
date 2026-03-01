import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";
import AuraOrb from "@/components/AuraOrb";
import ParticleField from "@/components/ParticleField";
import { StaggerItem } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useVibesStore } from "@/store/vibesStore";
import { shareAuraToX } from "@/lib/shareToX";
import { format } from "date-fns";

const MyAuraContent = () => {
  const { user } = useAuthStore();
  const { vibes, loading, fetchVibes, subscribeToVibes, unsubscribe } = useVibesStore();

  useEffect(() => {
    if (user) {
      fetchVibes(user.id);
      subscribeToVibes();
    }
    return () => unsubscribe();
  }, [user, fetchVibes, subscribeToVibes, unsubscribe]);

  const userVibes = useMemo(() => {
    return vibes.filter(v => v.user_id === user?.id);
  }, [vibes, user]);

  const averageStats = useMemo(() => {
    if (userVibes.length === 0) {
      return {
        energy: 0.5,
        calm: 0.5,
        creative: 0.5,
        focus: 0.5,
        joy: 0.5,
        overall: 0.5,
      };
    }

    const sum = userVibes.reduce(
      (acc, vibe) => ({
        energy: acc.energy + vibe.energy,
        calm: acc.calm + vibe.calm,
        creative: acc.creative + vibe.creative,
        focus: acc.focus + vibe.focus,
        joy: acc.joy + vibe.joy,
      }),
      { energy: 0, calm: 0, creative: 0, focus: 0, joy: 0 }
    );

    const count = userVibes.length;
    const avg = {
      energy: sum.energy / count,
      calm: sum.calm / count,
      creative: sum.creative / count,
      focus: sum.focus / count,
      joy: sum.joy / count,
    };

    return {
      ...avg,
      overall: (avg.energy + avg.calm + avg.creative + avg.focus + avg.joy) / 5,
    };
  }, [userVibes]);

  const dominantColor = useMemo(() => {
    if (userVibes.length === 0) return "#8B5CF6";
    return userVibes[0]?.orb_color || "#8B5CF6";
  }, [userVibes]);

  const handleShareToX = async () => {
    try {
      await shareAuraToX('main-aura-orb', averageStats);
      toast.success("Opening X to share your aura! ✨");
    } catch (error) {
      toast.error("Failed to share. Please try again.");
    }
  };

  if (loading && userVibes.length === 0) {
    return (
      <div className="relative min-h-screen pt-24 pb-16 px-4 cosmic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-purple-300">Loading your aura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 cosmic-gradient">
      <ParticleField count={15} />

      <div className="max-w-4xl mx-auto relative z-10">
        <StaggerItem className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">My Aura</h1>
          <p className="text-muted-foreground">Your evolving emotional signature</p>
        </StaggerItem>

        {/* Main Orb */}
        <StaggerItem className="w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-4" id="main-aura-orb">
          <AuraOrb
            className="w-full h-full"
            color1={dominantColor}
            color2="#9333ea"
            distort={0.45}
            overallMood={averageStats.overall}
            showParticles={true}
            particleCount={Math.round(500 + averageStats.overall * 1000)}
            showAudioToggle={true}
          />
        </StaggerItem>

        <StaggerItem className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            Click & drag to explore • Click orb to pulse
          </p>
          
          {/* Share to X Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShareToX}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-semibold shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share My Aura to X
          </motion.button>
        </StaggerItem>

        {/* Stats Grid */}
        <StaggerItem className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">
          {[
            { name: "Energy", value: averageStats.energy, color: "#EC4899" },
            { name: "Calm", value: averageStats.calm, color: "#06B6D4" },
            { name: "Creative", value: averageStats.creative, color: "#A855F7" },
            { name: "Focus", value: averageStats.focus, color: "#6366F1" },
            { name: "Joy", value: averageStats.joy, color: "#FBBF24" },
          ].map((stat) => (
            <motion.div
              key={stat.name}
              className="glass-card p-4 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {Math.round(stat.value * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">{stat.name}</div>
            </motion.div>
          ))}
        </StaggerItem>

        {/* Latest Insight */}
        {userVibes.length > 0 && userVibes[0].insight && (
          <StaggerItem className="glass-card p-6 mb-12">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-purple-300">Latest Cosmic Insight</h3>
            </div>
            <p className="text-foreground italic whitespace-pre-line">
              {userVibes[0].insight}
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              {format(new Date(userVibes[0].created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </StaggerItem>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
            Vibe Timeline
            <span className="text-sm text-muted-foreground font-normal">
              ({userVibes.length} {userVibes.length === 1 ? 'vibe' : 'vibes'})
            </span>
          </h2>
          
          {userVibes.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground mb-4">No vibes logged yet</p>
              <a
                href="/log-vibe"
                className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium"
              >
                Log Your First Vibe
              </a>
            </div>
          ) : (
            userVibes.map((vibe, i) => {
              const overallMood = (vibe.energy + vibe.calm + vibe.creative + vibe.focus + vibe.joy) / 5;
              
              return (
                <motion.div
                  key={vibe.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card-hover p-4 flex items-start gap-4"
                >
                  <div className="w-16 h-16 flex-shrink-0">
                    <AuraOrb
                      className="w-full h-full"
                      color1={vibe.orb_color || "#8B5CF6"}
                      color2="#9333ea"
                      scale={1.2}
                      distort={0.3}
                      speed={1}
                      overallMood={overallMood}
                      showParticles={false}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {vibe.text && (
                          <p className="text-sm text-foreground mb-1">{vibe.text}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(vibe.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold gradient-text">
                          {Math.round(overallMood * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Mini stats */}
                    <div className="flex gap-2 flex-wrap mt-2">
                      {[
                        { name: "E", value: vibe.energy, color: "#EC4899" },
                        { name: "C", value: vibe.calm, color: "#06B6D4" },
                        { name: "Cr", value: vibe.creative, color: "#A855F7" },
                        { name: "F", value: vibe.focus, color: "#6366F1" },
                        { name: "J", value: vibe.joy, color: "#FBBF24" },
                      ].map((stat) => (
                        <div
                          key={stat.name}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${stat.color}20`,
                            color: stat.color,
                          }}
                        >
                          {stat.name}: {Math.round(stat.value * 100)}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const MyAura = () => (
  <ProtectedRoute>
    <MyAuraContent />
  </ProtectedRoute>
);

export default MyAura;
