import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const LoadingScreen = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-background"
        >
          <div className="relative">
            {/* Glass container */}
            <div className="glass-premium p-12 rounded-3xl">
              {/* Logo text with liquid flow animation */}
              <div className="relative overflow-hidden">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h1 className="text-6xl md:text-7xl font-bold text-foreground relative">
                    <span className="relative inline-block">
                      <span className="relative z-10">dor</span>
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-primary via-liquid-blue to-liquid-cyan bg-clip-text text-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        dor
                      </motion.span>
                    </span>
                    {" "}
                    <span className="relative inline-block">
                      <span className="relative z-10">RI</span>
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-primary via-liquid-blue to-liquid-cyan bg-clip-text text-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                          delay: 0.2,
                        }}
                      >
                        RI
                      </motion.span>
                    </span>
                  </h1>
                </motion.div>

                {/* Liquid wave effect */}
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Animated dots */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-primary"
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Ambient glow */}
            <motion.div
              className="absolute inset-0 -z-10 blur-3xl opacity-30"
              animate={{
                background: [
                  "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
                  "radial-gradient(circle, hsl(var(--liquid-blue)) 0%, transparent 70%)",
                  "radial-gradient(circle, hsl(var(--liquid-cyan)) 0%, transparent 70%)",
                  "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
