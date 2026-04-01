import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useState } from "react";
import { Palette, Code, Smartphone, Globe, Package, Zap } from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Beautiful, intuitive interfaces that users love",
    details:
      "From wireframes to high-fidelity prototypes, I create user-centered designs that look stunning and work flawlessly.",
  },
  {
    icon: Code,
    title: "Web Development",
    description: "Fast, responsive, SEO-optimized websites",
    details:
      "Building modern web applications with React, Next.js, and cutting-edge technologies.",
  },
  {
    icon: Globe,
    title: "WordPress Expert",
    description: "Elementor Pro & Astra theme customization",
    details:
      "Custom WordPress solutions with premium plugins, themes, and performance optimization.",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Mobile-first approach for all devices",
    details:
      "Ensuring your site looks perfect on desktop, tablet, and mobile with flawless responsiveness.",
  },
  {
    icon: Package,
    title: "Digital Products",
    description: "Premium themes & plugins for sale",
    details:
      "High-quality, well-coded digital products that solve real problems for developers and businesses.",
  },
  {
    icon: Zap,
    title: "Branding & Identity",
    description: "Complete brand identity solutions",
    details:
      "Logo design, brand guidelines, and visual identity that makes your business stand out.",
  },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-3 sm:px-4 pb-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My <span className="text-primary">Services</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 sm:mb-16 text-base sm:text-lg px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Comprehensive digital solutions tailored to your needs
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              className="glass-card p-6 sm:p-8 rounded-xl sm:rounded-2xl cursor-pointer hover:scale-105 transition-all relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() =>
                setSelectedService(selectedService === i ? null : i)
              }
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <service.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary mb-3 sm:mb-4 relative z-10" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 relative z-10">
                {service.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 relative z-10">
                {service.description}
              </p>

              {selectedService === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative z-10 mt-4 pt-4 border-t border-border"
                >
                  <p className="text-sm text-muted-foreground">
                    {service.details}
                  </p>
                  <button className="glass-button px-4 py-2 rounded-full mt-4 text-sm hover:scale-105 transition">
                    Request Quote
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
