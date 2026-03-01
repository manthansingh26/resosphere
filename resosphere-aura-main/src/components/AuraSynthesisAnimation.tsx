import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Points, PointMaterial, Ring } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

interface SynthesisParticlesProps {
  stage: 'converging' | 'formed';
}

const SynthesisParticles = ({ stage }: SynthesisParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const startTimeRef = useRef(Date.now());

  const count = 120;

  const { initialPositions, targetPositions } = useMemo(() => {
    const initial = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const radius = 8; // Start far away
    const targetRadius = 2.2; // Converge to sphere
    
    for (let i = 0; i < count; i++) {
      // Initial scattered positions
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = radius + Math.random() * 2;
      
      initial[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      initial[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      initial[i * 3 + 2] = r * Math.cos(phi);
      
      // Target positions (on sphere surface)
      const tr = targetRadius + Math.random() * 0.3;
      target[i * 3] = tr * Math.sin(phi) * Math.cos(theta);
      target[i * 3 + 1] = tr * Math.sin(phi) * Math.sin(theta);
      target[i * 3 + 2] = tr * Math.cos(phi);
    }
    
    return { initialPositions: initial, targetPositions: target };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      if (stage === 'converging' && elapsed < 3) {
        // Converge particles to center
        const progress = Math.min(elapsed / 3, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        
        for (let i = 0; i < count; i++) {
          posArray[i * 3] = initialPositions[i * 3] + (targetPositions[i * 3] - initialPositions[i * 3]) * easeProgress;
          posArray[i * 3 + 1] = initialPositions[i * 3 + 1] + (targetPositions[i * 3 + 1] - initialPositions[i * 3 + 1]) * easeProgress;
          posArray[i * 3 + 2] = initialPositions[i * 3 + 2] + (targetPositions[i * 3 + 2] - initialPositions[i * 3 + 2]) * easeProgress;
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      } else if (stage === 'formed') {
        // Gentle orbit around formed sphere
        pointsRef.current.rotation.y += 0.01;
        pointsRef.current.rotation.x += 0.003;
      }
    }
  });

  return (
    <Points ref={pointsRef} positions={initialPositions} stride={3}>
      <PointMaterial
        transparent
        color={stage === 'converging' ? "#22d3ee" : "#a855f7"}
        size={0.03}
        sizeAttenuation
        opacity={stage === 'converging' ? 0.8 : 0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

interface CoreSphereProps {
  stage: 'converging' | 'formed';
}

const CoreSphere = ({ stage }: CoreSphereProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef(Date.now());

  const coreMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#22d3ee"),
      emissive: new THREE.Color("#a855f7"),
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0,
    });
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color("#a855f7"),
      transparent: true,
      opacity: 0,
      side: THREE.BackSide,
    });
  }, []);

  useFrame((state) => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    
    if (meshRef.current && innerGlowRef.current) {
      if (stage === 'converging' && elapsed < 3) {
        // Fade in as particles converge
        const progress = Math.min(elapsed / 3, 1);
        coreMaterial.opacity = progress * 0.9;
        glowMaterial.opacity = progress * 0.2;
        
        // Pulse during formation
        const pulse = Math.sin(elapsed * 8) * 0.1 + 1;
        meshRef.current.scale.setScalar(pulse * progress);
        innerGlowRef.current.scale.setScalar(pulse * progress * 1.3);
      } else if (stage === 'formed') {
        // Smooth rotation and breathing
        meshRef.current.rotation.y += 0.35 * 0.016; // ~0.35 * delta
        
        const breathe = Math.sin(state.clock.elapsedTime * 0.66) * 0.04 + 1.04;
        meshRef.current.scale.setScalar(breathe);
        innerGlowRef.current.scale.setScalar(breathe * 1.3);
        
        // Pulsing glow
        const glowPulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
        coreMaterial.emissiveIntensity = 1.2 + glowPulse;
      }
    }
  });

  return (
    <group>
      {/* Inner volumetric glow */}
      <Sphere ref={innerGlowRef} args={[2.2, 32, 32]} scale={1.3}>
        <primitive object={glowMaterial} attach="material" />
      </Sphere>
      
      {/* Core sphere */}
      <Sphere ref={meshRef} args={[2.2, 64, 64]}>
        <primitive object={coreMaterial} attach="material" />
      </Sphere>
    </group>
  );
};

