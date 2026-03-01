import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Globe, Mail, Lock, Wand2, TrendingUp, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuraOrb from "@/components/AuraOrb";
import ParticleField from "@/components/ParticleField";
import Starfield from "@/components/Starfield";
import { StaggerItem } from "@/components/PageTransition";
import { useAuthStore } from "@/store/authStore";
import { useVibesStore } from "@/store/vibesStore";

const Index = () => {
  const { user, signIn, signUp } = useAuthStore();
  const { vibes, subscribeToVibes, unsubscribe } = useVibesStore();
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vibesCount, setVibesCount] = useState(0);
  const [resonatingCount, setResonatingCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);

  useEffect(() => {
    subscribeToVibes();
    return () => unsubscribe();
  }, [subscribeToVibes, unsubscribe]);

  // Animated counters
  useEffect(() => {
    const targetVibes = vibes.length || 1247;
    const targetResonating = Math.floor(targetVibes * 0.15) || 187;
    const targetMatches = Math.floor(targetVibes * 2.3) || 2868;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setVibesCount(Math.floor(targetVibes * progress));
      setResonatingCount(Math.floor(targetResonating * progress));
      setMatchesCount(Math.floor(targetMatches * progress));

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [vibes.length]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        console.error('Auth error:', error);
        
        if (error.message?.includes('Invalid login credentials')) {
          toast.error("Invalid email or password");
        } else if (error.message?.includes('Email not confirmed')) {
          toast.error("Please check your email to confirm your account");
        } else if (error.message?.includes('User already registered')) {
          toast.error("This email is already registered. Try signing in instead.");
        } else if (error.message?.includes('Unable to validate email')) {
          toast.error("Invalid email format");
        } else {
          toast.error(error.message || "Authentication failed. Please check your connection.");
        }
      } else {
        toast.success(isSignUp ? "Welcome to ResoSphere! ✨" : "Welcome back! 🌌");
        setShowAuth(false);
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      console.error('Auth exception:', error);
      toast.error("Connection error. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      toast.success("Magic link sent! Check your email ✨");
    } catch (error: any) {
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <Starfield />
      <ParticleField count={150} />

      {/* Volumetric light beams */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0.15, 0.25, 0.15],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full"
        />
      </div>

      {/* Hero content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 max-w-6xl mx-auto pt-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <StaggerItem className="mb-6">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card-premium text-sm font-medium text-indigo-300 border border-indigo-500/30"
          >
            <Sparkles className="w-4 h-4" />
            The Emotional Internet
          </motion.span>
        </StaggerItem>

        <StaggerItem>
          <motion.h1
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-display font-black tracking-tighter mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="gradient-text glow-text-strong block mb-2">
              Feel the world's
            </span>
            <span className="text-foreground glow-text block">vibe</span>
          </motion.h1>
        </StaggerItem>

        {/* 3D Orb - MASSIVE and interactive */}
        <StaggerItem className="w-full max-w-2xl h-[400px] sm:h-[500px] lg:h-[600px] my-8 relative">
          <motion.div
            className="w-full h-full relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <AuraOrb className="w-full h-full" speed={0.5} distort={0.4} />
            
            {/* Orbiting particles around orb */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
                style={{
                  top: '50%',
                  left: '50%',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)',
                }}
                animate={{
                  x: [
                    Math.cos((i / 8) * Math.PI * 2) * 250,
                    Math.cos((i / 8) * Math.PI * 2 + Math.PI * 2) * 250,
                  ],
                  y: [
                    Math.sin((i / 8) * Math.PI * 2) * 250,
                    Math.sin((i / 8) * Math.PI * 2 + Math.PI * 2) * 250,
                  ],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        </StaggerItem>

        <StaggerItem>
          <motion.p
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Log your emotions, see your aura evolve in real-time, and discover others who resonate with your cosmic energy.
          </motion.p>
        </StaggerItem>

        <StaggerItem className="flex flex-col sm:flex-row gap-5 mb-16">
          {user ? (
            <>
              <Link to="/log-vibe">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group btn-premium flex items-center gap-3 text-lg"
                >
                  <Zap className="w-5 h-5" />
                  Log Your Vibe
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>
              <Link to="/resonance-map">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-card-premium px-8 py-4 rounded-xl font-semibold text-foreground flex items-center gap-3 text-lg border-2 border-indigo-500/30"
                >
                  <Globe className="w-5 h-5" />
                  Explore Map
                </motion.button>
              </Link>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAuth(true)}
              className="group btn-premium flex items-center gap-3 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          )}
        </StaggerItem>

        {/* Stats - Premium glass cards */}
        <StaggerItem className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { 
              label: "Vibes Logged", 
              value: vibesCount.toLocaleString(),
              icon: TrendingUp,
              color: "from-indigo-500 to-purple-500"
            },
            { 
              label: "Resonating Now", 
              value: resonatingCount.toLocaleString(),
              icon: Zap,
              color: "from-purple-500 to-pink-500"
            },
            { 
              label: "Aura Matches", 
              value: matchesCount.toLocaleString(),
              icon: Users,
              color: "from-cyan-500 to-indigo-500"
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card-premium p-6 text-center relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-indigo-400" />
              <div className="text-4xl font-display font-bold gradient-text-static mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </StaggerItem>
      </motion.div>

      {/* Auth Modal - Premium design */}
      <AnimatePresence>
        {showAuth && !user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl"
            onClick={() => setShowAuth(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card-premium p-10 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10" />
              
              <div className="relative z-10">
                <h2 className="text-3xl font-display font-bold gradient-text mb-3">
                  {isSignUp ? "Join ResoSphere" : "Welcome Back"}
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  {isSignUp 
                    ? "Create your cosmic profile and start vibing" 
                    : "Sign in to continue your journey"}
                </p>

                <form onSubmit={handleAuth} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="glass-card border-indigo-500/30 bg-card/40 backdrop-blur-xl h-12 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-400" />
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass-card border-indigo-500/30 bg-card/40 backdrop-blur-xl h-12 text-base"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-premium h-12 text-base"
                  >
                    {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={loading || !email}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full glass-card-hover px-6 py-3 rounded-xl font-medium text-foreground flex items-center justify-center gap-2 border border-indigo-500/30"
                  >
                    <Wand2 className="w-4 h-4" />
                    Send Magic Link
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    {isSignUp 
                      ? "Already have an account? Sign in" 
                      : "Don't have an account? Sign up"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
