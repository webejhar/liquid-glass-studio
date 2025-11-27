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
    // Start showing content before animation fully ends for smooth blend
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, 3300);

    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 4300);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(loadingTimer);
    };
  }, []);

  return (
    <>
      {isLoading && <LoadingAnimation />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <App />
      </motion.div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
