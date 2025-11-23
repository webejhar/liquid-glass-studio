import { Link, useLocation, useNavigate } from "react-router-dom";
import { Facebook, Linkedin, Globe } from "lucide-react";
import { useState } from "react";
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
  const hideFooterPaths = ['/contact', '/meeting', '/about', '/email-generator', '/login', '/register', '/forgot-password', '/account'];
  
  if (hideFooterPaths.includes(location.pathname) || location.pathname.startsWith('/admin')) {
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
    <footer className="relative z-10 glass-card mt-20 mx-4 mb-4 rounded-2xl px-4 sm:px-8 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout: 2 columns */}
        <div className="grid grid-cols-2 md:hidden gap-4 items-start">
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">Webejhar</h3>
            <p className="text-muted-foreground text-sm">
              Creative Digital Designer & Developer
            </p>
          </div>
          <div className="text-right space-y-2">
            <button
              onClick={() => setShowAdminDialog(true)}
              className="text-muted-foreground hover:text-primary transition text-sm underline-offset-4 hover:underline block ml-auto"
            >
              Admin
            </button>
            <a
              href="https://wa.me/8801340125311"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button px-3 py-1.5 rounded-full inline-block hover:scale-105 transition text-xs"
            >
              WhatsApp Chat
            </a>
          </div>
        </div>

        {/* Desktop Layout: 4 columns */}
        <div className="hidden md:grid grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">Webejhar</h3>
            <p className="text-muted-foreground mb-2">
              Creative Digital Designer & Developer
            </p>
            <button
              onClick={() => setShowAdminDialog(true)}
              className="text-muted-foreground hover:text-primary transition text-sm underline-offset-4 hover:underline"
            >
              Admin
            </button>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-muted-foreground hover:text-primary transition">
                About
              </Link>
              <Link to="/services" className="text-muted-foreground hover:text-primary transition">
                Services
              </Link>
              <Link to="/portfolio" className="text-muted-foreground hover:text-primary transition">
                Portfolio
              </Link>
              <Link to="/shop" className="text-muted-foreground hover:text-primary transition">
                Shop
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <div className="flex flex-col gap-2">
              <Link to="/blog" className="text-muted-foreground hover:text-primary transition">
                Blog
              </Link>
              <Link to="/email-generator" className="text-muted-foreground hover:text-primary transition">
                Email Generator
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition">
                Contact
              </Link>
              <Link to="/login" className="text-muted-foreground hover:text-primary transition">
                Login
              </Link>
              <Link to="/register" className="text-muted-foreground hover:text-primary transition">
                Register
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button p-3 rounded-full hover:scale-110 transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button p-3 rounded-full hover:scale-110 transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button p-3 rounded-full hover:scale-110 transition"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <a
              href="https://wa.me/8801340125311"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button px-4 py-2 rounded-full mt-4 inline-block hover:scale-105 transition text-sm"
            >
              WhatsApp Chat
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-border text-center text-muted-foreground text-xs sm:text-sm">
        <p>&copy; 2025 Webejhar. All rights reserved. | RAHATUL ISLAM</p>
      </div>

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle className="text-center">Enter The Secret Key</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Input
              type="password"
              placeholder="Secret Key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
              className="glass-input"
            />
            <Button
              onClick={handleAdminAccess}
              variant="default"
              className="w-full"
            >
              Go
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};
