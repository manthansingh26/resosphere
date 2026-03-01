import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Points, PointMaterial } from "@react-three/drei";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { auraAudio, getAudioPreference, setAudioPreference } from "@/lib/audio";

interface AnimatedSphereProps {
  color1?: string;
  color2?: string;
  overallMood?: number;
  onClick?: () => void;
  isHovered?: boolean;
  isBurst?: boolean;
}

const AnimatedSphere = ({
  color1 = "#a855f7",
  color2 = "#22d3ee",
  overallMood = 0.5,
  onClick,
  isHovered = false,
  isBurst = false,
}: AnimatedSphereProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerGlow1Ref = useRef<THREE.Mesh>(null);
  const outerGlow2Ref = useRef<THREE.Mesh>(null);

  // Memoized materials for performance
  const coreMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color(color1),
      emissive: new THREE.Color(color2),
      emissiveIntensity: 0.9,
      shininess: 100,
      specular: new THREE.Color("#ffffff"),
      transparent: true,
      opacity: 0.92,
    });
  }, [color1, color2]);

  const glowMaterial1 = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color1),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
  }, [color1]);

  const glowMaterial2 = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color2),
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
  }, [color2]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth continuous rotation - 0.25 speed as specified
      const rotationSpeed = isHovered ? 0.35 : 0.25;
      meshRef.current.rotation.y += rotationSpeed * delta;
      meshRef.current.rotation.x += (rotationSpeed * 0.15) * delta;
      
      // Realistic breathing pulse: 1.0 → 1.07 → 1.0 using 1.8 frequency
      const breathe = Math.sin(state.clock.elapsedTime * 1.8) * 0.035 + 1.035;
      const hoverScale = isHovered ? 1.05 : 1;
      const burstScale = isBurst ? 1.15 : 1;
      meshRef.current.scale.setScalar(breathe * hoverScale * burstScale);
      
      // Update emissive intensity on hover/burst
      if (coreMaterial) {
        coreMaterial.emissiveIntensity = isBurst ? 1.3 : (isHovered ? 1.0 : 0.9);
      }
    }

    // Glow layers rotate slower
    if (outerGlow1Ref.current) {
      outerGlow1Ref.current.rotation.y += 0.12 * delta;
      const glowPulse = Math.sin(state.clock.elapsedTime * 0.3) * 0.05 + 1.1;
      outerGlow1Ref.current.scale.setScalar(glowPulse);
    }

    if (outerGlow2Ref.current) {
      outerGlow2Ref.current.rotation.y -= 0.18 * delta;
      const glowPulse = Math.sin(state.clock.elapsedTime * 0.4 + 1) * 0.06 + 1.15;
      outerGlow2Ref.current.scale.setScalar(glowPulse);
    }
  });

  return (
    <group>
      {/* Outer glow layer 2 */}
      <Sphere ref={outerGlow2Ref} args={[2.6, 32, 32]}>
        <primitive object={glowMaterial2} attach="material" />
      </Sphere>
      
      {/* Outer glow layer 1 */}
      <Sphere ref={outerGlow1Ref} args={[2.4, 32, 32]}>
        <primitive object={glowMaterial1} attach="material" />
      </Sphere>
      
      {/* Core sphere - PERFECT CIRCLE with radius 2.2, 64x64 segments */}
      <Sphere ref={meshRef} args={[2.2, 64, 64]} onClick={onClick}>
        <primitive object={coreMaterial} attach="material" />
      </Sphere>
    </group>
  );
};

interface ParticleFieldProps {
  color?: string;
  overallMood?: number;
  isHovered?: boolean;
  isBurst?: boolean;
}

