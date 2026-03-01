import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Palette, LogOut, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuraOrb from "@/components/AuraOrb";
import ParticleField from "@/components/ParticleField";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/supabase/client";

const AURA_COLORS = [
  { name: "Cosmic Purple", value: "#8B5CF6" },
  { name: "Mystic Cyan", value: "#06B6D4" },
  { name: "Deep Indigo", value: "#6366F1" },
  { name: "Vibrant Pink", value: "#EC4899" },
  { name: "Electric Violet", value: "#A855F7" },
  { name: "Sunset Orange", value: "#F97316" },
  { name: "Emerald Green", value: "#10B981" },
  { name: "Golden Yellow", value: "#FBBF24" },
];

const ProfileContent = () => {
  const { user, signOut } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    aura_color: "#8B5CF6",
  });
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      loadProfile();
      calculateStreak();
    }
  }, [user]);

  const calculateStreak = async () => {
    if (!user) return;

    const { data: vibes } = await supabase
      .from("vibes")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!vibes || vibes.length === 0) {
      setStreak(0);
      return;
    }

    // Calculate consecutive days
    let currentStreak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < vibes.length - 1; i++) {
      const currentDate = new Date(vibes[i].created_at);
      const nextDate = new Date(vibes[i + 1].created_at);
      
      currentDate.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile({
        username: data.username || "",
        aura_color: data.aura_color || "#8B5CF6",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          aura_color: profile.aura_color,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated! ✨");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    window.location.href = "/";
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16 px-4 cosmic-gradient">
      <ParticleField count={15} />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Your Profile
          </h1>
          <p className="text-muted-foreground">Customize your cosmic presence</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Aura Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Your Aura
            </h2>
            <div className="w-48 h-48 mx-auto mb-4">
              <AuraOrb
                className="w-full h-full"
                color1={profile.aura_color}
                color2="#9333ea"
                distort={0.4}
                overallMood={0.7}
                showParticles={true}
                particleCount={500}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Current aura color
            </p>
            
            {/* Streak Counter */}
            <div className="glass-card p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl">🔥</span>
                <span className="text-3xl font-bold gradient-text">{streak}</span>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Day{streak !== 1 ? 's' : ''} Streak
              </p>
              <p className="text-center text-xs text-purple-400 mt-2">
                Aura Evolution in Progress
              </p>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 space-y-6"
          >
            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                Email
              </label>
              <Input
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted/50 cursor-not-allowed"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Username
              </label>
              <Input
                type="text"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                placeholder="Enter your cosmic name"
                className="glass-card border-border/50 bg-card/40 backdrop-blur-xl"
              />
            </div>

            {/* Aura Color Picker */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                Aura Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AURA_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      setProfile({ ...profile, aura_color: color.value })
                    }
                    className={`relative w-full aspect-square rounded-lg transition-all ${
                      profile.aura_color === color.value
                        ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {profile.aura_color === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>
        </div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="glass-card-hover"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

const Profile = () => (
  <ProtectedRoute>
    <ProfileContent />
  </ProtectedRoute>
);

export default Profile;
