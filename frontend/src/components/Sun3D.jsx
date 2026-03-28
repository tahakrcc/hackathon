import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Sun = ({ riskScore }) => {
  const mesh = useRef();
  
  // Speed of rotation based on risk
  const rotationSpeed = 0.005 + (riskScore / 1000);
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += rotationSpeed;
      mesh.current.rotation.x += rotationSpeed * 0.2;
    }
  });

  const getSunColor = () => {
    if (riskScore > 80) return "crimson";
    if (riskScore > 50) return "#ff8c00"; // darkorange
    return "#ffcc33"; // solar yellow
  };

  return (
    <group>
      <Sphere ref={mesh} args={[2, 64, 64]}>
        <MeshDistortMaterial
          color={getSunColor()}
          speed={2}
          distort={0.2 + (riskScore / 500)}
          roughness={0.4}
          metalness={0.8}
          emissive={getSunColor()}
          emissiveIntensity={1.5 + (riskScore / 50)}
        />
      </Sphere>
      {/* Sun Glow */}
      <Sphere args={[2.2, 32, 32]}>
        <meshBasicMaterial 
          color={getSunColor()} 
          transparent 
          opacity={0.15} 
          side={THREE.BackSide} 
        />
      </Sphere>
      <pointLight intensity={2} position={[0, 0, 0]} color={getSunColor()} />
    </group>
  );
};

const Sun3D = ({ riskScore = 20 }) => {
  return (
    <div className="w-full h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <color attach="background" args={['#05070a']} />
        <ambientLight intensity={0.2} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sun riskScore={riskScore} />
        </Float>
        
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default Sun3D;
