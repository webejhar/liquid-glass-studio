import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Shop", path: "/shop" },
  { label: "Contact", path: "/contact" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 w-full z-50"
        initial={{ y: 0 }}
        animate={{ y: 0 }}
      >
        <nav className="glass-card px-6 py-4 m-4 rounded-2xl backdrop-blur-xl bg-background/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div
                  className="text-2xl font-bold text-primary"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(51, 187, 238, 0.5)",
                      "0 0 20px rgba(51, 187, 238, 0.8)",
                      "0 0 10px rgba(51, 187, 238, 0.5)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Webejhar
                </motion.div>
              </Link>

              <div className="hidden md:flex items-center gap-6 ml-8">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative group"
                    >
                      <span className="text-foreground hover:text-primary transition-colors">
                        <span
                          className={cn(
                            "inline-block transition-all duration-300",
                            "group-hover:text-primary group-hover:scale-150 group-hover:font-bold",
                            isActive && "text-primary scale-150 font-bold"
                          )}
                        >
                          {item.label[0]}
                        </span>
                        {item.label.slice(1, -1)}
                        <span
                          className={cn(
                            "inline-block transition-all duration-300",
                            "group-hover:text-accent group-hover:translate-x-1 group-hover:opacity-80",
                            isActive && "text-accent translate-x-1 opacity-80"
                          )}
                        >
                          {item.label.slice(-1)}
                        </span>
                      </span>
                      <motion.div
                        className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        animate={isActive ? { width: "100%" } : { width: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/meeting"
                className="glass-button px-6 py-2 rounded-full text-sm font-medium hidden md:block hover:scale-105 transition-transform"
              >
                Meeting
              </Link>

              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="glass-button p-3 rounded-full hover:scale-110 transition"
                whileHover={{ scale: 1.1 }}
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-80 glass-card p-8"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 glass-button p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-6 mt-12">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/meeting"
                  onClick={() => setMobileMenuOpen(false)}
                  className="glass-button px-6 py-3 rounded-full text-center mt-4"
                >
                  Meeting
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
