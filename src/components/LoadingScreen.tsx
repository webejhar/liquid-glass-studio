import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-background overflow-hidden"
        >
          {/* Simple liquid glass sphere */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div
              className="liquid-glass-container"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Glass effect overlay */}
              <div className="glass-overlay" />
              
              {/* RI Text */}
              <motion.div
                className="ri-text"
                animate={{
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                RI
              </motion.div>

              {/* Sheen effect */}
              <motion.div
                className="sheen-effect"
                animate={{
                  x: ["-200%", "200%"],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1,
                }}
              />
            </motion.div>
          </motion.div>

          <style>{`
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

            @media (max-width: 768px) {
              .liquid-glass-container {
                width: 170px;
                height: 170px;
              }
              .ri-text {
                font-size: 70px;
                letter-spacing: 8px;
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
