import { motion } from "framer-motion";
import { useState } from "react";
import { Check, ExternalLink, Monitor, Tablet, Smartphone } from "lucide-react";

const categories = [
  "All",
  "Business",
  "Agency",
  "LMS",
  "Portfolio",
  "E-commerce",
  "Landing",
  "Branding",
];

const projects = [
  {
    title: "Modern Business Site",
    category: "Business",
    role: "Full-stack",
    description: "Complete business website with admin panel",
    tech: ["React", "Next.js", "TailwindCSS"],
    url: "https://tyzo.com.bd/",
  },
  {
    title: "Creative Agency",
    category: "Agency",
    role: "Designer",
    description: "Stunning agency portfolio with animations",
    tech: ["Figma", "Webflow", "GSAP"],
    url: "https://tyzo.com.bd/",
  },
  {
    title: "Learning Platform",
    category: "LMS",
    role: "Developer",
    description: "Full-featured LMS with video streaming",
    tech: ["WordPress", "LearnDash", "Elementor"],
    url: "https://tyzo.com.bd/",
  },
  {
    title: "Designer Portfolio",
    category: "Portfolio",
    role: "Full-stack",
    description: "Interactive portfolio with case studies",
    tech: ["React", "Framer Motion", "Three.js"],
    url: "https://tyzo.com.bd/",
  },
  {
    title: "Fashion E-commerce",
    category: "E-commerce",
    role: "Full-stack",
    description: "Modern online store with cart & checkout",
    tech: ["React", "Stripe", "Supabase"],
    url: "https://tyzo.com.bd/",
  },
  {
    title: "Product Landing",
    category: "Landing",
    role: "Designer",
    description: "High-converting product landing page",
    tech: ["Figma", "HTML", "TailwindCSS"],
    url: "https://tyzo.com.bd/",
  },
];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [deviceView, setDeviceView] = useState<"laptop" | "tablet" | "mobile">(
    "laptop"
  );

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My <span className="text-primary">Portfolio</span>
        </motion.h1>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`glass-card px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition text-sm sm:text-base ${
                selectedCategory === cat
                  ? "bg-primary/20 border-primary"
                  : "hover:bg-primary/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, i) => (
            <motion.div
              key={i}
              className="glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:scale-105 transition group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold opacity-50">
                  {project.title[0]}
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg sm:text-xl font-semibold">{project.title}</h3>
                  <button
                    onClick={() =>
                      setSelectedProject(selectedProject === i ? null : i)
                    }
                    className="glass-button p-2 rounded-full hover:scale-110 transition"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {project.role}
                </p>
                <p className="text-muted-foreground mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-3 py-1 rounded-full glass-card"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedProject !== null && (
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
                    {filteredProjects[selectedProject].category} Website
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Role: {filteredProjects[selectedProject].role}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="glass-button p-2 rounded-full flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Project Brief</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                    {filteredProjects[selectedProject].description}
                  </p>

                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {filteredProjects[selectedProject].tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 rounded-full glass-card"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <a
                    href={filteredProjects[selectedProject].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button px-6 py-3 rounded-full inline-flex items-center gap-2 hover:scale-105 transition"
                  >
                    Live Preview
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div>
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
                      src={filteredProjects[selectedProject].url}
                      className="w-full h-96 border-0"
                      title="Preview"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
