import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Share2, Wand2, Download } from "lucide-react";
import { toast } from "sonner";
import AuraOrb from "@/components/AuraOrb";
import ParticleField from "@/components/ParticleField";
import { StaggerItem } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useVibesStore } from "@/store/vibesStore";
import { shareAuraToX } from "@/lib/shareToX";
import { generateImage, getImageUrl } from "@/lib/imageGeneration";
import { format } from "date-fns";

const MyAuraContent = () => {
  const { user } = useAuthStore();
  const { vibes, loading, fetchVibes, subscribeToVibes, unsubscribe } = useVibesStore();
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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

  const handleGenerateImage = async () => {
    setGenerating(true);
    try {
      // Get dominant emotion
      const emotions = {
        energy: averageStats.energy,
        calm: averageStats.calm,
        creative: averageStats.creative,
        focus: averageStats.focus,
        joy: averageStats.joy,
      };
      const dominantEmotion = Object.entries(emotions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      
      // Create cosmic prompt from user's aura
      const intensity = Math.round(averageStats.overall * 100);
      const mood = intensity > 70 ? 'vibrant and powerful' : intensity > 40 ? 'balanced and harmonious' : 'subtle and gentle';
      
      const prompt = `cosmic aura visualization, ${dominantEmotion} energy dominant, mystical ${dominantColor} and purple colors, ethereal glow, ${mood} intensity, spiritual atmosphere, nebula background, energy particles, sacred geometry, photorealistic, 8k quality`;
      
      toast.info("Generating your cosmic aura image... ✨");
      
      const result = await generateImage(prompt, {
        width: 1024,
        height: 1024,
        steps: 30, // Higher quality
      });

      if (result.image) {
        setGeneratedImage(getImageUrl(result.image));
        toast.success('Aura image generated! ✨');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate image. Make sure backend is running.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `my-aura-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded! 📥');
  };

  if (loading && userVibes.length === 0) {
    return (
      <div className="relative min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <ParticleField count={50} />
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full mx-auto mb-6"
          />
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-6 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-md"
          />
          <h3 className="text-xl font-semibold text-purple-300 mb-2">Loading your aura...</h3>
          <p className="text-sm text-muted-foreground">Gathering your cosmic energy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 cosmic-gradient">
      <ParticleField count={15} />

      <div className="max-w-4xl mx-auto relative z-10">
        <StaggerItem className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text mb-2">My Aura</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Your evolving emotional signature</p>
        </StaggerItem>

        {/* Main Orb */}
        <StaggerItem className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto mb-4" id="main-aura-orb">
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

        <StaggerItem className="text-center mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Click & drag to explore • Click orb to pulse
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateImage}
              disabled={generating || userVibes.length === 0}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-sm sm:text-base font-semibold shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {generating ? 'Generating...' : 'Generate Aura Image'}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareToX}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white text-sm sm:text-base font-semibold shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] transition-all"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Share to X
            </motion.button>
          </div>
        </StaggerItem>

        {/* Generated Image Display */}
        <AnimatePresence>
          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="mb-8 sm:mb-12"
            >
              <StaggerItem className="glass-card-premium p-4 sm:p-6 border-2 border-indigo-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm sm:text-base font-bold text-indigo-300">Your Generated Aura</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadImage}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white text-xs sm:text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>
                </div>
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  src={generatedImage}
                  alt="Generated Aura"
                  className="w-full rounded-xl shadow-2xl"
                />
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Generated with Kiro Cascade • Based on your {userVibes.length} vibe{userVibes.length !== 1 ? 's' : ''}
                </p>
              </StaggerItem>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <StaggerItem className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {[
            { name: "Energy", value: averageStats.energy, color: "#EC4899" },
            { name: "Calm", value: averageStats.calm, color: "#06B6D4" },
            { name: "Creative", value: averageStats.creative, color: "#A855F7" },
            { name: "Focus", value: averageStats.focus, color: "#6366F1" },
            { name: "Joy", value: averageStats.joy, color: "#FBBF24" },
          ].map((stat) => (
            <motion.div
              key={stat.name}
              className="glass-card p-3 sm:p-4 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div
                className="text-2xl sm:text-3xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {Math.round(stat.value * 100)}%
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.name}</div>
            </motion.div>
          ))}
        </StaggerItem>

        {/* Latest Insight */}
        {userVibes.length > 0 && userVibes[0].insight && (
          <StaggerItem className="glass-card p-4 sm:p-6 mb-8 sm:mb-12">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <h3 className="text-xs sm:text-sm font-semibold text-purple-300">Latest Cosmic Insight</h3>
            </div>
            <p className="text-sm sm:text-base text-foreground italic whitespace-pre-line">
              {userVibes[0].insight}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-3">
              {format(new Date(userVibes[0].created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </StaggerItem>
        )}

        {/* Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-display font-semibold text-foreground flex items-center gap-2">
            Vibe Timeline
            <span className="text-xs sm:text-sm text-muted-foreground font-normal">
              ({userVibes.length} {userVibes.length === 1 ? 'vibe' : 'vibes'})
            </span>
          </h2>
          
          {userVibes.length === 0 ? (
            <div className="glass-card p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-muted-foreground mb-4">No vibes logged yet</p>
              <a
                href="/log-vibe"
                className="inline-block px-5 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm sm:text-base font-medium"
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
                  className="glass-card-hover p-3 sm:p-4 flex items-start gap-3 sm:gap-4"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
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
                      <div className="flex-1 min-w-0 pr-2">
                        {vibe.text && (
                          <p className="text-xs sm:text-sm text-foreground mb-1 line-clamp-2">{vibe.text}</p>
                        )}
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {format(new Date(vibe.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base sm:text-lg font-bold gradient-text">
                          {Math.round(overallMood * 100)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Mini stats */}
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap mt-2">
                      {[
                        { name: "E", value: vibe.energy, color: "#EC4899" },
                        { name: "C", value: vibe.calm, color: "#06B6D4" },
                        { name: "Cr", value: vibe.creative, color: "#A855F7" },
                        { name: "F", value: vibe.focus, color: "#6366F1" },
                        { name: "J", value: vibe.joy, color: "#FBBF24" },
                      ].map((stat) => (
                        <div
                          key={stat.name}
                          className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium"
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
