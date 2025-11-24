import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { UserNotifications } from "./UserNotifications";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide header on these pages
  const hideHeader = ['/contact', '/meeting', '/about', '/email-generator', '/login', '/register', '/forgot-password', '/account'].includes(location.pathname) || location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginClick = () => {
    navigate(isLoggedIn ? '/account' : '/login');
  };

  if (hideHeader) return null;

  return (
    <>
      {/* Normal Header - Only visible at top */}
      <motion.header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500",
          scrolled && "opacity-0 pointer-events-none"
        )}
        initial={{ y: 0 }}
        animate={{ y: scrolled ? -100 : 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <nav className="glass-card px-4 sm:px-6 py-3 sm:py-4 mx-2 sm:mx-4 my-2 sm:my-4 rounded-xl sm:rounded-2xl backdrop-blur-xl bg-background/30">
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

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/meeting"
                className="glass-button px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium hidden md:block hover:scale-105 transition-transform"
              >
                Meeting
              </Link>

              {isLoggedIn && <UserNotifications />}

              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="glass-button p-2 sm:p-3 rounded-full hover:scale-110 transition md:hidden"
                whileHover={{ scale: 1.1 }}
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Sticky Header - Only visible on scroll */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            className="fixed right-2 sm:right-4 top-2 sm:top-4 z-50 flex items-center gap-2 sm:gap-3"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {isLoggedIn && <UserNotifications />}
            <motion.button
              onClick={handleLoginClick}
              className="glass-card backdrop-blur-xl bg-background/30 p-3 sm:p-4 rounded-full hover:scale-110 transition"
              whileHover={{ scale: 1.1 }}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              onClick={() => setMobileMenuOpen(true)}
              className="glass-card backdrop-blur-xl bg-background/30 p-3 sm:p-4 rounded-full hover:scale-110 transition"
              whileHover={{ scale: 1.1 }}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-64 max-w-[75vw] glass-card backdrop-blur-xl bg-background/95 p-6 flex flex-col shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 glass-button p-2 rounded-full hover:scale-110 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-6 mt-16 flex-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "text-lg hover:text-primary transition-colors",
                        isActive && "text-primary font-semibold"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <Link
                to="/meeting"
                onClick={() => setMobileMenuOpen(false)}
                className="glass-button px-6 py-3 rounded-full text-center font-medium hover:scale-105 transition-transform mt-auto"
              >
                Book a Meeting
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
