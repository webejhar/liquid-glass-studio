import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPouring, setIsPouring] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPouring(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1200);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Main Liquid Glass Container */}
          <motion.div
            className="relative"
            animate={
              isPouring
                ? {
                    y: -60,
                    scale: 1.1,
                    transition: { duration: 0.3, ease: "easeOut" },
                  }
                : {
                    y: [0, -15, 0],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }
            }
          >
            {/* Liquid Glass Sphere with RI Text */}
            <motion.div
              className="liquid-glass-container"
              animate={
                isPouring
                  ? {}
                  : {
                      rotate: [-2, 2, -2],
                      transition: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }
              }
            >
              {/* Glass effect overlay */}
              <div className="glass-overlay" />
              
              {/* RI Text */}
              <motion.div
                className="ri-text"
                animate={
                  isPouring
                    ? {}
                    : {
                        scale: [1, 1.05, 1],
                        transition: {
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                      }
                }
              >
                RI
              </motion.div>

              {/* Sheen effect */}
              <motion.div
                className="sheen-effect"
                animate={{
                  x: ["-200%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1,
                }}
              />

              {/* Floating bubbles inside glass */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bubble"
                  animate={{
                    y: [0, -80, 0],
                    x: [0, Math.sin(i) * 20, 0],
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${20 + i * 12}%`,
                    bottom: "10%",
                  }}
                />
              ))}
            </motion.div>

            {/* Pouring Liquid Effect */}
            {isPouring && (
              <>
                {/* Main liquid stream */}
                <motion.div
                  className="liquid-stream"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: "100vh",
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    ease: "easeIn",
                  }}
                />

                {/* Droplets */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="droplet"
                    initial={{
                      y: 0,
                      x: (i - 6) * 15,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      y: window.innerHeight,
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1, 0.8, 0],
                    }}
                    transition={{
                      duration: 0.8 + i * 0.1,
                      delay: i * 0.05,
                      ease: "easeIn",
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>

          <style>{`
            .liquid-glass-container {
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
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .glass-overlay {
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: radial-gradient(
                circle at 30% 30%,
                rgba(255, 255, 255, 0.2) 0%,
                transparent 60%
              );
              pointer-events: none;
            }

            .ri-text {
              font-size: 80px;
              font-weight: 900;
              color: rgba(51, 187, 238, 0.9);
              text-shadow: 
                0 0 20px rgba(51, 187, 238, 0.6),
                0 0 40px rgba(51, 187, 238, 0.4);
              z-index: 2;
              position: relative;
              letter-spacing: 8px;
              font-family: 'Inter', sans-serif;
            }

            .sheen-effect {
              position: absolute;
              top: 0;
              left: 0;
              width: 50%;
              height: 100%;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.3),
                transparent
              );
              pointer-events: none;
              z-index: 3;
            }

            .bubble {
              position: absolute;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: radial-gradient(
                circle at 30% 30%,
                rgba(255, 255, 255, 0.8),
                rgba(51, 187, 238, 0.4)
              );
              box-shadow: 
                inset -2px -2px 4px rgba(0, 0, 0, 0.2),
                0 0 8px rgba(51, 187, 238, 0.4);
            }

            .liquid-stream {
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              width: 40px;
              background: linear-gradient(
                180deg,
                rgba(51, 187, 238, 0.8) 0%,
                hsl(var(--primary)) 50%,
                hsl(var(--primary)) 100%
              );
              border-radius: 20px;
              box-shadow: 
                0 0 20px hsl(var(--primary) / 0.6),
                inset 0 0 10px rgba(255, 255, 255, 0.2);
              z-index: 1;
            }

            .droplet {
              position: absolute;
              top: 100%;
              left: 50%;
              width: 8px;
              height: 12px;
              border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
              background: linear-gradient(
                180deg,
                rgba(51, 187, 238, 0.7),
                hsl(var(--primary))
              );
              box-shadow: 
                0 0 8px hsl(var(--primary) / 0.6),
                inset 0 -2px 4px rgba(255, 255, 255, 0.3);
            }

            @media (max-width: 768px) {
              .liquid-glass-container {
                width: 150px;
                height: 150px;
              }
              .ri-text {
                font-size: 60px;
                letter-spacing: 6px;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
