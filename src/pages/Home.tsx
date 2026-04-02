import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Plus, Minus, Facebook, Linkedin, Globe, ExternalLink, ArrowRight, Code, Palette, Zap, Shield, Users, Award, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.png";
import { DomainChecker } from "@/components/DomainChecker";
import { ProductPurchaseModal } from "@/components/ProductPurchaseModal";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  category: string | null;
  tags: string[] | null;
  project_url: string | null;
  live_url: string | null;
  technologies_used: string[] | null;
  is_featured: boolean;
}

export default function Home() {
  const [socialVisible, setSocialVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadPortfolios = async () => {
      const { data } = await supabase
        .from("provider_portfolios")
        .select("id, title, description, images, category, tags, project_url, live_url, technologies_used, is_featured")
        .order("created_at", { ascending: false })
        .limit(6);
      if (data) setPortfolios(data);
    };
    loadPortfolios();
  }, []);

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-3 sm:px-4 w-full max-w-full overflow-x-hidden">
      <SEOHead title="Home" description="Professional UI/UX design, web development, and WordPress solutions by Webejhar." />
      <div className="max-w-7xl mx-auto w-full">
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
              <Link to="/portfolio" className="glass-button px-6 py-3 md:px-8 md:py-4 rounded-full font-medium hover:scale-105 transition-transform text-sm md:text-base">
                View Portfolio
              </Link>
              <Link to="/contact" className="glass-card px-6 py-3 md:px-8 md:py-4 rounded-full font-medium hover:scale-105 transition-transform border-primary/30 text-sm md:text-base">
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
              <img src={heroImage} alt="RAHATUL ISLAM - Designer & Developer" className="w-full h-auto rounded-xl md:rounded-2xl object-cover" />
              <button onClick={() => setSocialVisible(!socialVisible)} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 glass-button p-2 md:p-3 rounded-full hover:scale-110 transition z-10">
                {socialVisible ? <Minus className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              {socialVisible && (
                <motion.div className="absolute left-12 md:left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 md:gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  {[
                    { icon: Facebook, delay: 0.1 },
                    { icon: Linkedin, delay: 0.2 },
                    { icon: Globe, delay: 0.3 },
                    { icon: ExternalLink, delay: 0.4 },
                  ].map(({ icon: Icon, delay }, i) => (
                    <motion.a key={i} href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="glass-button p-3 md:p-4 rounded-full hover:scale-110 transition" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay }}>
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>

        <DomainChecker />

        {/* What I Do Section */}
        <section className="mb-32">
          <motion.h2 className="text-4xl font-bold mb-12 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            What I <span className="text-primary">Do</span>
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <div className="space-y-6">
                {[
                  { title: "UI/UX Design", desc: "Creating intuitive, beautiful interfaces" },
                  { title: "Web Development", desc: "Building responsive, fast websites" },
                  { title: "WordPress Expert", desc: "Elementor Pro & Astra customization" },
                  { title: "Branding", desc: "Complete brand identity solutions" },
                  { title: "Digital Products", desc: "Premium themes & plugins" },
                ].map((item, i) => (
                  <motion.div key={i} className="glass-card p-6 rounded-xl hover:scale-105 transition" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
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
                    <motion.div className="h-full bg-gradient-to-r from-primary to-accent" initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }} />
                  </div>
                </div>
              ))}
              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4">Tools & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {["Figma", "Adobe XD", "Photoshop", "Illustrator", "Elementor Pro", "WordPress", "Astra Theme", "React", "Next.js", "TailwindCSS", "Framer Motion"].map((tech) => (
                    <span key={tech} className="glass-card px-4 py-2 rounded-full text-sm hover:bg-primary/20 transition">{tech}</span>
                  ))}
                </div>
              </div>
              <Link to="/contact" className="glass-button px-6 py-3 rounded-full inline-flex items-center gap-2 hover:scale-105 transition mt-8">
                Download CV <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Portfolio Showcase */}
        <section className="mb-32">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4">
              Recent <span className="text-primary">Projects</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A showcase of my latest work — from custom websites to full-stack applications
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((item, index) => (
              <motion.div
                key={item.id}
                className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="relative h-48 overflow-hidden">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Code className="w-12 h-12 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="flex gap-2">
                      {item.live_url && (
                        <a href={item.live_url} target="_blank" rel="noopener noreferrer" className="glass-button p-2 rounded-full text-xs" onClick={e => e.stopPropagation()}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {item.project_url && (
                        <a href={item.project_url} target="_blank" rel="noopener noreferrer" className="glass-button p-2 rounded-full text-xs" onClick={e => e.stopPropagation()}>
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  {item.is_featured && (
                    <Badge className="absolute top-3 left-3 bg-primary/90">Featured</Badge>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs shrink-0">{item.category}</Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  {item.technologies_used && item.technologies_used.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.technologies_used.slice(0, 4).map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tech}</span>
                      ))}
                      {item.technologies_used.length > 4 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{item.technologies_used.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {portfolios.length > 0 && (
            <motion.div className="text-center mt-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <Link to="/portfolio" className="glass-button px-8 py-3 rounded-full inline-flex items-center gap-2 hover:scale-105 transition font-medium">
                View All Projects <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </section>

        {/* Services Overview */}
        <section className="mb-32">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4">
              Services <span className="text-primary">Offered</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">End-to-end digital solutions tailored to your business needs</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Palette, title: "UI/UX Design", desc: "User-centered design with wireframes, prototypes, and pixel-perfect interfaces that convert visitors into customers.", color: "from-purple-500/20 to-pink-500/20" },
              { icon: Code, title: "Full-Stack Development", desc: "Custom web apps with React, Next.js, Node.js, and modern frameworks. From landing pages to complex platforms.", color: "from-blue-500/20 to-cyan-500/20" },
              { icon: Globe, title: "WordPress Solutions", desc: "Expert Elementor Pro builds, custom themes, WooCommerce stores, and plugin development for any business.", color: "from-green-500/20 to-emerald-500/20" },
              { icon: Zap, title: "Speed Optimization", desc: "Performance auditing, Core Web Vitals optimization, and caching strategies for blazing-fast websites.", color: "from-yellow-500/20 to-orange-500/20" },
              { icon: Shield, title: "SEO & Security", desc: "On-page SEO, technical audits, SSL configuration, malware protection, and security hardening.", color: "from-red-500/20 to-rose-500/20" },
              { icon: Users, title: "Consulting & Support", desc: "Strategic tech consulting, ongoing maintenance, training sessions, and dedicated support plans.", color: "from-indigo-500/20 to-violet-500/20" },
            ].map((service, i) => (
              <motion.div
                key={i}
                className="glass-card p-6 rounded-2xl hover:scale-[1.03] transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Process / How I Work */}
        <section className="mb-32">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4">
              How I <span className="text-primary">Work</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A streamlined process to deliver exceptional results on every project</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: "Understanding your goals, target audience, and project requirements through in-depth consultation." },
              { step: "02", title: "Design", desc: "Creating wireframes and visual designs with multiple revisions until the perfect look is achieved." },
              { step: "03", title: "Development", desc: "Building your project with clean, scalable code and regular progress updates throughout." },
              { step: "04", title: "Launch", desc: "Thorough testing, deployment, and post-launch support to ensure everything runs smoothly." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative glass-card p-6 rounded-2xl text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="text-5xl font-black text-primary/20 mb-3">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-primary/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats / Numbers */}
        <section className="mb-32">
          <motion.div
            className="glass-premium p-8 md:p-12 rounded-3xl"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "50+", label: "Projects Completed", icon: CheckCircle },
                { number: "30+", label: "Happy Clients", icon: Users },
                { number: "3+", label: "Years Experience", icon: Award },
                { number: "4.9", label: "Client Rating", icon: Star },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-black text-primary mb-1">{stat.number}</div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Why Choose Me */}
        <section className="mb-32">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="text-primary">Me</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Pixel-Perfect Design", desc: "Every detail is carefully crafted to ensure a flawless user experience across all devices and screen sizes." },
              { title: "Fast Delivery", desc: "Efficient workflows and clear communication mean your project is delivered on time, every time." },
              { title: "Clean & Scalable Code", desc: "Well-structured, maintainable code that's ready for future growth and easy to hand off." },
              { title: "Ongoing Support", desc: "Post-launch maintenance, updates, and dedicated support to keep your project running perfectly." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card p-6 rounded-2xl flex gap-4 items-start hover:scale-[1.02] transition-transform"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Email Generator Section */}
        <section className="mb-32">
          <motion.div className="relative glass-premium p-12 rounded-3xl overflow-hidden" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }} />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">AI Email <span className="text-primary">Generator</span></h2>
                <p className="text-muted-foreground text-lg">Generate professional email templates in seconds using our AI-powered system.</p>
              </div>
              <div className="flex justify-center md:justify-end">
                <Link to="/email-generator">
                  <motion.button className="glass-button px-8 py-4 rounded-full text-lg font-medium" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Try Now
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="mb-32">
          <motion.div
            className="glass-card p-8 md:p-14 rounded-3xl text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Have a Project in <span className="text-primary">Mind?</span></h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">Let's collaborate and bring your vision to life. Get a free consultation and project estimate today.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/contact" className="glass-button px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform inline-flex items-center gap-2">
                  Start a Project <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/meeting" className="glass-card px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform border-primary/30">
                  Book a Meeting
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Client Testimonials */}
        <section className="mb-32">
          <motion.h2 className="text-4xl font-bold mb-12 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            Client <span className="text-primary">Testimonials</span>
          </motion.h2>
          <div className="relative overflow-hidden">
            <motion.div className="flex gap-6" animate={{ x: [0, -1920] }} transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" } }}>
              {[...Array(2)].flatMap(() =>
                [
                  { name: "Sarah Johnson", role: "CEO, TechStartup Inc", image: "SJ", quote: "Webejhar delivered an exceptional website that exceeded all our expectations." },
                  { name: "Michael Chen", role: "Marketing Director", image: "MC", quote: "Fast turnaround, excellent communication, and pixel-perfect results." },
                  { name: "Emma Williams", role: "Freelance Designer", image: "EW", quote: "The custom plugin saved me countless hours. Highly recommended!" },
                  { name: "David Brown", role: "Business Owner", image: "DB", quote: "Professional and creative. My site is performing better than ever." },
                ].map((testimonial, i) => (
                  <motion.div key={`${testimonial.name}-${i}`} className="glass-card p-8 rounded-2xl min-w-[350px] sm:min-w-[400px] flex-shrink-0" style={{ transform: "perspective(1000px) rotateY(-5deg)" }}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold">{testimonial.image}</div>
                      <div>
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <svg key={j} className="w-5 h-5 fill-primary text-primary" viewBox="0 0 24 24">
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

      {selectedProduct && (
        <ProductPurchaseModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
      )}
    </div>
  );
}
