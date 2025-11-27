import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const LoadingAnimation = () => {
  const [show, setShow] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => setShow(false), 1000);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

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
        <div className="relative flex items-center justify-center">
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
            className="absolute inset-0 -m-32 rounded-full"
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
            className="absolute inset-0 -m-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* RI Text with Rotation Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: [0, 360, 720, 1080],
            }}
            transition={{ 
              opacity: { duration: 1, ease: "easeOut" },
              scale: { duration: 1, ease: "easeOut" },
              rotate: { duration: 4, ease: "linear", repeat: Infinity }
            }}
            className="relative"
          >
            <div 
              className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-white to-primary"
              style={{
                textShadow: '0 0 60px hsl(var(--primary) / 0.8), 0 0 30px white',
                WebkitTextStroke: '2px hsl(var(--primary) / 0.3)',
              }}
            >
              RI
            </div>

            {/* Orbital Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`orbit-${i}`}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: i % 2 === 0 
                    ? 'linear-gradient(135deg, hsl(var(--primary)), white)'
                    : 'linear-gradient(135deg, white, hsl(var(--primary)))',
                  top: '50%',
                  left: '50%',
                  boxShadow: i % 2 === 0 
                    ? '0 0 15px hsl(var(--primary))'
                    : '0 0 15px white',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI * 2) / 8) * 120],
                  y: [0, Math.sin((i * Math.PI * 2) / 8) * 120],
                  scale: [0, 1, 0.5, 0],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>

          {/* Rotating Rings */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 -m-32 rounded-full"
            style={{
              border: '3px solid',
              borderColor: 'hsl(var(--primary))',
              borderStyle: 'dashed',
              boxShadow: '0 0 30px hsl(var(--primary) / 0.6), inset 0 0 30px hsl(var(--primary) / 0.4)',
            }}
          />

          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1.3, 1, 1.3],
              opacity: [0.7, 0.4, 0.7],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-0 -m-40 rounded-full"
            style={{
              border: '3px solid',
              borderColor: 'white',
              borderStyle: 'dashed',
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.4)',
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
