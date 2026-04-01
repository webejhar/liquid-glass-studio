import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const menuItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Providers", path: "/providers" },
  { label: "Shop", path: "/shop" },
  { label: "Contact", path: "/contact" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const hideHeader =
    ["/contact", "/meeting", "/about", "/email-generator", "/image-generator", "/login", "/register", "/forgot-password", "/account"].includes(location.pathname) ||
    location.pathname.startsWith("/admin");

  const [isChatActive, setIsChatActive] = useState(false);

  useEffect(() => {
    const checkChatActive = () => setIsChatActive(document.body.classList.contains("chat-active"));
    checkChatActive();
    const observer = new MutationObserver(checkChatActive);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLoginClick = () => navigate(isLoggedIn ? "/account" : "/login");

  if (hideHeader || (isChatActive && window.innerWidth < 768)) return null;

  const currentPage = menuItems.find((i) => i.path === location.pathname)?.label || "Select Page";

  return (
    <>
      {/* Sticky compact header */}
      <header className="sticky top-0 left-0 right-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border/30 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <motion.span
                className="text-xl font-bold text-primary"
                animate={{
                  textShadow: [
                    "0 0 8px rgba(51,187,238,0.4)",
                    "0 0 16px rgba(51,187,238,0.7)",
                    "0 0 8px rgba(51,187,238,0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Webejhar
              </motion.span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3">
              {/* Select Page dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onMouseEnter={() => setDropdownOpen(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary",
                    dropdownOpen ? "bg-primary/10 text-primary" : "text-foreground"
                  )}
                >
                  {currentPage}
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", dropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      onMouseLeave={() => setDropdownOpen(false)}
                      className="absolute top-full left-0 mt-1 w-48 py-1 rounded-xl border border-border/50 backdrop-blur-xl bg-background/95 shadow-xl z-50"
                    >
                      {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setDropdownOpen(false)}
                            className={cn(
                              "block px-4 py-2.5 text-sm transition-colors",
                              isActive
                                ? "text-primary bg-primary/10 font-semibold"
                                : "text-foreground hover:text-primary hover:bg-primary/5"
                            )}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/meeting"
                className="glass-button px-5 py-2 rounded-full text-xs font-medium hover:scale-105 transition-transform"
              >
                Meeting
              </Link>

              <button
                onClick={handleLoginClick}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              <button onClick={handleLoginClick} className="p-2 rounded-full hover:bg-primary/10 transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <motion.div
              className="absolute right-0 top-0 h-full w-64 max-w-[75vw] backdrop-blur-xl bg-background/95 border-l border-border/30 p-6 flex flex-col shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-4 mt-14 flex-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "text-base py-2 px-3 rounded-lg transition-colors",
                        isActive ? "text-primary bg-primary/10 font-semibold" : "hover:text-primary hover:bg-primary/5"
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
