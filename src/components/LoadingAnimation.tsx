import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingAnimation = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background overflow-hidden"
      >
        {/* Animated Background Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1.2, 1],
            x: [-100, 100, -50, -100],
            y: [100, -100, 50, 100],
            opacity: [0.3, 0.6, 0.4, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl"
          style={{ top: '20%', left: '10%' }}
        />
        
        <motion.div
          animate={{
            scale: [1.2, 1, 1.5, 1.2],
            x: [100, -100, 50, 100],
            y: [-100, 100, -50, -100],
            opacity: [0.4, 0.7, 0.5, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute w-[400px] h-[400px] bg-white/20 rounded-full blur-3xl"
          style={{ bottom: '20%', right: '10%' }}
        />

        {/* Main Content Container */}
        <div className="relative flex items-center justify-center gap-4">
          {/* Dynamic Shadow Layers */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0, 0.6, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 -m-16"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)',
              filter: 'blur(20px)'
            }}
          />

          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.6, 0, 0.6],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute inset-0 -m-16"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 70%)',
              filter: 'blur(20px)'
            }}
          />

          {/* Letter R - Unique Design */}
          <motion.div
            initial={{ x: -200, opacity: 0, rotate: -180 }}
            animate={{ 
              x: 0, 
              opacity: 1, 
              rotate: 0,
            }}
            transition={{
              duration: 1,
              ease: [0.6, 0.05, 0.01, 0.9],
            }}
            className="relative"
          >
            {/* R Letter - Stylized Design */}
            <motion.div
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotateY: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="relative"
            >
              {/* Main R with unique styling */}
              <svg width="120" height="140" viewBox="0 0 120 140" className="drop-shadow-2xl">
                {/* Outer glow */}
                <motion.path
                  d="M20 20 L20 120 M20 20 L70 20 C90 20 90 50 70 50 L20 50 M70 50 L90 120"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    strokeWidth: [12, 16, 12],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  filter="url(#glow)"
                />
                
                {/* Main body */}
                <motion.path
                  d="M20 20 L20 120 M20 20 L70 20 C90 20 90 50 70 50 L20 50 M70 50 L90 120"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Inner gradient fill */}
                <defs>
                  <linearGradient id="rGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6">
                      <animate attributeName="stopColor" values="hsl(var(--primary));white;hsl(var(--primary))" dur="3s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="white" stopOpacity="0.8">
                      <animate attributeName="stopColor" values="white;hsl(var(--primary));white" dur="3s" repeatCount="indefinite" />
                    </stop>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
              </svg>

              {/* Floating particles around R */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`r-particle-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((i * Math.PI * 2) / 6) * 60],
                    y: [0, Math.sin((i * Math.PI * 2) / 6) * 60],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Letter I - Unique Design */}
          <motion.div
            initial={{ x: 200, opacity: 0, rotate: 180 }}
            animate={{ 
              x: 0, 
              opacity: 1, 
              rotate: 0,
            }}
            transition={{
              duration: 1,
              ease: [0.6, 0.05, 0.01, 0.9],
              delay: 0.2
            }}
            className="relative"
          >
            {/* I Letter - Stylized Design */}
            <motion.div
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotateY: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.5
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }
              }}
              className="relative"
            >
              {/* Main I with unique styling */}
              <svg width="80" height="140" viewBox="0 0 80 140" className="drop-shadow-2xl">
                {/* Outer glow */}
                <motion.path
                  d="M20 20 L60 20 M40 20 L40 120 M20 120 L60 120"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    strokeWidth: [12, 16, 12],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                  filter="url(#glow)"
                />
                
                {/* Main body */}
                <motion.path
                  d="M20 20 L60 20 M40 20 L40 120 M20 120 L60 120"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    opacity: [0.9, 1, 0.9],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                />

                {/* Inner gradient fill */}
                <defs>
                  <linearGradient id="iGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.6">
                      <animate attributeName="stopColor" values="white;hsl(var(--primary));white" dur="3s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8">
                      <animate attributeName="stopColor" values="hsl(var(--primary));white;hsl(var(--primary))" dur="3s" repeatCount="indefinite" />
                    </stop>
                  </linearGradient>
                </defs>
              </svg>

              {/* Floating particles around I */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`i-particle-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-white"
                  style={{
                    top: '50%',
                    left: '50%',
                  }}
                  animate={{
                    x: [0, Math.cos((i * Math.PI * 2) / 6 + Math.PI) * 60],
                    y: [0, Math.sin((i * Math.PI * 2) / 6 + Math.PI) * 60],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2 + 0.3,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Orbiting Ring */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="absolute inset-0 -m-12 border-4 border-primary/40 rounded-full"
            style={{
              boxShadow: '0 0 30px hsl(var(--primary) / 0.5)',
            }}
          />

          {/* Counter-Orbiting Ring */}
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="absolute inset-0 -m-16 border-4 border-white/30 rounded-full"
            style={{
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
            }}
          />
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-20"
        >
          <motion.p
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-lg font-bold bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent"
            style={{
              backgroundSize: '200% auto',
            }}
          >
            <motion.span
              animate={{
                backgroundPosition: ['0% center', '200% center'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundImage: 'linear-gradient(90deg, hsl(var(--primary)), white, hsl(var(--primary)))',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Loading...
            </motion.span>
          </motion.p>
        </motion.div>

        {/* Ambient Light Beams */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`beam-${i}`}
            className="absolute w-1 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
            style={{
              height: '100%',
              left: `${25 * (i + 1)}%`,
              transformOrigin: 'top',
            }}
            animate={{
              scaleY: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 2,
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
