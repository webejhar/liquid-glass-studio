import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu, User, ChevronRight } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const hideHeader =
    ["/contact", "/meeting", "/about", "/email-generator", "/image-generator", "/login", "/register", "/forgot-password", "/account"].includes(location.pathname) ||
    location.pathname.startsWith("/admin");

  const [isChatActive, setIsChatActive] = useState(false);

  const currentPage = menuItems.find(item => item.path === location.pathname)?.label || "Menu";

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLoginClick = () => navigate(isLoggedIn ? "/account" : "/login");

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setMenuOpen(false), 250);
  };

  if (hideHeader || (isChatActive && window.innerWidth < 768)) return null;

  return (
    <>
      <header className="sticky top-0 left-0 right-0 w-full z-50 backdrop-blur-xl bg-background/80 border-b border-border/30 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo + Menu trigger */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center shrink-0">
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

              {/* Desktop horizontal menu trigger */}
              <div
                ref={menuRef}
                className="relative hidden md:block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-primary/10 hover:text-primary",
                    menuOpen ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  {currentPage}
                  <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200", menuOpen && "rotate-90")} />
                </button>

                {/* Horizontal flyout to the right */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scaleX: 0.95 }}
                      animate={{ opacity: 1, x: 0, scaleX: 1 }}
                      exit={{ opacity: 0, x: -8, scaleX: 0.95 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute top-0 left-full ml-2 flex items-center gap-1 py-1.5 px-2 rounded-xl border border-border/50 backdrop-blur-xl bg-background/95 shadow-xl z-50 origin-left whitespace-nowrap"
                    >
                      {menuItems.map((item, i) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03, duration: 0.15 }}
                          >
                            <Link
                              to={item.path}
                              onClick={() => setMenuOpen(false)}
                              className={cn(
                                "block px-3 py-1.5 text-xs rounded-lg transition-all duration-200",
                                isActive
                                  ? "text-primary bg-primary/15 font-semibold shadow-[0_0_12px_rgba(51,187,238,0.3)]"
                                  : "text-foreground hover:text-primary hover:bg-primary/10"
                              )}
                            >
                              {item.label}
                            </Link>
                          </motion.div>
                        );
                      })}

                      {/* Account inside horizontal menu */}
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: menuItems.length * 0.03, duration: 0.15 }}
                        className="border-l border-border/30 pl-1 ml-1"
                      >
                        <button
                          onClick={() => { setMenuOpen(false); handleLoginClick(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                        >
                          <User className="w-3.5 h-3.5" />
                          {isLoggedIn ? "Account" : "Login"}
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop: Meeting button */}
            <div className="hidden md:flex items-center">
              <Link
                to="/meeting"
                className="glass-button px-5 py-2 rounded-full text-xs font-medium hover:scale-105 transition-transform"
              >
                Meeting
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="flex items-center gap-1 md:hidden">
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
              className="absolute right-0 top-0 h-full w-64 max-w-[75vw] backdrop-blur-xl bg-background/95 border-l border-border/30 p-5 flex flex-col shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col gap-2 mt-14 flex-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "text-sm py-2.5 px-4 rounded-lg transition-all duration-200",
                        isActive
                          ? "text-primary bg-primary/15 font-semibold shadow-[0_0_12px_rgba(51,187,238,0.3)]"
                          : "hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLoginClick(); }}
                  className="flex items-center gap-2 text-sm py-2.5 px-4 rounded-lg hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {isLoggedIn ? "My Account" : "Login"}
                </button>
              </div>

              <Link
                to="/meeting"
                onClick={() => setMobileMenuOpen(false)}
                className="glass-button px-5 py-3 rounded-full text-center text-sm font-medium hover:scale-105 transition-transform mt-auto"
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
