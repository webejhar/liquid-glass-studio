import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPouring, setIsPouring] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPouring(true);
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }, 1000);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial"
            animate={
              isTransitioning
                ? {
                    opacity: 0,
                    scale: 1.5,
                  }
                : {
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.2, 1],
                  }
            }
            transition={{
              duration: 4,
              repeat: isTransitioning ? 0 : Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Main Liquid Glass Container with Fragment Animation */}
          <motion.div
            className="relative z-10"
            animate={
              isTransitioning
                ? {
                    scale: [1, 1.2, 0.8],
                    opacity: [1, 0.8, 0],
                  }
                : {
                    y: [0, -20, 0],
                    rotate: [0, 2, -2, 0],
                  }
            }
            transition={
              isTransitioning
                ? { duration: 0.4, ease: "easeInOut" }
                : {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            {/* Liquid Glass Sphere with RI Text */}
            <motion.div
              className="liquid-glass-container"
              animate={
                isTransitioning
                  ? {
                      borderRadius: ["50%", "40% 60% 30% 70%", "30%"],
                    }
                  : {
                      rotate: [-3, 3, -3],
                      borderRadius: [
                        "50%",
                        "48% 52% 51% 49%",
                        "52% 48% 49% 51%",
                        "50%"
                      ],
                    }
              }
              transition={
                isTransitioning
                  ? { duration: 0.4, ease: "easeOut" }
                  : {
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            >
              {/* Glass effect overlay */}
              <div className="glass-overlay" />
              
              {/* RI Text */}
              <motion.div
                className="ri-text"
                animate={
                  isTransitioning
                    ? {
                        scale: [1, 0.5],
                        opacity: [1, 0],
                      }
                    : {
                        scale: [1, 1.08, 1],
                        opacity: [0.9, 1, 0.9],
                      }
                }
                transition={
                  isTransitioning
                    ? { duration: 0.3 }
                    : {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
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
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.8,
                }}
              />
            </motion.div>

            {/* Fragment particles on exit */}
            {isTransitioning && [...Array(12)].map((_, i) => (
              <motion.div
                key={`fragment-${i}`}
                className="fragment"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: Math.cos((i * Math.PI * 2) / 12) * 300,
                  y: Math.sin((i * Math.PI * 2) / 12) * 300,
                  opacity: 0,
                  scale: [1, 0.5, 0],
                  rotate: [0, 360 + i * 30],
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut",
                }}
                style={{
                  left: Math.cos((i * Math.PI * 2) / 12) * 110,
                  top: Math.sin((i * Math.PI * 2) / 12) * 110,
                }}
              />
            ))}

          </motion.div>

          <style>{`
            .bg-gradient-radial {
              background: radial-gradient(
                circle at center,
                hsl(var(--primary) / 0.15) 0%,
                transparent 70%
              );
            }

            .liquid-glass-container {
              width: 220px;
              height: 220px;
              border-radius: 50%;
              background: rgba(255, 255, 255, 0.03);
              backdrop-filter: blur(50px) saturate(200%);
              -webkit-backdrop-filter: blur(50px) saturate(200%);
              border: 2px solid rgba(51, 187, 238, 0.2);
              box-shadow: 
                0 10px 40px 0 rgba(0, 0, 0, 0.5),
                inset 0 2px 15px rgba(255, 255, 255, 0.15),
                inset 0 -2px 15px rgba(51, 187, 238, 0.1),
                0 0 100px rgba(51, 187, 238, 0.4),
                0 0 60px rgba(51, 187, 238, 0.2);
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
              font-size: 90px;
              font-weight: 900;
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 1) 0%,
                rgba(51, 187, 238, 1) 50%,
                rgba(255, 255, 255, 0.8) 100%
              );
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              filter: drop-shadow(0 0 25px rgba(51, 187, 238, 0.8))
                      drop-shadow(0 0 50px rgba(51, 187, 238, 0.5))
                      drop-shadow(0 0 10px rgba(255, 255, 255, 0.6));
              z-index: 2;
              position: relative;
              letter-spacing: 12px;
              font-family: 'Inter', sans-serif;
            }

            .sheen-effect {
              position: absolute;
              top: -50%;
              left: -50%;
              width: 60%;
              height: 200%;
              background: linear-gradient(
                120deg,
                transparent,
                rgba(255, 255, 255, 0.4) 40%,
                rgba(255, 255, 255, 0.6) 50%,
                rgba(255, 255, 255, 0.4) 60%,
                transparent
              );
              pointer-events: none;
              z-index: 3;
              transform: rotate(25deg);
            }

            .fragment {
              position: absolute;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.4),
                rgba(51, 187, 238, 0.6)
              );
              backdrop-filter: blur(10px);
              box-shadow: 
                0 0 20px rgba(51, 187, 238, 0.6),
                inset 0 2px 8px rgba(255, 255, 255, 0.3);
            }

            @media (max-width: 768px) {
              .liquid-glass-container {
                width: 170px;
                height: 170px;
              }
              .ri-text {
                font-size: 70px;
                letter-spacing: 8px;
              }
              .fragment {
                width: 15px;
                height: 15px;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
