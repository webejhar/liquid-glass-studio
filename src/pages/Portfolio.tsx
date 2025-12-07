import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, ExternalLink, Monitor, Tablet, Smartphone, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

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

interface PortfolioItem {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  project_url: string | null;
  images: string[] | null;
  tags: string[] | null;
  is_featured: boolean;
}

const defaultProjects = [
  {
    id: "default-1",
    title: "Modern Business Site",
    category: "Business",
    description: "Complete business website with admin panel",
    project_url: "https://tyzo.com.bd/",
    images: null,
    tags: ["React", "Next.js", "TailwindCSS"],
    is_featured: false
  },
  {
    id: "default-2",
    title: "Creative Agency",
    category: "Agency",
    description: "Stunning agency portfolio with animations",
    project_url: "https://tyzo.com.bd/",
    images: null,
    tags: ["Figma", "Webflow", "GSAP"],
    is_featured: false
  },
  {
    id: "default-3",
    title: "Learning Platform",
    category: "LMS",
    description: "Full-featured LMS with video streaming",
    project_url: "https://tyzo.com.bd/",
    images: null,
    tags: ["WordPress", "LearnDash", "Elementor"],
    is_featured: false
  },
  {
    id: "default-4",
    title: "Designer Portfolio",
    category: "Portfolio",
    description: "Interactive portfolio with case studies",
    project_url: "https://tyzo.com.bd/",
    images: null,
    tags: ["React", "Framer Motion", "Three.js"],
    is_featured: false
  },
  {
    id: "default-5",
    title: "Fashion E-commerce",
    category: "E-commerce",
    description: "Modern online store with cart & checkout",
    project_url: "https://tyzo.com.bd/",
    images: null,
    tags: ["React", "Stripe", "Supabase"],
    is_featured: false
  },
  {
    id: "default-6",
    title: "Product Landing",
    category: "Landing",
    description: "High-converting product landing page",
    project_url: "https://tyzo.com.bd/",
    images: null,
    tags: ["Figma", "HTML", "TailwindCSS"],
    is_featured: false
  },
];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [deviceView, setDeviceView] = useState<"laptop" | "tablet" | "mobile">("laptop");
  const [projects, setProjects] = useState<PortfolioItem[]>(defaultProjects);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from("provider_portfolios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Combine database portfolios with defaults
      const dbPortfolios: PortfolioItem[] = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        project_url: p.project_url,
        images: p.images,
        tags: p.tags,
        is_featured: p.is_featured || false
      }));

      setProjects([...dbPortfolios, ...defaultProjects]);
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

  const handleProjectClick = (project: PortfolioItem) => {
    setSelectedProject(project);
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-3 sm:px-4 pb-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My <span className="text-primary">Portfolio</span>
        </motion.h1>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`glass-card px-3 sm:px-5 py-1.5 sm:py-2 rounded-full transition text-xs sm:text-sm ${
                selectedCategory === cat
                  ? "bg-primary/20 border-primary"
                  : "hover:bg-primary/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          /* Responsive Grid: Desktop 3, Tablet 2, Mobile 2 */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                className="glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:scale-[1.02] transition group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleProjectClick(project)}
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                  {project.images && project.images[0] ? (
                    <img 
                      src={project.images[0]} 
                      alt={project.title}
                      className="w-full h-full object-cover"
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
                </div>
                <div className="p-3 sm:p-5">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <h3 className="text-sm sm:text-lg font-semibold truncate">{project.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectClick(project);
                      }}
                      className="glass-button p-1.5 sm:p-2 rounded-full hover:scale-110 transition shrink-0"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  {project.category && (
                    <Badge variant="outline" className="text-xs mb-2">{project.category}</Badge>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                  {project.tags && (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full glass-card"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Portfolio Details Modal */}
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="glass-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                    {selectedProject.title}
                  </h2>
                  {selectedProject.category && (
                    <Badge className="mb-2">{selectedProject.category}</Badge>
                  )}
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="glass-button p-2 rounded-full flex-shrink-0 hover:scale-105 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Project Brief</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    {selectedProject.description}
                  </p>

                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {selectedProject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-4 py-2 rounded-full glass-card"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Images Gallery */}
                  {selectedProject.images && selectedProject.images.length > 0 && (
                    <>
                      <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Gallery</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                        {selectedProject.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt={`${selectedProject.title} - ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {selectedProject.project_url && (
                    <a
                      href={selectedProject.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-button px-6 py-3 rounded-full inline-flex items-center gap-2 hover:scale-105 transition"
                    >
                      Live Preview
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div>
                  {selectedProject.project_url && (
                    <>
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => setDeviceView("laptop")}
                          className={`glass-button p-2 rounded-lg ${
                            deviceView === "laptop" && "bg-primary/20"
                          }`}
                        >
                          <Monitor className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeviceView("tablet")}
                          className={`glass-button p-2 rounded-lg ${
                            deviceView === "tablet" && "bg-primary/20"
                          }`}
                        >
                          <Tablet className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeviceView("mobile")}
                          className={`glass-button p-2 rounded-lg ${
                            deviceView === "mobile" && "bg-primary/20"
                          }`}
                        >
                          <Smartphone className="w-5 h-5" />
                        </button>
                      </div>

                      <div
                        className={`glass-card rounded-xl overflow-hidden transition-all ${
                          deviceView === "laptop"
                            ? "w-full"
                            : deviceView === "tablet"
                            ? "w-3/4 mx-auto"
                            : "w-1/2 mx-auto"
                        }`}
                      >
                        <iframe
                          src={selectedProject.project_url}
                          className="w-full h-96 border-0"
                          title="Preview"
                        />
                      </div>
                    </>
                  )}

                  {!selectedProject.project_url && selectedProject.images && selectedProject.images[0] && (
                    <div className="glass-card rounded-xl overflow-hidden">
                      <img 
                        src={selectedProject.images[0]} 
                        alt={selectedProject.title}
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  {!selectedProject.project_url && (!selectedProject.images || selectedProject.images.length === 0) && (
                    <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Image className="w-16 h-16 mb-4 opacity-50" />
                      <p>No preview available</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
