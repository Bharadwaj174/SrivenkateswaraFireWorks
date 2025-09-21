import React, { useMemo } from 'react';
// FIX: Import Variants type from framer-motion to fix type inference issues.
import { motion, Variants } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

const title = "Sri Venkateswara Fire Works";

// FIX: Explicitly type with Variants to ensure correct type checking for animation properties.
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
        duration: 0.5,
        ease: 'easeInOut'
    }
  }
};

// FIX: Explicitly type with Variants to ensure correct type checking for animation properties.
const letterVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
    },
  },
};

const fireworkColors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF1493', '#FFFFFF'];

// Simulates the firework rocket rising
const FireworkParticle: React.FC = () => {
    const { x, duration, delay, color, height } = useMemo(() => ({
        x: Math.random() * 100,
        duration: Math.random() * 1.5 + 1.0,
        delay: Math.random() * 5,
        color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
        height: Math.random() * 300 + 200,
    }), []);
  
    return (
      <motion.div
        className="absolute bottom-0 w-2 h-2 rounded-full"
        style={{
          left: `${x}%`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}, 0 0 12px ${color}`,
        }}
        initial={{ opacity: 0, y: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: -height,
        }}
        transition={{
          duration,
          delay,
          ease: "easeOut",
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: Math.random() * 2 + 2,
        }}
      />
    );
};

// Simulates the firework explosion (blast)
const BlastParticle: React.FC<{ i: number; color: string; }> = ({ i, color }) => {
    const angle = (360 / 20) * i; // Distribute particles in a circle
    const distance = Math.random() * 80 + 60; // Random distance
    
    return (
      <motion.div
        className="absolute w-1 h-1 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 5px ${color}`,
        }}
        initial={{ scale: 0, x: 0, y: 0 }}
        animate={{
          x: [0, Math.cos(angle * Math.PI / 180) * distance],
          y: [0, Math.sin(angle * Math.PI / 180) * distance],
          scale: [1, 0],
          opacity: [1, 0],
        }}
        transition={{
          duration: Math.random() * 0.5 + 0.5,
          ease: "circOut",
        }}
      />
    );
  };
  
const FireworkBlast: React.FC = () => {
    const { top, left, delay, color } = useMemo(() => ({
      top: `${Math.random() * 60 + 20}%`, // Avoid edges
      left: `${Math.random() * 70 + 15}%`,
      delay: Math.random() * 4,
      color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
    }), []);
  
    const particles = useMemo(() => Array.from({ length: 20 }), []);
  
    return (
      <motion.div
        className="absolute"
        style={{ top, left }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          delay,
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: Math.random() * 3 + 4,
        }}
      >
        {/* Central flash effect */}
        <motion.div
            className="absolute w-1 h-1 rounded-full"
            style={{
                backgroundColor: '#fff',
                boxShadow: `0 0 20px 10px #fff, 0 0 40px 20px ${color}`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: [0, 1.5, 0],
                opacity: [0.8, 1, 0],
            }}
            transition={{
                duration: 0.6,
                ease: "easeOut",
            }}
        />
        {particles.map((_, i) => <BlastParticle key={i} i={i} color={color} />)}
      </motion.div>
    );
};


const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const fireworks = useMemo(() => Array.from({ length: 25 }), []);
  const blasts = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50 lightning-bg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onAnimationComplete={onComplete}
    >
      {fireworks.map((_, i) => <FireworkParticle key={`particle-${i}`} />)}
      {blasts.map((_, i) => <FireworkBlast key={`blast-${i}`} />)}

      <motion.h1
        className="relative text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wide text-center text-slate-100"
        style={{ textShadow: '0 0 10px rgba(255,255,255,0.3), 0 0 20px rgba(0,0,0,0.7)'}}
      >
        {title.split('').map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            variants={letterVariants}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.h1>
    </motion.div>
  );
};

export default IntroAnimation;