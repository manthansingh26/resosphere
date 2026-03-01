import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

interface VibePoint {
  lat: number;
  lng: number;
  color: string;
  mood: number;
  label: string;
  timestamp: string;
}

interface PremiumGlobeProps {
  points: VibePoint[];
  onPointClick?: (point: VibePoint) => void;
}

const Earth = ({ points, onPointClick }: { points: VibePoint[]; onPointClick?: (point: VibePoint) => void }) => {
  const earthRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  const pointsGroupRef = useRef<THREE.Group>(null);

  // Load realistic Earth textures
  const colorMap = useLoader(
    THREE.TextureLoader,
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg'
  );
  
  const bumpMap = useLoader(
    THREE.TextureLoader,
    'https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png'
  );

  // Convert lat/lng to 3D coordinates - ACCURATE FORMULA
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2.5) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Create vibe point meshes
  const vibePointMeshes = useMemo(() => {
    return points.map((point, index) => {
      const position = latLngToVector3(point.lat, point.lng, 2.56);
      return {
        position,
        color: point.color,
        mood: point.mood,
        point,
        index,
      };
    });
  }, [points]);

  useFrame((state, delta) => {
    // Smooth auto-rotation
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.08 * delta;
    }
    
    // Clouds rotate slightly faster
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.1 * delta;
    }

    // Pulsing vibe points
    if (pointsGroupRef.current) {
      pointsGroupRef.current.children.forEach((child, index) => {
        const pulse = Math.sin(state.clock.elapsedTime * 1.8 + index * 0.4) * 0.15 + 1;
        const popIn = Math.min(1, (state.clock.elapsedTime - index * 0.1) / 0.5);
        child.scale.setScalar(pulse * popIn);
      });
    }
  });

  return (
    <group>
      {/* Earth with realistic textures showing continents */}
      <group ref={earthRef}>
        <mesh>
          <sphereGeometry args={[2.5, 128, 128]} />
          <meshPhongMaterial
            map={colorMap}
            bumpMap={bumpMap}
            bumpScale={0.02}
            shininess={8}
            specular={new THREE.Color('#4488ff')}
          />
        </mesh>
      </group>

      {/* Cloud layer */}
      <group ref={cloudsRef}>
        <mesh>
          <sphereGeometry args={[2.52, 64, 64]} />
          <meshPhongMaterial
            color="#ffffff"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.6, 64, 64]} />
        <meshBasicMaterial
          color="#4a90e2"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Live vibe points */}
      <group ref={pointsGroupRef}>
        {vibePointMeshes.map((vibe, index) => (
          <group key={index} position={vibe.position}>
            {/* Small energy orb */}
            <mesh
              onClick={() => onPointClick?.(vibe.point)}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial
                color={vibe.color}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Subtle outer glow */}
            <mesh>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial
                color={vibe.color}
                transparent
                opacity={0.25}
                side={THREE.BackSide}
              />
            </mesh>

            {/* Point light */}
            <pointLight
              color={vibe.color}
              intensity={0.8}
              distance={0.25}
            />
          </group>
        ))}
      </group>
    </group>
  );
};

const PremiumGlobe = ({ points, onPointClick }: PremiumGlobeProps) => {
  return (
    <div className="w-full h-full relative">
      {/* Volumetric glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.2, 0.35, 0.2],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="w-[800px] h-[800px] rounded-full blur-[160px]"
          style={{
            background: 'radial-gradient(circle, rgba(74, 144, 226, 0.3), rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.15), transparent)',
          }}
        />
      </div>

      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-lg text-cyan-300 font-medium">Loading Earth...</p>
          </div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
        >
          {/* Deep space black background */}
          <color attach="background" args={['#000000']} />
          
          {/* Dense twinkling stars */}
          <Stars
            radius={300}
            depth={60}
            count={8000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Soft directional sunlight */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 3, 5]} intensity={1.2} />
          
          {/* Accent light */}
          <pointLight
            position={[-8, -5, -8]}
            intensity={0.5}
            color="#a855f7"
          />

          {/* Realistic Earth with continents */}
          <Earth points={points} onPointClick={onPointClick} />

          {/* Super smooth OrbitControls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            enableDamping={true}
            dampingFactor={0.07}
            rotateSpeed={0.5}
            zoomSpeed={0.8}
            minDistance={3.2}
            maxDistance={12}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default PremiumGlobe;
