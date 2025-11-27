import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingAnimation = () => {
  const [show, setShow] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setShow(false), 1000);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  // Fragment positions for R letter (scattered pieces)
  const rFragments = [
    { d: "M20 20 L20 60", x: -30, y: -20, delay: 0 },
    { d: "M20 60 L20 120", x: -20, y: 30, delay: 0.1 },
    { d: "M20 20 L45 20", x: 20, y: -30, delay: 0.15 },
    { d: "M45 20 L70 20", x: 40, y: -25, delay: 0.2 },
    { d: "M70 20 C90 20 90 35 90 35", x: 50, y: -15, delay: 0.25 },
    { d: "M90 35 C90 50 70 50 70 50", x: 45, y: 10, delay: 0.3 },
    { d: "M70 50 L45 50", x: 30, y: 15, delay: 0.35 },
    { d: "M45 50 L20 50", x: 15, y: 20, delay: 0.4 },
    { d: "M70 50 L80 85", x: 40, y: 35, delay: 0.45 },
    { d: "M80 85 L90 120", x: 35, y: 50, delay: 0.5 },
  ];

  // Fragment positions for I letter
  const iFragments = [
    { d: "M20 20 L35 20", x: -25, y: -30, delay: 0.1 },
    { d: "M35 20 L50 20", x: 25, y: -35, delay: 0.15 },
    { d: "M50 20 L60 20", x: 30, y: -28, delay: 0.2 },
    { d: "M40 20 L40 50", x: 20, y: -15, delay: 0.25 },
    { d: "M40 50 L40 80", x: -15, y: 10, delay: 0.3 },
    { d: "M40 80 L40 120", x: -20, y: 30, delay: 0.35 },
    { d: "M20 120 L35 120", x: -30, y: 40, delay: 0.4 },
    { d: "M35 120 L50 120", x: 20, y: 45, delay: 0.45 },
    { d: "M50 120 L60 120", x: 35, y: 38, delay: 0.5 },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ 
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 1.2 : 1,
        }}
        exit={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background overflow-hidden"
      >
        {/* Animated Background Waves */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`wave-${i}`}
            animate={{
              x: [-1000, 1000],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              x: {
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
            className="absolute w-[200%] h-2"
            style={{
              top: `${20 + i * 15}%`,
              background: i % 2 === 0 
                ? 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transform: `rotate(${i * 2}deg)`,
            }}
          />
        ))}

        {/* Floating Particles Background */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-bg-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              background: i % 2 === 0 ? 'hsl(var(--primary))' : 'white',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Main Content Container */}
        <div className="relative flex items-center justify-center gap-8">
          {/* Dynamic Shadow Pulses */}
          <motion.div
            animate={{
              scale: [1, 2, 1],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 -m-24 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.6), transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          <motion.div
            animate={{
              scale: [2, 1, 2],
              opacity: [0.5, 0.2, 0.5],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5
            }}
            className="absolute inset-0 -m-24 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Letter R - Fragmented Assembly */}
          <motion.div className="relative">
            <svg width="120" height="140" viewBox="0 0 120 140" className="drop-shadow-2xl">
              <defs>
                <filter id="glow-strong">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="rGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))">
                    <animate attributeName="stopColor" 
                      values="hsl(var(--primary));white;hsl(var(--primary))" 
                      dur="2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="white">
                    <animate attributeName="stopColor" 
                      values="white;hsl(var(--primary));white" 
                      dur="2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="hsl(var(--primary))">
                    <animate attributeName="stopColor" 
                      values="hsl(var(--primary));white;hsl(var(--primary))" 
                      dur="2s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>

              {/* R Letter Fragments */}
              {rFragments.map((fragment, i) => (
                <motion.path
                  key={`r-frag-${i}`}
                  d={fragment.d}
                  stroke="url(#rGrad)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow-strong)"
                  initial={{
                    x: fragment.x * 3,
                    y: fragment.y * 3,
                    opacity: 0,
                    scale: 0,
                    rotate: Math.random() * 360,
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    duration: 1,
                    delay: fragment.delay,
                    ease: [0.6, 0.05, 0.01, 0.9],
                  }}
                />
              ))}

              {/* R Sparkle Effects */}
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={`r-sparkle-${i}`}
                  r="2"
                  fill="white"
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [60, 60 + Math.cos((i * Math.PI * 2) / 8) * 40],
                    cy: [70, 70 + Math.sin((i * Math.PI * 2) / 8) * 40],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1 + i * 0.15,
                    ease: "easeOut"
                  }}
                />
              ))}
            </svg>

            {/* R Orbital Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`r-orbit-${i}`}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), white)',
                  top: '50%',
                  left: '50%',
                  boxShadow: '0 0 10px hsl(var(--primary))',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI * 2) / 6) * 70],
                  y: [0, Math.sin((i * Math.PI * 2) / 6) * 70],
                  scale: [0, 1, 0.5, 0],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1.5 + i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Letter I - Fragmented Assembly */}
          <motion.div className="relative">
            <svg width="80" height="140" viewBox="0 0 80 140" className="drop-shadow-2xl">
              <defs>
                <linearGradient id="iGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="white">
                    <animate attributeName="stopColor" 
                      values="white;hsl(var(--primary));white" 
                      dur="2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="hsl(var(--primary))">
                    <animate attributeName="stopColor" 
                      values="hsl(var(--primary));white;hsl(var(--primary))" 
                      dur="2s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="white">
                    <animate attributeName="stopColor" 
                      values="white;hsl(var(--primary));white" 
                      dur="2s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>

              {/* I Letter Fragments */}
              {iFragments.map((fragment, i) => (
                <motion.path
                  key={`i-frag-${i}`}
                  d={fragment.d}
                  stroke="url(#iGrad)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow-strong)"
                  initial={{
                    x: fragment.x * 3,
                    y: fragment.y * 3,
                    opacity: 0,
                    scale: 0,
                    rotate: Math.random() * 360,
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.3 + fragment.delay,
                    ease: [0.6, 0.05, 0.01, 0.9],
                  }}
                />
              ))}

              {/* I Sparkle Effects */}
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={`i-sparkle-${i}`}
                  r="2"
                  fill="hsl(var(--primary))"
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [40, 40 + Math.cos((i * Math.PI * 2) / 8 + Math.PI) * 35],
                    cy: [70, 70 + Math.sin((i * Math.PI * 2) / 8 + Math.PI) * 35],
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1.3 + i * 0.15,
                    ease: "easeOut"
                  }}
                />
              ))}
            </svg>

            {/* I Orbital Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`i-orbit-${i}`}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, white, hsl(var(--primary)))',
                  top: '50%',
                  left: '50%',
                  boxShadow: '0 0 10px white',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI * 2) / 6 + Math.PI) * 60],
                  y: [0, Math.sin((i * Math.PI * 2) / 6 + Math.PI) * 60],
                  scale: [0, 1, 0.5, 0],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1.8 + i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Rotating Rings */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              rotate: [0, 360],
              scale: [0, 1, 1.3, 1],
              opacity: [0, 0.4, 0.7, 0.4],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
            }}
            className="absolute inset-0 -m-16 rounded-full"
            style={{
              border: '3px solid',
              borderColor: 'hsl(var(--primary))',
              borderStyle: 'dashed',
              boxShadow: '0 0 30px hsl(var(--primary) / 0.6), inset 0 0 30px hsl(var(--primary) / 0.4)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              rotate: [360, 0],
              scale: [0, 1.3, 1, 1.3],
              opacity: [0, 0.7, 0.4, 0.7],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
            }}
            className="absolute inset-0 -m-20 rounded-full"
            style={{
              border: '3px solid',
              borderColor: 'white',
              borderStyle: 'dashed',
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.4)',
            }}
          />
          
          {/* Complete RI Text Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0, 1, 1], scale: [0.8, 0.8, 1, 1] }}
            transition={{ 
              duration: 2,
              times: [0, 0.4, 0.5, 1],
              ease: "easeOut"
            }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-white to-primary"
              style={{
                textShadow: '0 0 60px hsl(var(--primary) / 0.8), 0 0 30px white',
                WebkitTextStroke: '2px hsl(var(--primary) / 0.3)',
              }}
            >
              RI
            </div>
          </motion.div>
        </div>

        {/* Loading Progress Dots */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-24 flex gap-3"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="w-3 h-3 rounded-full"
              style={{
                background: i % 2 === 0 ? 'hsl(var(--primary))' : 'white',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12"
        >
          <motion.p
            className="text-xl font-bold"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--primary)), white, hsl(var(--primary)))',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{
              backgroundPosition: ['0% center', '200% center'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            Loading Amazing Experience...
          </motion.p>
        </motion.div>

        {/* Corner Light Beams */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`corner-${i}`}
            className="absolute"
            style={{
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'hsl(var(--primary) / 0.4)' : 'rgba(255, 255, 255, 0.3)'}, transparent)`,
              [i === 0 || i === 1 ? 'top' : 'bottom']: 0,
              [i === 0 || i === 2 ? 'left' : 'right']: 0,
              filter: 'blur(30px)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
