import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import {
  Code, Palette, Globe, Smartphone, Zap, Users,
  Award, Briefcase, Heart, Star,
  Monitor, PenTool, Database, Layers, TrendingUp, Clock,
  MessageSquare, Target, Lightbulb, Rocket, CheckCircle2,
  GraduationCap, ArrowRight
} from "lucide-react";
import heroImage from "@/assets/hero-image.png";

const skills = [
  { name: "WordPress & Elementor Pro", level: 95, icon: Globe },
  { name: "UI/UX Design", level: 90, icon: Palette },
  { name: "React & Next.js", level: 85, icon: Code },
  { name: "Responsive Design", level: 92, icon: Smartphone },
  { name: "SEO Optimization", level: 88, icon: TrendingUp },
  { name: "Database & Backend", level: 80, icon: Database },
];

const techStack = [
  "WordPress", "Elementor Pro", "React", "Next.js", "TypeScript",
  "Tailwind CSS", "Figma", "Photoshop", "Node.js", "Supabase",
  "WooCommerce", "SEO Tools", "Git", "REST API", "GraphQL",
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

      <div className="max-w-6xl mx-auto space-y-20 sm:space-y-28">

        {/* Hero - Photo + Intro */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col items-center text-center mb-12">
            {/* Profile Image */}
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-primary/30 shadow-[0_0_40px_rgba(51,187,238,0.15)]">
                <img
                  src={heroImage}
                  alt="RAHATUL ISLAM"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary/90 text-xs font-semibold text-primary-foreground whitespace-nowrap">
                Available for Hire
              </div>
            </motion.div>

            {/* Name & Title */}
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              RAHATUL <span className="text-primary text-glow">ISLAM</span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg sm:text-xl mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Web Developer · UI/UX Designer · WordPress Expert
            </motion.p>

            {/* Bio */}
            <motion.div
              className="max-w-3xl space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p>
                With over <span className="text-foreground font-medium">4 years</span> of dedicated experience, I transform
                digital ideas into exceptional online experiences. As the founder of{" "}
                <span className="text-primary font-semibold">Webejhar</span>, I've collaborated with
                startups, agencies, and businesses across the globe — helping them establish powerful
                digital presences that drive real results.
              </p>
              <p>
                My approach combines creative design thinking with solid technical expertise.
                From pixel-perfect interfaces in Figma to custom WordPress solutions with Elementor Pro
                and modern React applications — I bring passion, precision, and professionalism to every project.
              </p>
            </motion.div>

            {/* Tags */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {["Creative Thinker", "Problem Solver", "Team Player", "Detail-Oriented", "Fast Learner"].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> Hire Me
              </button>
              <button
                onClick={() => navigate("/portfolio")}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/30 text-sm font-medium hover:border-primary/60 transition-colors"
              >
                <Briefcase className="w-4 h-4" /> View Portfolio
              </button>
            </motion.div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              { value: "4+", label: "Years Experience", icon: Clock },
              { value: "150+", label: "Projects", icon: Briefcase },
              { value: "120+", label: "Happy Clients", icon: Heart },
              { value: "50+", label: "5-Star Reviews", icon: Star },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-card p-4 sm:p-5 rounded-xl text-center group hover:border-primary/30 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xl sm:text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Skills & Tech Stack */}
        <motion.section {...fadeUp}>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Skills & <span className="text-primary">Technologies</span>
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto text-sm">
            The tools and expertise I use to deliver exceptional results
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2 mb-5">
                <Award className="w-4 h-4" /> Core Expertise
              </h3>
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  className="glass-card p-4 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <skill.icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{skill.name}</span>
                    </div>
                    <span className="text-primary font-semibold text-sm">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.08 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2 mb-5">
                <Layers className="w-4 h-4" /> Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, i) => (
                  <motion.span
                    key={tech}
                    className="px-4 py-2 rounded-full text-sm glass-card hover:border-primary/30 transition-all cursor-default"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Experience Timeline */}
        <motion.section {...fadeUp}>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            My <span className="text-primary">Journey</span>
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto text-sm">
            A timeline of my professional growth
          </p>
          <div className="max-w-2xl mx-auto space-y-5 relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-primary/20 hidden sm:block" />
            {experiences.map((exp, i) => (
              <motion.div
                key={exp.year}
                className="glass-card p-5 sm:p-6 rounded-xl sm:ml-10 relative"
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="absolute left-[-1.65rem] top-5 w-3 h-3 rounded-full bg-primary border-2 border-background hidden sm:block" />
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 mb-2">
                  {exp.year}
                </span>
                <h3 className="font-bold text-sm sm:text-base">{exp.role}</h3>
                <p className="text-primary text-xs mb-1">{exp.company}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{exp.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why Choose Me */}
        <motion.section {...fadeUp}>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Why Choose <span className="text-primary">Me</span>
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto text-sm">
            What sets me apart
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Target, title: "Pixel Perfect", desc: "Meticulous attention to every detail and pixel." },
              { icon: Zap, title: "Fast Delivery", desc: "Quick turnaround without compromising quality." },
              { icon: Users, title: "Client Focused", desc: "Your vision is my top priority at every step." },
              { icon: Lightbulb, title: "Creative Solutions", desc: "Innovative approaches to complex challenges." },
              { icon: Award, title: "Quality Assured", desc: "Thorough testing for the best outcome." },
              { icon: Rocket, title: "Modern Tech", desc: "Latest technologies for future-proof solutions." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="glass-card p-5 rounded-xl group hover:border-primary/30 transition-all"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          className="glass-premium p-8 sm:p-10 rounded-2xl text-center"
          {...fadeUp}
        >
          <GraduationCap className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Let's Build Something <span className="text-primary text-glow">Amazing</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed">
            Whether you need a stunning website, a complete rebrand, or a custom web application —
            I'm here to bring your vision to life.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Get In Touch
            </button>
            <button
              onClick={() => navigate("/meeting")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/30 text-sm font-medium hover:border-primary/60 transition-colors"
            >
              <Clock className="w-4 h-4" /> Book a Meeting
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
