import React from 'react';
import { motion } from 'framer-motion';

const SolarSphere = ({ level = 'Medium' }) => {
  const getColor = () => {
    switch(level) {
      case 'High': return 'var(--accent-orange)';
      case 'Critical': return '#ff5252';
      default: return 'var(--accent-green)';
    }
  };

  const getGlow = () => {
    switch(level) {
      case 'High': return 'var(--neon-glow-orange)';
      case 'Critical': return '0 0 30px rgba(255, 82, 82, 0.6)';
      default: return 'var(--neon-glow-green)';
    }
  };

  return (
    <div className="relative flex items-center justify-center p-12">
      {/* Outer Halo */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 rounded-full"
        style={{ backgroundColor: getColor() }}
      />
      
      {/* Inner Glow Sphere */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [getGlow(), '0 0 40px ' + getColor(), getGlow()]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-48 h-48 rounded-full flex flex-col items-center justify-center text-center z-10"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, #ffffff33 0%, transparent 70%), ${getColor()}22`,
          border: `2px solid ${getColor()}`
        }}
      >
        <span style={{ color: getColor(), fontSize: '0.8rem', fontWeight: 600, letterSpacing: '2px' }}>
          SOLAR ACTIVITY
        </span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '4px 0' }}>{level.toUpperCase()}</h2>
        <div style={{ width: '40px', height: '2px', background: getColor(), opacity: 0.5 }} />
      </motion.div>
    </div>
  );
};

export default SolarSphere;
