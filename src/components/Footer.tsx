import { Link, useLocation } from "react-router-dom";
import { Facebook, Linkedin, Globe } from "lucide-react";

export const Footer = () => {
  const location = useLocation();
  const hideFooterPaths = ['/contact', '/meeting', '/about', '/email-generator', '/login', '/register', '/forgot-password'];
  
  if (hideFooterPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="relative z-10 glass-card mt-20 mx-4 mb-4 rounded-2xl px-8 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-primary mb-4">Webejhar</h3>
          <p className="text-muted-foreground">
            Creative Digital Designer & Developer
          </p>
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

      <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
        <p>&copy; 2025 Webejhar. All rights reserved. | RAHATUL ISLAM</p>
      </div>
    </footer>
  );
};
