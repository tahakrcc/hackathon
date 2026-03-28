import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const AtmosphereVertexShader = `
varying vec3 vNormal;
void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const AtmosphereFragmentShader = `
varying vec3 vNormal;
void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
    gl_FragColor = vec4(0.1, 0.4, 1.0, 1.0) * intensity;
}
`;

const Earth = ({ riskScore }) => {
  const mesh = useRef();
  const atmosphereRef = useRef();
  
  // Load standard earth textures
  const [colorMap, bumpMap, specularMap] = useTexture([
    '/textures/earthmap.jpg',
    '/textures/earthbump.jpg',
    '/textures/earthspec.jpg'
  ]);
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Earth Surface sphere */}
      <Sphere ref={mesh} args={[2, 64, 64]}>
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.15} // stronger terrain depth
          roughnessMap={specularMap}
          roughness={0.6} // shinier water
          metalness={0.1}
          emissive={"#ffffff"}
          emissiveIntensity={0.05 + (riskScore / 1000)} // very subtle base glow
        />
      </Sphere>

      {/* Earth Atmosphere Glow (The thin blue line) */}
      <Sphere args={[2.05, 64, 64]}>
        <shaderMaterial
          vertexShader={AtmosphereVertexShader}
          fragmentShader={AtmosphereFragmentShader}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent={true}
          depthWrite={false}
        />
      </Sphere>
      
      {/* Auroral Oval (Represented as rings of light) - More prominent during high risk */}
      {riskScore > 30 && (
        <mesh position={[0, 1.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.05 + (riskScore/1000), 16, 100]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.3 + (riskScore/150)} />
        </mesh>
      )}
      {riskScore > 30 && (
        <mesh position={[0, -1.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.05 + (riskScore/1000), 16, 100]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.3 + (riskScore/150)} />
        </mesh>
      )}

      {/* Enhanced Sun/Ambient light setup for vibrant colors */}
      <directionalLight position={[5, 3, 5]} intensity={3.5} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#446688" /> {/* Backlight for dark side */}
      <ambientLight intensity={0.2} color="#ffffff" />
    </group>
  );
};

const Earth3D = ({ riskScore = 20 }) => {
  return (
    <div className="w-full h-[300px] cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden glass border border-slate-800/50">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#05070a']} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <Suspense fallback={
            <mesh>
              <sphereGeometry args={[2, 32, 32]} />
              <meshBasicMaterial color="#1e293b" wireframe />
            </mesh>
          }>
             <Earth riskScore={riskScore} />
          </Suspense>
        </Float>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default Earth3D;
