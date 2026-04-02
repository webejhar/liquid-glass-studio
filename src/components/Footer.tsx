import { Link, useLocation, useNavigate } from "react-router-dom";
import { Facebook, Linkedin, Globe, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [isChatActive, setIsChatActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const hideFooterPaths = ['/contact', '/meeting', '/about', '/email-generator', '/login', '/register', '/forgot-password', '/account'];

  useEffect(() => {
    const checkChatActive = () => setIsChatActive(document.body.classList.contains('chat-active'));
    checkChatActive();
    const observer = new MutationObserver(checkChatActive);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (hideFooterPaths.includes(location.pathname) || location.pathname.startsWith('/admin') || (isChatActive && window.innerWidth < 768)) {
    return null;
  }

  const handleAdminAccess = () => {
    if (secretKey === "R40A12H53A11") {
      setShowAdminDialog(false);
      setSecretKey("");
      navigate("/admin/login");
    } else {
      setShowAdminDialog(false);
      setSecretKey("");
    }
  };

  return (
    <footer className="relative z-10 mt-20 mx-4 mb-4">
      {/* Expandable Full Footer */}
      <div
        className={`glass-card rounded-t-2xl overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[600px] opacity-100 p-6 sm:p-8" : "max-h-0 opacity-0 p-0"
        }`}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-3">Webejhar</h3>
            <p className="text-muted-foreground text-sm mb-3">Creative Digital Designer & Developer</p>
            <Link to="/image-generator" className="text-muted-foreground hover:text-primary transition text-sm block mb-1">Image Generator</Link>
            <button onClick={() => setShowAdminDialog(true)} className="text-muted-foreground hover:text-primary transition text-sm">Admin</button>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { to: "/about", label: "About" },
                { to: "/services", label: "Services" },
                { to: "/portfolio", label: "Portfolio" },
                { to: "/shop", label: "Shop" },
              ].map(link => (
                <Link key={link.to} to={link.to} className="text-muted-foreground hover:text-primary transition text-sm">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { to: "/blog", label: "Blog" },
                { to: "/email-generator", label: "Email Generator" },
                { to: "/contact", label: "Contact" },
                { to: "/login", label: "Login" },
                { to: "/register", label: "Register" },
              ].map(link => (
                <Link key={link.to} to={link.to} className="text-muted-foreground hover:text-primary transition text-sm">{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <div className="flex gap-3 mb-3">
              {[Facebook, Linkedin, Globe].map((Icon, i) => (
                <a key={i} href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="glass-button p-2.5 rounded-full hover:scale-110 transition">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <a href="https://wa.me/8801340125311" target="_blank" rel="noopener noreferrer" className="glass-button px-4 py-2 rounded-full inline-block hover:scale-105 transition text-sm">
              WhatsApp Chat
            </a>
          </div>
        </div>
      </div>

      {/* Minimal Footer Bar */}
      <div
        className={`glass-card ${isExpanded ? 'rounded-b-2xl' : 'rounded-2xl'} px-4 sm:px-8 py-4 flex items-center justify-between`}
        onMouseEnter={() => setIsExpanded(true)}
      >
        <p className="text-muted-foreground text-xs sm:text-sm">
          &copy; 2025 <span className="text-primary font-semibold">Webejhar</span>. All rights reserved.
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`glass-button p-2 rounded-full hover:scale-110 transition-transform ${isExpanded ? 'rotate-180' : ''} transition-all duration-300`}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle className="text-center">Enter The Secret Key</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input type="password" placeholder="Secret Key" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()} className="glass-input" />
            <Button onClick={handleAdminAccess} variant="default" className="w-full">Go</Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};
