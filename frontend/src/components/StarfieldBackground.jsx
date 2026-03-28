import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Stars = ({ count = 5000 }) => {
  const points = useRef();

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
      s[i] = Math.random() * 2;
    }
    return [pos, s];
  }, [count]);

  useFrame((state) => {
    points.current.rotation.y += 0.0001;
    points.current.rotation.x += 0.00005;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={positions} 
          itemSize={3} 
        />
        <bufferAttribute 
          attach="attributes-size" 
          count={count} 
          array={sizes} 
          itemSize={1} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#ffffff" 
        transparent 
        opacity={0.3} 
        sizeAttenuation 
      />
    </points>
  );
};

const StarfieldBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#05070a]">
      <Canvas camera={{ position: [0, 0, 50] }}>
        <Stars />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
};

export default StarfieldBackground;
