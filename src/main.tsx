import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { LoadingAnimation } from "./components/LoadingAnimation";
import App from "./App.tsx";
import "./index.css";

function Root() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Start showing content slightly before animation ends for smooth blend
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 3800);

    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(loadingTimer);
    };
  }, []);

  return (
    <>
      {isLoading && <LoadingAnimation />}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ 
          opacity: showContent ? 1 : 0,
          scale: showContent ? 1 : 0.95,
          filter: showContent ? "blur(0px)" : "blur(10px)"
        }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <App />
      </motion.div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
