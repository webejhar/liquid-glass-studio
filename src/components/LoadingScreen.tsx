import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsJumping(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Liquid Glass Blob */}
          <motion.div
            className="relative"
            animate={
              isJumping
                ? {
                    y: -100,
                    scale: 1.2,
                    transition: { duration: 0.4, ease: "easeOut" },
                  }
                : {
                    y: [0, -20, 0],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
            }
          >
            {/* Main liquid glass sphere */}
            <motion.div
              className="liquid-glass-blob"
              animate={
                isJumping
                  ? {
                      background: "hsl(var(--primary))",
                      boxShadow: "0 0 60px hsl(var(--primary) / 0.6)",
                      transition: { duration: 0.4 },
                    }
                  : {}
              }
            />

            {/* Inner glow */}
            <div className="liquid-glass-inner-glow" />

            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="liquid-glass-particle"
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 0.7, 0.3],
                  x: [0, Math.cos((i * Math.PI) / 4) * 30, 0],
                  y: [0, Math.sin((i * Math.PI) / 4) * 30, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
                style={{
                  left: "50%",
                  top: "50%",
                }}
              />
            ))}
          </motion.div>

          <style>{`
            .liquid-glass-blob {
              width: 200px;
              height: 200px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.05);
              backdrop-filter: blur(40px) saturate(180%);
              -webkit-backdrop-filter: blur(40px) saturate(180%);
              border: 1px solid rgba(255, 255, 255, 0.15);
              box-shadow: 
                0 8px 32px 0 rgba(0, 0, 0, 0.37),
                inset 0 2px 10px rgba(255, 255, 255, 0.1),
                0 0 80px rgba(51, 187, 238, 0.3);
              position: relative;
              animation: liquidDistort 4s ease-in-out infinite;
            }

            @keyframes liquidDistort {
              0%, 100% {
                border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
                transform: rotate(0deg);
              }
              25% {
                border-radius: 60% 40% 55% 45% / 45% 60% 40% 55%;
                transform: rotate(5deg);
              }
              50% {
                border-radius: 45% 55% 45% 55% / 55% 45% 55% 45%;
                transform: rotate(0deg);
              }
              75% {
                border-radius: 55% 45% 60% 40% / 50% 55% 45% 50%;
                transform: rotate(-5deg);
              }
            }

            .liquid-glass-inner-glow {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: radial-gradient(
                circle,
                rgba(51, 187, 238, 0.4) 0%,
                rgba(51, 187, 238, 0.1) 40%,
                transparent 70%
              );
              animation: innerPulse 2s ease-in-out infinite;
            }

            @keyframes innerPulse {
              0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              50% {
                transform: translate(-50%, -50%) scale(1.3);
                opacity: 0.6;
              }
            }

            .liquid-glass-particle {
              position: absolute;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: radial-gradient(
                circle,
                rgba(51, 187, 238, 0.8) 0%,
                rgba(51, 187, 238, 0.2) 100%
              );
              box-shadow: 0 0 10px rgba(51, 187, 238, 0.5);
              pointer-events: none;
            }

            @media (max-width: 768px) {
              .liquid-glass-blob {
                width: 150px;
                height: 150px;
              }
              .liquid-glass-inner-glow {
                width: 90px;
                height: 90px;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
