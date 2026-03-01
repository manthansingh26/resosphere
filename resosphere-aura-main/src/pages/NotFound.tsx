import { motion } from "framer-motion";
import { Home, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AuraOrb from "@/components/AuraOrb";
import ParticleField from "@/components/ParticleField";

const NotFound = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center cosmic-gradient px-4">
      <ParticleField count={50} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl"
      >
        {/* 404 Orb */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-8">
          <AuraOrb
            className="w-full h-full"
            color1="#EC4899"
            color2="#8B5CF6"
            distort={0.6}
            speed={2}
            overallMood={0.3}
            showParticles={true}
            particleCount={800}
          />
        </div>

        {/* 404 Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-8xl sm:text-9xl font-display font-bold gradient-text mb-4">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground mb-4">
            Lost in the Cosmos
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            This vibe doesn't exist in our dimension. Let's get you back to familiar resonance.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
          <Link
            to="/log-vibe"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl glass-card font-semibold text-foreground transition-all duration-300 hover:bg-muted/50 hover:scale-105"
          >
            <Sparkles className="w-5 h-5" />
            Log a Vibe
          </Link>
        </motion.div>

        {/* Fun Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-sm text-purple-400 italic"
        >
          "Even lost paths lead to new discoveries" ✨
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;
