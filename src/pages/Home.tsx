import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Facebook, Linkedin, Globe, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.png";

export default function Home() {
  const [socialVisible, setSocialVisible] = useState(false);

  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-glow">Designer</span> &{" "}
              <span className="text-primary">Developer</span>
            </motion.h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Crafting stunning UI/UX designs, building powerful web experiences, and
              creating premium digital products. Specialized in Elementor, WordPress,
              React, and modern web technologies.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/portfolio"
                className="glass-button px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform"
              >
                View Portfolio
              </Link>
              <Link
                to="/contact"
                className="glass-card px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform border-primary/30"
              >
                Contact Me
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative glass-card p-4 rounded-3xl">
              <img
                src={heroImage}
                alt="RAHATUL ISLAM - Designer & Developer"
                className="w-full rounded-2xl"
              />

              <button
                onClick={() => setSocialVisible(!socialVisible)}
                className="absolute left-4 top-1/2 -translate-y-1/2 glass-button p-3 rounded-full hover:scale-110 transition z-10"
              >
                {socialVisible ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>

              {socialVisible && (
                <motion.div
                  className="absolute left-16 top-1/2 -translate-y-1/2 flex flex-col gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <motion.a
                    href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button p-4 rounded-full hover:scale-110 transition"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Facebook className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button p-4 rounded-full hover:scale-110 transition"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Linkedin className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button p-4 rounded-full hover:scale-110 transition"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Globe className="w-5 h-5" />
                  </motion.a>
                  <motion.a
                    href="https://www.facebook.com/share/1AVWrKP62A/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-button p-4 rounded-full hover:scale-110 transition"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </motion.a>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>

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
      </div>
    </div>
  );
}
