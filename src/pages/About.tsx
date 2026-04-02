import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import {
  Code, Palette, Globe, Smartphone, Zap, Users,
  Award, Briefcase, GraduationCap, Heart, Star,
  Monitor, PenTool, Database, Layers, TrendingUp, Clock,
  MessageSquare, Target, Lightbulb, Rocket, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const skills = [
  { name: "WordPress & Elementor Pro", level: 95, icon: Globe },
  { name: "UI/UX Design", level: 90, icon: Palette },
  { name: "React & Next.js", level: 85, icon: Code },
  { name: "Responsive Design", level: 92, icon: Smartphone },
  { name: "SEO Optimization", level: 88, icon: TrendingUp },
  { name: "Database & Backend", level: 80, icon: Database },
];

const techStack = [
  { name: "WordPress", icon: Globe },
  { name: "Elementor Pro", icon: Layers },
  { name: "React", icon: Code },
  { name: "Next.js", icon: Monitor },
  { name: "TypeScript", icon: Code },
  { name: "Tailwind CSS", icon: Palette },
  { name: "Figma", icon: PenTool },
  { name: "Photoshop", icon: Palette },
  { name: "Node.js", icon: Database },
  { name: "Supabase", icon: Database },
  { name: "WooCommerce", icon: Globe },
  { name: "SEO Tools", icon: TrendingUp },
  { name: "Git", icon: Code },
  { name: "REST API", icon: Zap },
  { name: "GraphQL", icon: Layers },
];

const experiences = [
  { year: "2022 - Present", role: "Senior Web Developer & Designer", company: "Freelance / Webejhar", desc: "Leading full-stack web development projects, creating premium WordPress themes, and delivering end-to-end digital solutions for clients worldwide." },
  { year: "2021 - 2022", role: "Web Designer & Developer", company: "Freelance", desc: "Specialized in Elementor Pro development, custom theme building, and responsive web design for small to medium businesses." },
  { year: "2020 - 2021", role: "Junior Web Developer", company: "Times IT", desc: "Started professional journey building WordPress websites, learning modern frameworks, and developing design skills." },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-3 sm:px-4 md:px-6 lg:px-8 pb-16 sm:pb-20">
      <SEOHead title="About" description="Learn about RAHATUL ISLAM - creative digital designer and developer at Webejhar." />

      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-20 lg:space-y-24">

        {/* Professional Introduction */}
        <motion.section {...fadeUp}>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6">
              <motion.div
                className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                About Me
              </motion.div>
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                I'm <span className="text-primary text-glow">RAHATUL ISLAM</span>,
                <br />
                <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl">Creative Developer & Designer</span>
              </motion.h1>
              <motion.p
                className="text-muted-foreground leading-relaxed text-sm sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                With over 4 years of dedicated experience in web development and design, I transform 
                digital ideas into exceptional online experiences. As the founder of <span className="text-primary font-semibold">Webejhar</span>, 
                I've had the privilege of collaborating with startups, agencies, and businesses across the globe — 
                helping them establish powerful digital presences that drive real results.
              </motion.p>
              <motion.p
                className="text-muted-foreground leading-relaxed text-sm sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                My approach combines creative design thinking with solid technical expertise. Whether it's 
                crafting pixel-perfect interfaces in Figma, building custom WordPress solutions with Elementor Pro, 
                or developing modern React applications — I bring passion, precision, and professionalism to every project.
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-2 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {["Creative Thinker", "Problem Solver", "Team Player", "Detail-Oriented", "Fast Learner"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs sm:text-sm bg-primary/10 text-primary border border-primary/20">
                    {tag}
                  </span>
                ))}
              </motion.div>
              <motion.div
                className="flex flex-wrap gap-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button variant="hero" size="lg" onClick={() => navigate("/contact")}>
                  <MessageSquare className="w-4 h-4" /> Hire Me
                </Button>
                <Button variant="glass" size="lg" onClick={() => navigate("/portfolio")}>
                  <Briefcase className="w-4 h-4" /> View Portfolio
                </Button>
              </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { value: "4+", label: "Years Experience", icon: Clock },
                { value: "150+", label: "Projects Completed", icon: Briefcase },
                { value: "120+", label: "Happy Clients", icon: Heart },
                { value: "50+", label: "5-Star Reviews", icon: Star },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl text-center group hover:border-primary/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary text-glow">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Skills & Technologies - Combined Section */}
        <motion.section {...fadeUp} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
            Skills & <span className="text-primary">Technologies</span>
          </h2>
          <p className="text-center text-muted-foreground mb-10 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
            The tools, technologies, and expertise that power every project I deliver
          </p>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-10">
            {/* Core Skills with Progress */}
            <div className="space-y-5">
              <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                Core Expertise
              </h3>
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  className="glass-card p-4 sm:p-5 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <skill.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm sm:text-base">{skill.name}</span>
                    </div>
                    <span className="text-primary font-semibold text-sm sm:text-base">{skill.level}%</span>
                  </div>
                  <div className="h-2 sm:h-2.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tech Stack Grid */}
            <div className="space-y-5">
              <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-primary" />
                Tech Stack
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {techStack.map((tech, i) => (
                  <motion.div
                    key={tech.name}
                    className="glass-card p-3 sm:p-4 rounded-xl text-center group hover:border-primary/30 transition-all duration-300 cursor-default"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                      <tech.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{tech.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Experience Timeline */}
        <motion.section {...fadeUp} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
            My <span className="text-primary">Journey</span>
          </h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto text-sm sm:text-base">
            A timeline of my professional experience
          </p>
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative">
            <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-primary/20 hidden sm:block" />
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.year}
                className="glass-card p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl sm:ml-12 relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="absolute left-[-2.1rem] sm:left-[-2.6rem] top-6 w-4 h-4 rounded-full bg-primary border-4 border-background hidden sm:block" />
                <span className="inline-block px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 mb-3">
                  {exp.year}
                </span>
                <h3 className="font-bold text-base sm:text-lg">{exp.role}</h3>
                <p className="text-primary text-sm mb-2">{exp.company}</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{exp.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why Choose Me */}
        <motion.section {...fadeUp} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4">
            Why Choose <span className="text-primary">Me</span>
          </h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto text-sm sm:text-base">
            What sets me apart from the rest
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {[
              { icon: Target, title: "Pixel Perfect", desc: "Every design is crafted with meticulous attention to detail and precision." },
              { icon: Zap, title: "Fast Delivery", desc: "Quick turnaround without compromising on quality or functionality." },
              { icon: Users, title: "Client Focused", desc: "Your vision is my priority. I work closely with you at every step." },
              { icon: Lightbulb, title: "Creative Solutions", desc: "Innovative approaches to solve complex design and development challenges." },
              { icon: Award, title: "Quality Assured", desc: "Thorough testing and optimization for the best possible outcome." },
              { icon: Rocket, title: "Modern Tech", desc: "Using the latest technologies and best practices for future-proof solutions." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="glass-card p-5 sm:p-6 rounded-xl sm:rounded-2xl group hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          className="glass-premium p-8 sm:p-10 md:p-14 rounded-2xl sm:rounded-3xl text-center"
          {...fadeUp}
          transition={{ delay: 0.1 }}
        >
          <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-primary mx-auto mb-4 sm:mb-6" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Let's Build Something <span className="text-primary text-glow">Amazing</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed">
            Whether you need a stunning website, a complete rebrand, or a custom web application — 
            I'm here to help bring your vision to life. Let's create something extraordinary together.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Button variant="hero" size="lg" onClick={() => navigate("/contact")}>
              <MessageSquare className="w-4 h-4" /> Get In Touch
            </Button>
            <Button variant="glass" size="lg" onClick={() => navigate("/meeting")}>
              <Clock className="w-4 h-4" /> Book a Meeting
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
