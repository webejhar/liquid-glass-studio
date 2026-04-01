import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { ExternalLink, Monitor, Tablet, Smartphone, X, Image, ChevronDown, Github, MessageSquare, HelpCircle, List, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const categories = [
  "All",
  "Business",
  "Agency",
  "LMS",
  "Portfolio",
  "E-commerce",
  "Landing",
  "Branding",
  "Web Development",
  "UI/UX Design",
  "Graphics Design",
];

interface FaqItem {
  question: string;
  answer: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  project_url: string | null;
  images: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
  faq: FaqItem[] | null;
  bullets: string[] | null;
  client_name: string | null;
  completion_date: string | null;
  technologies_used: string[] | null;
  live_url: string | null;
  github_url: string | null;
  testimonial: string | null;
  budget_range: string | null;
  duration: string | null;
}

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [deviceView, setDeviceView] = useState<"laptop" | "tablet" | "mobile">("laptop");
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from("provider_portfolios")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      const dbPortfolios: PortfolioItem[] = (data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        project_url: p.project_url,
        images: p.images,
        tags: p.tags,
        is_featured: p.is_featured || false,
        faq: Array.isArray(p.faq) ? p.faq : [],
        bullets: p.bullets || [],
        client_name: p.client_name,
        completion_date: p.completion_date,
        technologies_used: p.technologies_used || [],
        live_url: p.live_url,
        github_url: p.github_url,
        testimonial: p.testimonial,
        budget_range: p.budget_range,
        duration: p.duration,
      }));

      setProjects(dbPortfolios);
    } catch (error) {
      console.error("Error loading portfolios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  const deviceSizes = {
    laptop: { width: "100%", maxWidth: "100%" },
    tablet: { width: "768px", maxWidth: "768px" },
    mobile: { width: "375px", maxWidth: "375px" },
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 px-3 sm:px-4 pb-20 w-full max-w-full overflow-x-hidden">
      <SEOHead title="Portfolio" description="View our portfolio of web design and development projects." />
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Our <span className="text-primary">Portfolio</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-6 max-w-xl mx-auto text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Explore our completed projects across various categories
        </motion.p>

        {/* Category Filter Dropdown */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-56 glass-card">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-xl">
            <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No portfolio items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                className="glass-card rounded-xl overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => { setSelectedProject(project); setSelectedImageIdx(0); setDeviceView("laptop"); }}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                  {project.images && project.images[0] ? (
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold opacity-50">
                      {project.title[0]}
                    </span>
                  )}
                  {project.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold truncate mb-1">{project.title}</h3>
                  {project.category && (
                    <Badge variant="outline" className="text-xs mb-2">{project.category}</Badge>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Fullscreen Portfolio Detail */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              className="fixed inset-0 z-50 bg-background overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Top bar */}
              <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/90 border-b border-border/30 px-4 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-sm sm:text-base truncate">{selectedProject.title}</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="glass-button p-2 rounded-full hover:scale-105 transition shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-8">
                {/* Hero section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Gallery */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    {selectedProject.images && selectedProject.images.length > 0 ? (
                      <div className="space-y-3">
                        <div className="glass-card rounded-xl overflow-hidden aspect-video">
                          <img
                            src={selectedProject.images[selectedImageIdx]}
                            alt={selectedProject.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {selectedProject.images.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {selectedProject.images.map((img, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImageIdx(idx)}
                                className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                                  idx === selectedImageIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                              >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="glass-card rounded-xl aspect-video flex items-center justify-center">
                        <Image className="w-16 h-16 text-muted-foreground opacity-30" />
                      </div>
                    )}
                  </motion.div>

                  {/* Details */}
                  <motion.div className="space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{selectedProject.title}</h1>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedProject.category && <Badge>{selectedProject.category}</Badge>}
                        {selectedProject.is_featured && <Badge variant="secondary">⭐ Featured</Badge>}
                      </div>
                    </div>

                    {selectedProject.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedProject.description}</p>
                    )}

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {selectedProject.client_name && (
                        <div className="glass-card p-3 rounded-lg">
                          <span className="text-muted-foreground block mb-1">Client</span>
                          <span className="font-medium">{selectedProject.client_name}</span>
                        </div>
                      )}
                      {selectedProject.duration && (
                        <div className="glass-card p-3 rounded-lg">
                          <span className="text-muted-foreground block mb-1">Duration</span>
                          <span className="font-medium">{selectedProject.duration}</span>
                        </div>
                      )}
                      {selectedProject.budget_range && (
                        <div className="glass-card p-3 rounded-lg">
                          <span className="text-muted-foreground block mb-1">Budget</span>
                          <span className="font-medium">{selectedProject.budget_range}</span>
                        </div>
                      )}
                      {selectedProject.completion_date && (
                        <div className="glass-card p-3 rounded-lg">
                          <span className="text-muted-foreground block mb-1">Completed</span>
                          <span className="font-medium">{selectedProject.completion_date}</span>
                        </div>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-2">
                      {(selectedProject.live_url || selectedProject.project_url) && (
                        <a
                          href={selectedProject.live_url || selectedProject.project_url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-button px-4 py-2 rounded-full text-xs inline-flex items-center gap-2 hover:scale-105 transition"
                        >
                          <ExternalLink className="w-3 h-3" /> Live Preview
                        </a>
                      )}
                      {selectedProject.github_url && (
                        <a
                          href={selectedProject.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="glass-button px-4 py-2 rounded-full text-xs inline-flex items-center gap-2 hover:scale-105 transition"
                        >
                          <Github className="w-3 h-3" /> GitHub
                        </a>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Bullets / Key Features */}
                {selectedProject.bullets && selectedProject.bullets.length > 0 && (
                  <motion.div className="glass-card p-5 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <List className="w-4 h-4 text-primary" /> Key Features
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProject.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Tech Stack */}
                {((selectedProject.tags && selectedProject.tags.length > 0) || (selectedProject.technologies_used && selectedProject.technologies_used.length > 0)) && (
                  <motion.div className="glass-card p-5 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <h3 className="font-semibold mb-3">Technologies & Tools</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...(selectedProject.technologies_used || []), ...(selectedProject.tags || [])].map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Testimonial */}
                {selectedProject.testimonial && (
                  <motion.div className="glass-card p-5 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" /> Client Testimonial
                    </h3>
                    <blockquote className="text-sm text-muted-foreground italic border-l-2 border-primary pl-4">
                      "{selectedProject.testimonial}"
                      {selectedProject.client_name && (
                        <span className="block mt-2 not-italic font-medium text-foreground">— {selectedProject.client_name}</span>
                      )}
                    </blockquote>
                  </motion.div>
                )}

                {/* FAQ */}
                {selectedProject.faq && selectedProject.faq.length > 0 && (
                  <motion.div className="glass-card p-5 rounded-xl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-primary" /> FAQ
                    </h3>
                    <Accordion type="multiple" className="w-full">
                      {selectedProject.faq.map((item, i) => (
                        <AccordionItem key={i} value={`faq-${i}`}>
                          <AccordionTrigger className="text-sm">{item.question}</AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">{item.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                )}

                {/* Responsive Preview */}
                {(selectedProject.live_url || selectedProject.project_url) && (
                  <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h3 className="font-semibold">Live Preview</h3>
                    <div className="flex gap-2 mb-3">
                      {[
                        { key: "laptop" as const, icon: Monitor, label: "Desktop (1280px)" },
                        { key: "tablet" as const, icon: Tablet, label: "Tablet (768px)" },
                        { key: "mobile" as const, icon: Smartphone, label: "Mobile (375px)" },
                      ].map(({ key, icon: Icon, label }) => (
                        <button
                          key={key}
                          onClick={() => setDeviceView(key)}
                          title={label}
                          className={`glass-button p-2 rounded-lg transition ${deviceView === key ? "bg-primary/20 text-primary" : ""}`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <div
                        className="glass-card rounded-xl overflow-hidden transition-all duration-300 border-2 border-border/50"
                        style={deviceSizes[deviceView]}
                      >
                        <iframe
                          src={selectedProject.live_url || selectedProject.project_url!}
                          className="w-full border-0"
                          style={{ height: deviceView === "mobile" ? "667px" : deviceView === "tablet" ? "600px" : "500px" }}
                          title="Preview"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
