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
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
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

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  if (hideHeader || (isChatActive && window.innerWidth < 768)) return null;

  return (
    <>
      <header className="sticky top-0 left-0 right-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border/30 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-11">
            {/* Logo + Menu together */}
            <div className="flex items-center gap-1">
              <Link to="/" className="flex items-center shrink-0">
                <motion.span
                  className="text-lg font-bold text-primary"
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

              {/* Desktop dropdown next to logo */}
              <div
                ref={dropdownRef}
                className="relative hidden md:block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary",
                    dropdownOpen ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  Menu
                  <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", dropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-1 w-44 py-1 rounded-xl border border-border/50 backdrop-blur-xl bg-background/95 shadow-xl z-50 origin-top"
                    >
                      {menuItems.map((item, i) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.15 }}
                          >
                            <Link
                              to={item.path}
                              onClick={() => setDropdownOpen(false)}
                              className={cn(
                                "block px-4 py-2 text-xs transition-colors",
                                isActive
                                  ? "text-primary bg-primary/10 font-semibold"
                                  : "text-foreground hover:text-primary hover:bg-primary/5"
                              )}
                            >
                              {item.label}
                            </Link>
                          </motion.div>
                        );
                      })}
                      {/* Account inside menu */}
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: menuItems.length * 0.03, duration: 0.15 }}
                        className="border-t border-border/30 mt-1 pt-1"
                      >
                        <button
                          onClick={() => { setDropdownOpen(false); handleLoginClick(); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <User className="w-3 h-3" />
                          {isLoggedIn ? "My Account" : "Login"}
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop: Meeting button only */}
            <div className="hidden md:flex items-center">
              <Link
                to="/meeting"
                className="glass-button px-4 py-1.5 rounded-full text-xs font-medium hover:scale-105 transition-transform"
              >
                Meeting
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Menu className="w-4 h-4" />
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
              className="absolute right-0 top-0 h-full w-60 max-w-[70vw] backdrop-blur-xl bg-background/95 border-l border-border/30 p-5 flex flex-col shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-2 mt-12 flex-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "text-sm py-2 px-3 rounded-lg transition-colors",
                        isActive ? "text-primary bg-primary/10 font-semibold" : "hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLoginClick(); }}
                  className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {isLoggedIn ? "My Account" : "Login"}
                </button>
              </div>

              <Link
                to="/meeting"
                onClick={() => setMobileMenuOpen(false)}
                className="glass-button px-5 py-2.5 rounded-full text-center text-sm font-medium hover:scale-105 transition-transform mt-auto"
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
