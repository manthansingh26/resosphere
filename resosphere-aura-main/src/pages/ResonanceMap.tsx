import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import PremiumGlobe from "@/components/PremiumGlobe";
import { useVibesStore } from "@/store/vibesStore";
import { format } from "date-fns";

interface VibePoint {
  lat: number;
  lng: number;
  color: string;
  label: string;
  mood: number;
  timestamp: string;
}

interface Ring {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
  color: string;
}

// Realistic locations for demo
const DEMO_LOCATIONS = [
  { city: "Mumbai", lat: 19.076, lng: 72.8777, country: "India" },
  { city: "Tokyo", lat: 35.6762, lng: 139.6503, country: "Japan" },
  { city: "New York", lat: 40.7128, lng: -74.006, country: "USA" },
  { city: "São Paulo", lat: -23.5505, lng: -46.6333, country: "Brazil" },
  { city: "London", lat: 51.5074, lng: -0.1278, country: "UK" },
  { city: "Sydney", lat: -33.8688, lng: 151.2093, country: "Australia" },
  { city: "Paris", lat: 48.8566, lng: 2.3522, country: "France" },
  { city: "Dubai", lat: 25.2048, lng: 55.2708, country: "UAE" },
  { city: "Singapore", lat: 1.3521, lng: 103.8198, country: "Singapore" },
  { city: "Berlin", lat: 52.52, lng: 13.405, country: "Germany" },
  { city: "Toronto", lat: 43.6532, lng: -79.3832, country: "Canada" },
  { city: "Seoul", lat: 37.5665, lng: 126.978, country: "South Korea" },
  { city: "Mexico City", lat: 19.4326, lng: -99.1332, country: "Mexico" },
  { city: "Cairo", lat: 30.0444, lng: 31.2357, country: "Egypt" },
  { city: "Bangkok", lat: 13.7563, lng: 100.5018, country: "Thailand" },
];

const ResonanceMap = () => {
  const { vibes, subscribeToVibes, unsubscribe } = useVibesStore();
  const [hoveredPoint, setHoveredPoint] = useState<VibePoint | null>(null);
  const [vibeCount, setVibeCount] = useState(0);

  useEffect(() => {
    subscribeToVibes();
    return () => unsubscribe();
  }, [subscribeToVibes, unsubscribe]);

  useEffect(() => {
    setVibeCount(vibes.length);
  }, [vibes]);

  // Fake live updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setVibeCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const globePoints = useMemo(() => {
    const pointsWithLocation = vibes.filter(vibe => vibe.latitude && vibe.longitude);
    
    console.log('📍 Total vibes:', vibes.length);
    console.log('📍 Vibes with location:', pointsWithLocation.length);
    console.log('📍 Sample locations:', pointsWithLocation.slice(0, 3).map(v => ({
      lat: v.latitude,
      lng: v.longitude,
      name: v.location_name
    })));
    
    return pointsWithLocation
      .slice(0, 100)
      .map((vibe) => {
        const mood = (vibe.energy + vibe.calm + vibe.creative + vibe.focus + vibe.joy) / 5;

        return {
          lat: vibe.latitude!,
          lng: vibe.longitude!,
          color: vibe.orb_color || "#8B5CF6",
          label: vibe.location_name || `${vibe.latitude!.toFixed(2)}, ${vibe.longitude!.toFixed(2)}`,
          mood: mood * 100,
          timestamp: vibe.created_at,
        };
      });
  }, [vibes]);

  return (
    <div className="relative min-h-screen pt-20 overflow-hidden">
      <ParticleField count={30} />

      {/* Header */}
      <div className="absolute top-24 left-0 right-0 z-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-5xl font-display font-black gradient-text glow-text-strong mb-3">
              Resonance Map
            </h1>
            <p className="text-lg text-muted-foreground">
              Feel the global vibe in real-time
            </p>
          </motion.div>

          {/* Live Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-premium p-5 max-w-md mx-auto flex items-center justify-center gap-6 border-2 border-indigo-500/30"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold gradient-text-static">
                  {vibeCount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">vibes logged</div>
              </div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Zap className="w-5 h-5 text-purple-400" />
              </motion.div>
              <div>
                <div className="text-2xl font-bold text-purple-400">LIVE</div>
                <div className="text-xs text-muted-foreground">realtime</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Premium Globe */}
      <div className="absolute inset-0 z-10">
        <PremiumGlobe
          points={globePoints}
          onPointClick={(point) => setHoveredPoint(point)}
        />
      </div>

      {/* Hovered Point Details */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 glass-card-premium p-6 max-w-sm border-2 border-indigo-500/30"
          >
            <button
              onClick={() => setHoveredPoint(null)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
            <h3 className="font-bold text-foreground mb-2 text-lg">
              {hoveredPoint.label}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-5 h-5 rounded-full animate-pulse-glow"
                style={{ backgroundColor: hoveredPoint.color }}
              />
              <span className="text-sm text-muted-foreground">
                Someone just felt {Math.round(hoveredPoint.mood)}% resonance
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(hoveredPoint.timestamp), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 right-8 z-20 glass-card-premium p-4 max-w-xs border border-indigo-500/30"
      >
        <p className="text-xs text-muted-foreground">
          🌍 Drag to rotate • Scroll to zoom • Click points for details
        </p>
      </motion.div>
    </div>
  );
};

export default ResonanceMap;
