import { useMemo } from "react";
import { motion } from "framer-motion";

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

const ParticleField = ({ count = 30, className = "" }: ParticleFieldProps) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 6,
      color: [
        "rgba(99, 102, 241, 0.6)",
        "rgba(168, 85, 247, 0.6)",
        "rgba(34, 211, 238, 0.6)",
        "rgba(236, 72, 153, 0.5)"
      ][Math.floor(Math.random() * 4)],
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, ${p.color}, transparent)`,
            boxShadow: `0 0 ${p.size * 6}px ${p.color}, 0 0 ${p.size * 12}px ${p.color}`,
          }}
          animate={{
            y: [0, -40, -20, 0],
            x: [0, 20, -15, 10, 0],
            opacity: [0.3, 0.8, 0.5, 0.3],
            scale: [1, 1.8, 1.2, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default ParticleField;
