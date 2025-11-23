import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Facebook, Linkedin, Globe, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.png";
import { DomainChecker } from "@/components/DomainChecker";
import { ProductPurchaseModal } from "@/components/ProductPurchaseModal";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

export default function Home() {
  const [socialVisible, setSocialVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-20 md:mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full px-2 md:px-0 order-2 md:order-1"
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-glow">Designer</span> &{" "}
              <span className="text-primary">Developer</span>
            </motion.h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed">
              Crafting stunning UI/UX designs, building powerful web experiences, and
              creating premium digital products. Specialized in Elementor, WordPress,
              React, and modern web technologies.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link
                to="/portfolio"
                className="glass-button px-6 py-3 md:px-8 md:py-4 rounded-full font-medium hover:scale-105 transition-transform text-sm md:text-base"
              >
                View Portfolio
              </Link>
              <Link
                to="/contact"
                className="glass-card px-6 py-3 md:px-8 md:py-4 rounded-full font-medium hover:scale-105 transition-transform border-primary/30 text-sm md:text-base"
              >
                Contact Me
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full order-1 md:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative glass-card p-3 md:p-4 rounded-2xl md:rounded-3xl max-w-lg mx-auto md:max-w-none">
              <img
                src={heroImage}
                alt="RAHATUL ISLAM - Designer & Developer"
                className="w-full h-auto rounded-xl md:rounded-2xl object-cover"
              />

              <button
                onClick={() => setSocialVisible(!socialVisible)}
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 glass-button p-2 md:p-3 rounded-full hover:scale-110 transition z-10"
              >
                {socialVisible ? <Minus className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
              </button>

              {socialVisible && (
                <motion.div
                  className="absolute left-12 md:left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <motion.a
                    href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button p-3 md:p-4 rounded-full hover:scale-110 transition"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Facebook className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.a>
                  <motion.a
                    href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button p-3 md:p-4 rounded-full hover:scale-110 transition"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.a>
                  <motion.a
                    href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button p-3 md:p-4 rounded-full hover:scale-110 transition"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Globe className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.a>
                  <motion.a
                    href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button p-3 md:p-4 rounded-full hover:scale-110 transition"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.a>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Domain Checker */}
        <DomainChecker />

        {/* About/Skills Section */}
        <section className="mb-32">
          <motion.h2
            className="text-4xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What I <span className="text-primary">Do</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                {[
                  {
                    title: "UI/UX Design",
                    desc: "Creating intuitive, beautiful interfaces",
                  },
                  {
                    title: "Web Development",
                    desc: "Building responsive, fast websites",
                  },
                  {
                    title: "WordPress Expert",
                    desc: "Elementor Pro & Astra customization",
                  },
                  {
                    title: "Branding",
                    desc: "Complete brand identity solutions",
                  },
                  {
                    title: "Digital Products",
                    desc: "Premium themes & plugins",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="glass-card p-6 rounded-xl hover:scale-105 transition"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-semibold mb-6">Expertise</h3>
              {[
                { name: "UI/UX Design", level: 95 },
                { name: "Web Development", level: 92 },
                { name: "WordPress & Elementor", level: 98 },
                { name: "React & Next.js", level: 88 },
                { name: "Branding & Identity", level: 90 },
              ].map((skill, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-primary">{skill.level}%</span>
                  </div>
                  <div className="glass-card h-3 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              ))}

              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4">Tools & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Figma",
                    "Adobe XD",
                    "Photoshop",
                    "Illustrator",
                    "Elementor Pro",
                    "WordPress",
                    "Astra Theme",
                    "React",
                    "Next.js",
                    "TailwindCSS",
                    "Framer Motion",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="glass-card px-4 py-2 rounded-full text-sm hover:bg-primary/20 transition"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to="/contact"
                className="glass-button px-6 py-3 rounded-full inline-flex items-center gap-2 hover:scale-105 transition mt-8"
              >
                Download CV
                <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* AI Email Generator Section */}
        <section className="mb-32">
          <motion.div
            className="relative glass-premium p-12 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut"
              }}
            />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">
                  AI Email <span className="text-primary">Generator</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Generate professional email templates in seconds using our
                  AI-powered system.
                </p>
              </div>

              <div className="flex justify-center md:justify-end">
                <Link to="/email-generator">
                  <motion.button 
                    className="glass-button px-8 py-4 rounded-full text-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Try Now
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Featured Shop Section */}
        <section className="mb-32">
          <motion.h2
            className="text-4xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Featured <span className="text-primary">Products</span>
          </motion.h2>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {[
              ...Array(8).fill(null).map((_, i) => ({
                id: i + 1,
                name: `Premium Plugin ${i + 1}`,
                price: 29 + (i * 10),
                category: "Plugin",
                description: "Advanced WordPress plugin with premium features"
              })),
              ...Array(7).fill(null).map((_, i) => ({
                id: i + 9,
                name: `Premium Theme ${i + 1}`,
                price: 49 + (i * 10),
                category: "Theme",
                description: "Beautiful WordPress theme with modern design"
              })),
            ].slice(0, 15).map((product, i) => (
              <motion.div
                key={product.id}
                className="glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:scale-105 transition relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl sm:text-6xl font-bold opacity-50">
                    {product.category === "Plugin" ? "P" : "T"}
                  </span>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base truncate">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="glass-button px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:scale-110 transition text-xs sm:text-sm w-full sm:w-auto"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              to="/shop"
              className="glass-button px-12 py-3 sm:py-4 rounded-full font-medium text-base sm:text-lg hover:scale-105 transition-transform"
            >
              See All Products
            </Link>
          </motion.div>
        </section>

        {/* Client Testimonials Section */}
        <section className="mb-32">
          <motion.h2
            className="text-4xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Client <span className="text-primary">Testimonials</span>
          </motion.h2>

          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -1920],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[...Array(2)].flatMap(() =>
                [
                  {
                    name: "Sarah Johnson",
                    role: "CEO, TechStartup Inc",
                    image: "SJ",
                    quote: "Webejhar delivered an exceptional website that exceeded all our expectations.",
                  },
                  {
                    name: "Michael Chen",
                    role: "Marketing Director",
                    image: "MC",
                    quote: "Fast turnaround, excellent communication, and pixel-perfect results.",
                  },
                  {
                    name: "Emma Williams",
                    role: "Freelance Designer",
                    image: "EW",
                    quote: "The custom plugin saved me countless hours. Highly recommended!",
                  },
                  {
                    name: "David Brown",
                    role: "Business Owner",
                    image: "DB",
                    quote: "Professional and creative. My site is performing better than ever.",
                  },
                ].map((testimonial, i) => (
                  <motion.div
                    key={`${testimonial.name}-${i}`}
                    className="glass-card p-8 rounded-2xl min-w-[400px] flex-shrink-0"
                    style={{
                      transform: "perspective(1000px) rotateY(-5deg)",
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold">
                        {testimonial.image}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <svg
                          key={j}
                          className="w-5 h-5 fill-primary text-primary"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </section>
      </div>

      {/* Product Purchase Modal */}
      {selectedProduct && (
        <ProductPurchaseModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
