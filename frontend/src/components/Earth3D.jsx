import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const Earth = ({ riskScore }) => {
  const earthRef = useRef();
  const cloudsRef = useRef();

  const [map, bump, spec] = useLoader(THREE.TextureLoader, [
    '/textures/earthmap.jpg',
    '/textures/earthbump.jpg',
    '/textures/earthspec.jpg'
  ]);

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.04;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.055;
  });

  // Riske göre dinamik renk (Göz Dostu Palet)
  const shieldColor = riskScore > 70 ? '#e11d48' : (riskScore > 35 ? '#fbbf24' : '#38bdf8');

  return (
    <group>
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhongMaterial
          map={map}
          bumpMap={bump}
          bumpScale={0.06}
          specularMap={spec}
          specular={new THREE.Color('#333333')}
          shininess={10}
        />
      </mesh>

      {/* Bulut Katmanı */}
      <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshPhongMaterial
          map={map}
          transparent
          opacity={0.12}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmosfer Kalkanı Kaldırıldı */}
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
      <sphereGeometry args={[2, 24, 24]} />
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
            float pulse = 0.85 + 0.15 * sin(uTime * (1.5 + uRisk * 6.0));
            // Elite Thin Edge Pro Shader
            float alpha = pow(rim, 14.0) * uIntensity * pulse;
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

const Earth3D = ({ riskScore = 20, bz = 0, bt = 0 }) => {
  const isHighRisk = riskScore > 50;

  // Koordinat Jitter Efekti (Realistik takip hissi için)
  const [coords, setCoords] = React.useState({ lat: 42.029, lon: -14.881 });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lon: prev.lon + (Math.random() - 0.5) * 0.001
      }));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] relative group cursor-auto">
      {/* 3B CANVAS KATMANI */}
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={isHighRisk ? "#e11d48" : "#ffffff"} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#38bdf8" />

        <React.Suspense fallback={null}>
          <Earth riskScore={riskScore} />
        </React.Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>

      {/* TAKTİK HUD KATMANI KALDIRILDI */}
    </div>
  );
};

export default Earth3D;
