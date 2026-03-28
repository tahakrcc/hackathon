import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const Sun3D = ({ riskScore = 20, xray = '--', windSpeed = '--' }) => {
  const sunRef = useRef();

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
    uniform float uTurbulence;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec3 vPosition;
    varying vec3 vNormal;

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
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
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
      for (int i = 0; i < 4; i++) {
        v += a * snoise(p);
        p = p * 2.5 + vec3(100.0);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec3 p = vPosition * 2.5;
      float noise = fbm(p + uTime * (0.2 * uTurbulence));
      float warp = fbm(p + noise + uTime * (0.15 * uTurbulence));
      
      // HEATMAP COLORS
      vec3 color = mix(uColor1, uColor2, warp * 2.0);
      
      // Brightness boost based on turbulence
      color *= 1.2 + (uTurbulence * 0.1);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const sunUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color("#fbbf24") }, // Muted Amber
    uColor2: { value: new THREE.Color("#f59e0b") }, // Deep Orange/Amber
    uTurbulence: { value: 0.8 },
  }), []);

  return (
    <div className="w-full h-full relative group">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 35 }}
      >
        <mesh ref={sunRef}>
          <sphereGeometry args={[2.2, 64, 64]} />
          <shaderMaterial
            vertexShader={starVertexShader}
            fragmentShader={starFragmentShader}
            uniforms={sunUniforms}
          />
          <SunAnimationProxy riskScore={riskScore} />
        </mesh>

        {/* Multi-Layer Dynamic Glow / Corona - Kaldırıldı */}

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      {/* SOLAR TACTICAL HUD */}
      <div className="absolute inset-0 pointer-events-none z-10 p-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] border border-white/5 rounded-full">
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="absolute inset-[-20px] border border-neon-cyan/10 rounded-full border-dashed"
          />
        </div>

        {/* Telemetry Labels - Kaldırıldı */}

        <div className="absolute bottom-10 right-10 flex flex-col items-end gap-1">
          <p className="text-[9px] tech-header text-slate-500 uppercase tracking-widest">GÜNEŞ_SENSÖRÜ_SOHO</p>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1 h-3 bg-neon-cyan/40"
                />
              ))}
            </div>
            <span className="text-[11px] font-black tracking-widest tech-header neon-text-yellow">L1_DÜĞÜM_VERİSİ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SunAnimationProxy = ({ riskScore }) => {
  useFrame((state) => {
    state.scene.traverse((obj) => {
      if (obj.isMesh && obj.material?.uniforms?.uTime) {
        obj.material.uniforms.uTime.value = state.clock.elapsedTime;
        if (obj.material.uniforms.uTurbulence) {
          obj.material.uniforms.uTurbulence.value = 1.0 + (riskScore / 30.0);
        }
      }
    });
  });
  return null;
};

const Atmosphere = ({ scale, color, intensity, pulse = false, speed = 1.0 }) => {
  const meshRef = useRef();
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) },
    uIntensity: { value: intensity },
    uTime: { value: 0 }
  }), [color, intensity]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed;
      if (pulse) {
        const p = 1.0 + Math.sin(t * 2.0) * 0.05;
        meshRef.current.scale.setScalar(scale * p);
      }
    }
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      <sphereGeometry args={[2.2, 32, 32]} />
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
          varying vec3 vNormal;
          varying vec3 vWorldPosition;
          void main() {
            float rim = 1.0 - max(0.0, dot(vNormal, normalize(cameraPosition - vWorldPosition)));
            gl_FragColor = vec4(uColor * pow(rim, 6.0) * uIntensity * 2.0, pow(rim, 4.0) * uIntensity);
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

export default Sun3D;
