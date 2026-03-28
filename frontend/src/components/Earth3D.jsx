import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Earth = ({ riskScore }) => {
  const mesh = useRef();
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.002;
    }
  });

  return (
    <group>
      {/* Night Side Glow */}
      <Sphere ref={mesh} args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1e293b"
          emissive="#22d3ee"
          emissiveIntensity={riskScore / 100} 
          roughness={0.5}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Auroral Oval (Represented as a ring of light) */}
      {riskScore > 50 && (
        <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.05, 16, 100]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
      {riskScore > 50 && (
        <mesh position={[0, -1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.05, 16, 100]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}

      <pointLight intensity={1.5} position={[5, 3, 5]} color="#ffffff" />
      <ambientLight intensity={0.1} />
    </group>
  );
};

const Earth3D = ({ riskScore = 20 }) => {
  return (
    <div className="w-full h-[300px] cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden glass border border-slate-800/50">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#05070a']} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Earth riskScore={riskScore} />
        </Float>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default Earth3D;
