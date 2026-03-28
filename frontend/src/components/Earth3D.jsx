import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const Earth = ({ riskScore }) => {
  const earthRef = useRef();
  const cloudsRef = useRef();
  
  // Use only local textures that we know exist
  const [map, bump, spec] = useLoader(THREE.TextureLoader, [
    '/textures/earthmap.jpg',
    '/textures/earthbump.jpg',
    '/textures/earthspec.jpg'
  ]);

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.07;
  });

  // Dynamic color based on risk
  const shieldColor = riskScore > 70 ? '#f97316' : (riskScore > 35 ? '#3b82f6' : '#4ade80');

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={map} 
          bumpMap={bump} 
          bumpScale={0.05} 
          specularMap={spec} 
          specular={new THREE.Color('grey')}
          shininess={5}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={map} 
          transparent 
          opacity={0.15} 
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmospheric Glow (Rim) - Dynamic Shield */}
      <Atmosphere scale={1.15} color={shieldColor} intensity={riskScore > 50 ? 1.8 : 1.0} riskScore={riskScore} />
    </group>
  );
};

const Atmosphere = ({ scale, color, intensity, riskScore }) => {
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uIntensity: { value: intensity },
    uTime: { value: 0 },
    uRisk: { value: riskScore / 100 },
  }), [color, intensity, riskScore]);

  useFrame((state) => {
    if (uniforms.uTime) uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh scale={scale}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uIntensity;
          uniform float uTime;
          uniform float uRisk;
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          void main() {
            float rim = 1.0 - max(0.0, dot(vNormal, normalize(cameraPosition - vWorldPosition)));
            float pulse = 0.8 + 0.2 * sin(uTime * (1.0 + uRisk * 5.0));
            // Power of 12.0 for a significantly thinner, more professional edge
            float alpha = pow(rim, 12.0) * uIntensity * pulse;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

const Earth3D = ({ riskScore = 20 }) => {
  const isHighRisk = riskScore > 50;
  
  return (
    <div className="w-full h-full min-h-[300px] relative group">
      {/* 3D CANVAS LAYER */}
      <Canvas 
        gl={{ antialias: true, alpha: true }} 
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#000000'), 0);
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color={isHighRisk ? "#f97316" : "#ffffff"} />
        
        <React.Suspense fallback={null}>
          <Earth riskScore={riskScore} />
        </React.Suspense>
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      {/* TACTICAL HUD OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Targeting Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-blue-500/10 rounded-full">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-blue-500/40 rounded-full"
          />
        </div>

        {/* Scanning Axis */}
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-blue-500/10 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

        {/* Coordinate Markers */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className="w-1 h-1 bg-blue-500 mb-1" />
            <span className="text-[6px] tech-header text-blue-500/40 uppercase tracking-[3px]">N_POLE_AXIS</span>
        </div>
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="text-[6px] tech-header text-blue-500/40 uppercase tracking-[3px] mb-1">S_POLE_AXIS</span>
            <div className="w-1 h-1 bg-blue-500" />
        </div>

        {/* Shield Sync Data */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1 border border-blue-500/20">
           <p className="text-[7px] tech-header text-blue-400 tracking-[5px] animate-pulse">SHIELD_SYNC: 100%</p>
        </div>
      </div>
    </div>
  );
};

export default Earth3D;
