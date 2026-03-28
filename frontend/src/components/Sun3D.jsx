import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Sun3D = ({ riskScore = 20 }) => {
  const mountRef = useRef(null);
  
  // High-performance Star Shader
  const starVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const starFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    // Simplex noise and FBM for realistic plasma
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 6; i++) {
        v += a * snoise(p);
        p = p * 2.0 + vec3(100.0);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Domain warping for organic flow
      vec3 p = vPosition * 2.0;
      float noise = fbm(p + uTime * 0.15);
      float warp = fbm(p + noise + uTime * 0.1);
      
      // Intense star colors
      vec3 color = mix(uColor1, uColor2, warp * 1.5);
      
      // Dynamic granulation
      float granules = snoise(vPosition * 10.0 + uTime * 0.2);
      color += granules * 0.1;
      
      // Fresnel edge glow (Corona start)
      float viewDot = dot(vNormal, normalize(cameraPosition - vPosition));
      float fresnel = pow(1.0 - max(0.0, viewDot), 2.0);
      color += uColor2 * fresnel * 1.5;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Atmospheric Atmosphere Shader
  const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const atmosphereFragmentShader = `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
      float glow = pow(rim, 4.0) * uIntensity;
      gl_FragColor = vec4(uColor * glow, glow);
    }
  `;

  return (
    <div className="w-full h-[400px] cursor-grab active:cursor-grabbing bg-black rounded-2xl border border-slate-800/50 relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#000000']} />

        {/* Main Star Body */}
        <mesh>
          <sphereGeometry args={[2, 128, 128]} />
          <shaderMaterial
            vertexShader={starVertexShader}
            fragmentShader={starFragmentShader}
            uniforms={{
              uTime: { value: 0 },
              uColor1: { value: new THREE.Color("#ff3300") },
              uColor2: { value: new THREE.Color("#ffaa00") },
            }}
            onBeforeCompile={(shader) => {
              // Connect useFrame to uniforms
              shader.uniforms.uTime = { value: 0 };
            }}
          />
          <SunAnimationProxy />
        </mesh>

        {/* Layered Corona Atmosphere */}
        <Atmosphere scale={1.1} color="#ff4400" intensity={2.0} />
        <Atmosphere scale={1.25} color="#ff8800" intensity={1.0} />
        <Atmosphere scale={1.6} color="#ffbb00" intensity={0.2} />

        <OrbitControls
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minDistance={3.5}
          maxDistance={15}
          dampingFactor={0.05}
          enableDamping
        />
      </Canvas>

      {/* UI Elements */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full backdrop-blur-md">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Solar Core v5.1
          </p>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)' }}
      />
    </div>
  );
};

// Sub-components for better organization
const SunAnimationProxy = () => {
  useFrame((state) => {
    // Find the material in the scene and update its time uniform
    state.scene.traverse((obj) => {
      if (obj.isMesh && obj.material.uniforms?.uTime) {
        obj.material.uniforms.uTime.value = state.clock.elapsedTime;
      }
    });
  });
  return null;
};

const Atmosphere = ({ scale, color, intensity }) => {
  const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const atmosphereFragmentShader = `
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
      float glow = pow(rim, 4.0) * uIntensity;
      gl_FragColor = vec4(uColor * glow, glow);
    }
  `;

  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uIntensity: { value: intensity },
  }), [color, intensity]);

  return (
    <mesh scale={scale}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default Sun3D;

