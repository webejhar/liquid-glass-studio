import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { LoadingAnimation } from "./components/LoadingAnimation";
import App from "./App.tsx";
import "./index.css";

function Root() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <LoadingAnimation />}
      <App />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
