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
              {/* Stylish logo design */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex items-center gap-3"
                >
                  {/* Letter R with unique styling */}
                  <div className="relative">
                    <h1 className="text-9xl md:text-[10rem] font-black text-foreground relative tracking-tighter leading-none">
                      R
                    </h1>
                    {/* Liquid flow animation on R - goes up, then down */}
                    <motion.div
                      className="absolute inset-0 overflow-hidden"
                      style={{ WebkitMaskImage: "linear-gradient(to bottom, black, black)", maskImage: "linear-gradient(to bottom, black, black)" }}
                    >
                      <motion.div
                        className="absolute w-full h-full bg-gradient-to-b from-primary via-liquid-blue to-liquid-cyan"
                        animate={{
                          y: ["100%", "-100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          repeatDelay: 0.3,
                        }}
                        style={{
                          WebkitMaskImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext x=%2250%22 y=%2280%22 font-size=%2280%22 font-weight=%22900%22 text-anchor=%22middle%22 font-family=%22system-ui%22%3ER%3C/text%3E%3C/svg%3E')",
                          maskImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext x=%2250%22 y=%2280%22 font-size=%2280%22 font-weight=%22900%22 text-anchor=%22middle%22 font-family=%22system-ui%22%3ER%3C/text%3E%3C/svg%3E')",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Decorative separator */}
                  <motion.div
                    className="w-1 h-20 bg-gradient-to-b from-primary via-liquid-blue to-liquid-cyan rounded-full"
                    animate={{
                      scaleY: [0.5, 1, 0.5],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 0.3,
                    }}
                  />

                  {/* Letter I with unique styling */}
                  <div className="relative -ml-1">
                    <h1 className="text-9xl md:text-[10rem] font-black text-foreground relative tracking-tighter leading-none italic transform -skew-x-6">
                      I
                    </h1>
                    {/* Liquid flow animation on I - delayed to create jump effect */}
                    <motion.div
                      className="absolute inset-0 overflow-hidden"
                      style={{ WebkitMaskImage: "linear-gradient(to bottom, black, black)", maskImage: "linear-gradient(to bottom, black, black)" }}
                    >
                      <motion.div
                        className="absolute w-full h-full bg-gradient-to-b from-liquid-cyan via-liquid-blue to-primary"
                        animate={{
                          y: ["100%", "-100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          repeatDelay: 0.3,
                          delay: 1,
                        }}
                        style={{
                          WebkitMaskImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext x=%2250%22 y=%2280%22 font-size=%2280%22 font-weight=%22900%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-style=%22italic%22%3EI%3C/text%3E%3C/svg%3E')",
                          maskImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ctext x=%2250%22 y=%2280%22 font-size=%2280%22 font-weight=%22900%22 text-anchor=%22middle%22 font-family=%22system-ui%22 font-style=%22italic%22%3EI%3C/text%3E%3C/svg%3E')",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
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
