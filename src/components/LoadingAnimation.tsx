import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingAnimation = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 backdrop-blur-sm"
      >
        <div className="relative">
          {/* Background Glow Effect */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full"
          />

          {/* Orbiting Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: i % 2 === 0 
                  ? "hsl(var(--primary))" 
                  : "hsl(var(--secondary))",
              }}
              className="transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                x: [0, Math.cos((i * Math.PI * 2) / 8) * 100],
                y: [0, Math.sin((i * Math.PI * 2) / 8) * 100],
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Main Text Container */}
          <div className="relative flex items-center justify-center gap-2 sm:gap-4">
            {/* Letter R */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotateY: -180 }}
              animate={{ 
                opacity: 1, 
                scale: [0, 1.2, 1],
                rotateY: 0
              }}
              transition={{
                delay: 0,
                duration: 0.8,
                ease: [0.6, 0.05, 0.01, 0.9],
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.5
                }}
                className="text-6xl sm:text-8xl md:text-9xl font-black bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent drop-shadow-2xl"
                style={{
                  textShadow: "0 0 40px hsl(var(--primary) / 0.5)",
                  WebkitTextStroke: "1px hsl(var(--primary) / 0.3)"
                }}
              >
                R
              </motion.div>
              
              {/* R Letter Fragments */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: -20 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  x: [-20, 0, 20],
                  y: [-20, 0, 20],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute top-0 left-0 text-2xl sm:text-4xl font-black text-primary/40"
              >
                R
              </motion.div>
            </motion.div>

            {/* Letter I */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotateY: -180 }}
              animate={{ 
                opacity: 1, 
                scale: [0, 1.2, 1],
                rotateY: 0
              }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: [0.6, 0.05, 0.01, 0.9],
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.8
                }}
                className="text-6xl sm:text-8xl md:text-9xl font-black bg-gradient-to-br from-secondary via-secondary/80 to-secondary/60 bg-clip-text text-transparent drop-shadow-2xl"
                style={{
                  textShadow: "0 0 40px hsl(var(--secondary) / 0.5)",
                  WebkitTextStroke: "1px hsl(var(--secondary) / 0.3)"
                }}
              >
                I
              </motion.div>

              {/* I Letter Fragments */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -20 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  x: [20, 0, -20],
                  y: [-20, 0, 20],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.3
                }}
                className="absolute top-0 right-0 text-2xl sm:text-4xl font-black text-secondary/40"
              >
                I
              </motion.div>
            </motion.div>
          </div>

          {/* Pulsing Ring */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
              rotate: [0, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 -m-8 border-4 border-primary/30 rounded-full"
          />

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground whitespace-nowrap"
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading...
            </motion.span>
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
