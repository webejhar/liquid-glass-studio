import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-5xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          About <span className="text-primary">Me</span>
        </motion.h1>

        <motion.div
          className="glass-card p-8 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Hi, I'm <span className="text-primary font-semibold">RAHATUL ISLAM</span>, a
            creative digital designer and developer with 4 years of experience crafting
            beautiful, functional web experiences.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            I specialize in UI/UX design, WordPress development with Elementor Pro, and
            modern web technologies like React and Next.js. My passion lies in creating
            intuitive interfaces that users love and building robust applications that
            businesses rely on.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Currently a Times IT student, I combine academic knowledge with real-world
            experience to deliver premium digital solutions for clients worldwide.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
