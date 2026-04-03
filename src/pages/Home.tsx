import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Plus, Minus, Facebook, Linkedin, Globe, ExternalLink, ArrowRight, Code, Palette, Zap, Shield, Users, Award, Star, CheckCircle, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.png";
import { DomainChecker } from "@/components/DomainChecker";
import { ProductPurchaseModal } from "@/components/ProductPurchaseModal";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { CvDownloadDialog } from "@/components/CvDownloadDialog";

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
  const [cvDialogOpen, setCvDialogOpen] = useState(false);
  const navigate = useNavigate();

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
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground/70 mb-6 md:mb-8 leading-relaxed max-w-lg">
              I build custom WordPress and Elementor sites with a focus on clean design, speed, SEO, and real results. Explore my{" "}
              <Link to="/portfolio" className="text-muted-foreground/40 hover:text-primary/60 underline-offset-4 hover:underline transition-colors tracking-wide font-light italic">portfolio</Link>{" "}
              to see{" "}
              <Link to="/portfolio" className="text-muted-foreground/40 hover:text-primary/60 underline-offset-4 hover:underline transition-colors tracking-wide font-light italic">my work</Link>.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link to="/portfolio" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:shadow-[0_0_25px_hsl(var(--primary)/0.5)] transition-all duration-300 hover:scale-105">
                Explore My Work
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contact" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/30 text-foreground font-medium hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-all duration-300 hover:scale-105">
                Let's Talk
                <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
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
                  <motion.div key={i} className="glass-card p-6 rounded-xl hover:scale-[1.02] transition" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
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
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/30 font-medium text-sm hover:border-primary/60 transition-colors mt-8">
                Download CV <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Portfolio Showcase */}
        <section className="mb-32">
          <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Recent <span className="text-primary">Projects</span>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                A showcase of my latest work
              </p>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm group"
            >
              View All Projects
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="relative space-y-0">
            {portfolios.map((item, index) => (
              <motion.div
                key={item.id}
                className="glass-card rounded-2xl overflow-hidden relative shadow-lg"
                style={{
                  position: "sticky",
                  top: `${80 + index * 50}px`,
                  zIndex: index + 1,
                  marginBottom: index < portfolios.length - 1 ? "20px" : "0px",
                }}
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-1/2 relative overflow-hidden group">
                    {item.images && item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover min-h-[220px] md:min-h-[300px] group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[220px] md:min-h-[300px] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <Code className="w-12 h-12 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-mono text-muted-foreground/60 bg-background/70 backdrop-blur-sm px-2 py-1 rounded-full">
                        Portfolio-{index + 1}
                      </span>
                    </div>
                    {item.category && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-background/80 backdrop-blur-sm border border-border/50 font-medium">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Details */}
                  <div className="md:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col justify-center space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold">{item.title}</h3>
                    {item.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                    {item.technologies_used && item.technologies_used.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.technologies_used.slice(0, 5).map((tech, i) => (
                          <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary/80 border border-primary/20">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/portfolio?project=${item.id}`)}
                      className="inline-flex items-center gap-1.5 text-primary text-sm font-medium group mt-3 w-fit"
                    >
                      <span className="border-b border-transparent group-hover:border-primary transition-colors">
                        Visit Details
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Spacer for last sticky card */}
            <div style={{ height: `${portfolios.length * 50}px` }} />
          </div>
        </section>

        {/* Process / How I Work */}
        <section className="mb-32">
          <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold mb-4">
              How I <span className="text-primary">Work</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">A streamlined process to deliver exceptional results</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: "Understanding your goals, target audience, and project requirements." },
              { step: "02", title: "Design", desc: "Creating wireframes and visual designs with revisions until perfect." },
              { step: "03", title: "Development", desc: "Building with clean, scalable code and regular progress updates." },
              { step: "04", title: "Launch", desc: "Testing, deployment, and post-launch support." },
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

        {/* Stats */}
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
              { title: "Pixel-Perfect Design", desc: "Every detail carefully crafted for a flawless experience across all devices." },
              { title: "Fast Delivery", desc: "Efficient workflows and clear communication for on-time delivery." },
              { title: "Clean & Scalable Code", desc: "Well-structured, maintainable code ready for future growth." },
              { title: "Ongoing Support", desc: "Post-launch maintenance and dedicated support." },
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

        {/* AI Email Generator */}
        <section className="mb-32">
          <motion.div className="relative glass-premium p-12 rounded-3xl overflow-hidden" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }} />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4">Email <span className="text-primary">Generator</span></h2>
                <p className="text-muted-foreground text-lg">Generate professional email templates in seconds.</p>
              </div>
              <div className="flex justify-center md:justify-end">
                <Link to="/email-generator">
                  <motion.button className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Try Now <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
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
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">Let's collaborate and bring your vision to life. Get a free consultation today.</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  Start a Project <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/meeting" className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-primary/30 font-medium hover:border-primary/60 transition-colors">
                  Book a Meeting
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Testimonials - Dynamic from DB */}
        <TestimonialsCarousel />
      </div>

      {selectedProduct && (
        <ProductPurchaseModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
      )}
    </div>
  );
}