const ParticleField = ({ 
  color = "#a855f7", 
  overallMood = 0.5,
  isHovered = false,
  isBurst = false,
}: ParticleFieldProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const burstTimeRef = useRef(0);

  // Optimized particle count - 90 for My Aura page
  const count = 90;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const radius = 2.5;
    
    for (let i = 0; i < count; i++) {
      // Evenly distributed on sphere surface
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius + Math.random() * 0.5;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      
      // Store initial positions as velocities for burst
      velocities[i * 3] = positions[i * 3] * 0.15;
      velocities[i * 3 + 1] = positions[i * 3 + 1] * 0.15;
      velocities[i * 3 + 2] = positions[i * 3 + 2] * 0.15;
    }
    
    return { positions, velocities };
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Smooth continuous orbital rotation - ALWAYS ORBITING
      const baseSpeed = isHovered ? 0.25 : 0.15;
      const rotationSpeed = baseSpeed * (0.5 + overallMood * 0.5);
      
      pointsRef.current.rotation.y += rotationSpeed * delta;
      pointsRef.current.rotation.x += (rotationSpeed * 0.3) * delta;
      
      // Burst effect
      if (isBurst) {
        const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const elapsed = state.clock.elapsedTime - burstTimeRef.current;
        
        if (elapsed < 1) {
          // Explode outward
          const progress = elapsed;
          for (let i = 0; i < count; i++) {
            posArray[i * 3] = positions[i * 3] + velocities[i * 3] * progress * 3;
            posArray[i * 3 + 1] = positions[i * 3 + 1] + velocities[i * 3 + 1] * progress * 3;
            posArray[i * 3 + 2] = positions[i * 3 + 2] + velocities[i * 3 + 2] * progress * 3;
          }
        } else {
          // Return to original positions
          for (let i = 0; i < count; i++) {
            posArray[i * 3] = positions[i * 3];
            posArray[i * 3 + 1] = positions[i * 3 + 1];
            posArray[i * 3 + 2] = positions[i * 3 + 2];
          }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });

  useEffect(() => {
    if (isBurst && pointsRef.current) {
      burstTimeRef.current = performance.now() / 1000;
    }
  }, [isBurst]);

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color={color}
        size={0.028}
        sizeAttenuation
        opacity={isHovered ? 0.7 : 0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

interface EnergyRingsProps {
  color?: string;
}

const EnergyRings = ({ color = "#a855f7" }: EnergyRingsProps) => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  const ringMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
  }, [color]);

  useFrame((state) => {
    const rings = [ring1Ref, ring2Ref, ring3Ref];
    
    rings.forEach((ringRef, index) => {
      if (ringRef.current) {
        const delay = index * 0.6; // Stagger by 0.6 seconds
        const ringTime = (state.clock.elapsedTime - delay) % 1.8; // 1.8 second cycle
        
        if (ringTime >= 0 && ringTime < 1.8) {
          const progress = ringTime / 1.8;
          const scale = 1 + progress * 2.5; // Expand outward
          const opacity = (1 - progress) * 0.4; // Fade out
          
          ringRef.current.scale.setScalar(scale);
          (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
        }
      }
    });
  });

  return (
    <group>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.08, 16, 32]} />
        <primitive object={ringMaterial.clone()} attach="material" />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.08, 16, 32]} />
        <primitive object={ringMaterial.clone()} attach="material" />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.08, 16, 32]} />
        <primitive object={ringMaterial.clone()} attach="material" />
      </mesh>
    </group>
  );
};

interface AuraOrbProps {
  className?: string;
  color1?: string;
  color2?: string;
  speed?: number;
  distort?: number;
  scale?: number;
  overallMood?: number;
  showParticles?: boolean;
  particleCount?: number;
  onClick?: () => void;
  showAudioToggle?: boolean;
  exploding?: boolean;
}

const AuraOrb = ({
  className = "",
  color1 = "#a855f7",
  color2 = "#22d3ee",
  overallMood = 0.5,
  showParticles = true,
  onClick,
  showAudioToggle = false,
  exploding = false,
}: AuraOrbProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBurst, setIsBurst] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    setAudioEnabled(getAudioPreference());
  }, []);

  useEffect(() => {
    if (audioEnabled) {
      auraAudio.start(overallMood);
    } else {
      auraAudio.stop();
    }
    
    return () => {
      if (audioEnabled) {
        auraAudio.stop();
      }
    };
  }, [audioEnabled]);

  useEffect(() => {
    if (audioEnabled && auraAudio.getIsPlaying()) {
      auraAudio.updateMood(overallMood);
    }
  }, [overallMood, audioEnabled]);

  useEffect(() => {
    if (exploding) {
      setIsBurst(true);
      const timer = setTimeout(() => setIsBurst(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [exploding]);

  const handleClick = () => {
    setIsBurst(true);
    setTimeout(() => setIsBurst(false), 1000);
    onClick?.();
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    setAudioPreference(newState);
    
    if (newState) {
      auraAudio.start(overallMood);
    } else {
      auraAudio.stop();
    }
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      animate={{
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Volumetric glow backdrop */}
      <div 
        className="absolute inset-0 rounded-full blur-[100px] opacity-60"
        style={{
          background: `radial-gradient(circle, ${color1}80, ${color2}40, transparent)`,
        }}
      />
      
      {/* Audio Toggle */}
      {showAudioToggle && (
        <button
          onClick={toggleAudio}
          className="absolute top-4 right-4 z-10 p-2 rounded-full glass-card hover:bg-purple-500/20 transition-all"
          title={audioEnabled ? "Mute ambient sound" : "Enable ambient sound"}
        >
          {audioEnabled ? (
            <Volume2 className="w-5 h-5 text-purple-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      )}
      
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading orb...</div>
        </div>
      }>
        <Canvas 
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
          }}
          dpr={[1, 2]}
        >
          {/* Minimal lighting for performance */}
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color={color1} />
          <pointLight position={[-5, -5, -5]} intensity={0.4} color={color2} />
          
          {showParticles && (
            <ParticleField 
              color={color1} 
              overallMood={overallMood}
              isHovered={isHovered}
              isBurst={isBurst}
            />
          )}
          
          {/* Energy rings that pulse outward */}
          <EnergyRings color={color1} />
          
          <AnimatedSphere
            color1={color1}
            color2={color2}
            overallMood={overallMood}
            onClick={handleClick}
            isHovered={isHovered}
            isBurst={isBurst}
          />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            enableRotate={true}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </Suspense>
    </motion.div>
  );
};

export default AuraOrb;