interface EnergyRingsProps {
  stage: 'converging' | 'formed';
}

const EnergyRings = ({ stage }: EnergyRingsProps) => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const ring4Ref = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef(Date.now());

  const ringMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color("#22d3ee"),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame(() => {
    if (stage !== 'formed') return;
    
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const rings = [ring1Ref, ring2Ref, ring3Ref, ring4Ref];
    
    rings.forEach((ringRef, index) => {
      if (ringRef.current) {
        const delay = index * 0.3;
        const ringTime = (elapsed - delay) % 1.2;
        
        if (ringTime >= 0 && ringTime < 1.2) {
          const progress = ringTime / 1.2;
          const scale = 1 + progress * 3;
          const opacity = (1 - progress) * 0.6;
          
          ringRef.current.scale.setScalar(scale);
          (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
        }
      }
    });
  });

  useEffect(() => {
    if (stage === 'formed') {
      startTimeRef.current = Date.now();
    }
  }, [stage]);

  if (stage !== 'formed') return null;

  return (
    <group>
      <Ring ref={ring1Ref} args={[2, 2.3, 32]}>
        <primitive object={ringMaterial.clone()} attach="material" />
      </Ring>
      <Ring ref={ring2Ref} args={[2, 2.3, 32]}>
        <primitive object={ringMaterial.clone()} attach="material" />
      </Ring>
      <Ring ref={ring3Ref} args={[2, 2.3, 32]}>
        <primitive object={ringMaterial.clone()} attach="material" />
      </Ring>
      <Ring ref={ring4Ref} args={[2, 2.3, 32]}>
        <primitive object={ringMaterial.clone()} attach="material" />
      </Ring>
    </group>
  );
};

const AuraSynthesisScene = () => {
  const [stage, setStage] = useState<'converging' | 'formed'>('converging');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('formed');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#22d3ee" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#a855f7" />
      <pointLight position={[0, 0, 8]} intensity={0.8} color="#ec4899" />
      
      <SynthesisParticles stage={stage} />
      <CoreSphere stage={stage} />
      <EnergyRings stage={stage} />
    </>
  );
};

const AuraSynthesisAnimation = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Volumetric glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[600px] h-[600px] rounded-full blur-[150px] opacity-40"
          style={{
            background: 'radial-gradient(circle, #22d3ee80, #a855f740, transparent)',
          }}
        />
      </div>

      {/* 3D Canvas */}
      <div className="w-[500px] h-[500px] relative z-10">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse" />
          </div>
        }>
          <Canvas
            camera={{ position: [0, 0, 10], fov: 50 }}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance"
            }}
            dpr={[1, 2]}
          >
            <AuraSynthesisScene />
          </Canvas>
        </Suspense>
      </div>

      {/* Text with animated dots */}
      <motion.div
        className="mt-8 text-center relative z-10"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          Synthesizing your cosmic aura{dots}
        </p>
        
        {/* Subtle glow effect */}
        <div 
          className="absolute inset-0 blur-xl opacity-50"
          style={{
            background: 'linear-gradient(90deg, #22d3ee, #a855f7)',
          }}
        />
      </motion.div>

      {/* Optional: Progress ring */}
      <motion.div
        className="mt-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <svg width="60" height="60" className="transform -rotate-90">
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth="2"
            fill="none"
          />
          <motion.circle
            cx="30"
            cy="30"
            r="25"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
};

export default AuraSynthesisAnimation;
