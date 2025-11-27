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
          exit={{ 
            opacity: 0,
            scale: 1.2,
            filter: "blur(20px)"
          }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
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
          {/* Main Liquid Glass Container */}
          <motion.div
            className="relative z-10"
            animate={
              isPouring
                ? {
                    y: -80,
                    scale: 1.15,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
                  }
                : {
                    y: [0, -20, 0],
                    rotate: [0, 2, -2, 0],
                    transition: {
                      duration: 4,
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
                  ? {
                      borderRadius: ["50%", "48% 52% 50% 50%", "50%"],
                      transition: { duration: 0.4 }
                    }
                  : {
                      rotate: [-3, 3, -3],
                      borderRadius: [
                        "50%",
                        "48% 52% 51% 49%",
                        "52% 48% 49% 51%",
                        "50%"
                      ],
                      transition: {
                        duration: 5,
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
                    ? {
                        opacity: [1, 0.7, 1],
                        scale: [1, 1.1, 0.95],
                        y: [0, 5, 10],
                        transition: { duration: 0.6 }
                      }
                    : {
                        scale: [1, 1.08, 1],
                        opacity: [0.9, 1, 0.9],
                        transition: {
                          duration: 3,
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
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.8,
                }}
              />
              
              {/* Rotating ring */}
              <motion.div
                className="rotating-ring"
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
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
                {/* Main liquid stream with gradient flow */}
                <motion.div
                  className="liquid-stream"
                  initial={{ height: 0, opacity: 0, scaleY: 0 }}
                  animate={{
                    height: "100vh",
                    opacity: [0, 1, 1, 0.8],
                    scaleY: [0, 1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    ease: [0.45, 0.05, 0.55, 0.95],
                  }}
                />

                {/* Expanding circle waves */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`wave-${i}`}
                    className="liquid-wave"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 2, 3],
                      opacity: [0.8, 0.4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.3 + i * 0.15,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Droplets with trails */}
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="droplet"
                    initial={{
                      y: 0,
                      x: (i - 7.5) * 18,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      y: window.innerHeight,
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1.2, 0.9, 0],
                      rotate: [0, 180 + i * 30],
                    }}
                    transition={{
                      duration: 0.9 + i * 0.08,
                      delay: 0.2 + i * 0.04,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  />
                ))}
                
                {/* Splash particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`splash-${i}`}
                    className="splash-particle"
                    initial={{
                      y: 0,
                      x: 0,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      y: [0, -50, 100],
                      x: (i - 4) * 40,
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.5 + i * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}
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

            .rotating-ring {
              position: absolute;
              inset: -10px;
              border-radius: 50%;
              border: 2px solid transparent;
              border-top-color: rgba(51, 187, 238, 0.5);
              border-right-color: rgba(51, 187, 238, 0.3);
              pointer-events: none;
              z-index: 1;
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
              width: 50px;
              background: linear-gradient(
                180deg,
                rgba(51, 187, 238, 0.9) 0%,
                rgba(51, 187, 238, 0.95) 20%,
                hsl(var(--primary)) 50%,
                hsl(var(--primary)) 80%,
                hsl(var(--primary) / 0.8) 100%
              );
              border-radius: 25px 25px 0 0;
              box-shadow: 
                0 0 30px hsl(var(--primary) / 0.8),
                0 0 60px hsl(var(--primary) / 0.4),
                inset 0 0 15px rgba(255, 255, 255, 0.3),
                inset 2px 0 8px rgba(255, 255, 255, 0.4);
              z-index: 1;
              transform-origin: top center;
            }

            .liquid-wave {
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 200px;
              height: 200px;
              border-radius: 50%;
              border: 3px solid hsl(var(--primary) / 0.6);
              box-shadow: 0 0 30px hsl(var(--primary) / 0.4);
              pointer-events: none;
            }

            .droplet {
              position: absolute;
              top: 100%;
              left: 50%;
              width: 10px;
              height: 16px;
              border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
              background: linear-gradient(
                180deg,
                rgba(51, 187, 238, 0.9),
                hsl(var(--primary))
              );
              box-shadow: 
                0 0 12px hsl(var(--primary) / 0.8),
                0 2px 8px hsl(var(--primary) / 0.6),
                inset -1px -3px 6px rgba(255, 255, 255, 0.4),
                inset 1px 2px 4px rgba(255, 255, 255, 0.3);
            }

            .splash-particle {
              position: absolute;
              top: 100%;
              left: 50%;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: radial-gradient(
                circle,
                rgba(255, 255, 255, 0.8),
                hsl(var(--primary))
              );
              box-shadow: 0 0 10px hsl(var(--primary) / 0.8);
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
              .liquid-stream {
                width: 35px;
              }
              .liquid-wave {
                width: 150px;
                height: 150px;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
