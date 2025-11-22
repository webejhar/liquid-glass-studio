import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStartup Inc",
    rating: 5,
    text: "Webejhar delivered an exceptional website that exceeded all our expectations. The attention to detail and creative approach was outstanding.",
  },
  {
    name: "Michael Chen",
    role: "Marketing Director",
    rating: 5,
    text: "Working with RAHATUL was a pleasure. Fast turnaround, excellent communication, and the final product was pixel-perfect.",
  },
  {
    name: "Emma Williams",
    role: "Freelance Designer",
    rating: 5,
    text: "The custom Elementor plugin I purchased from the shop has saved me countless hours. Highly recommended!",
  },
  {
    name: "David Brown",
    role: "Business Owner",
    rating: 5,
    text: "Professional, creative, and reliable. My e-commerce site is performing better than ever thanks to the redesign.",
  },
  {
    name: "Lisa Anderson",
    role: "Agency Owner",
    rating: 5,
    text: "The branding package was comprehensive and exactly what we needed. RAHATUL truly understands design.",
  },
  {
    name: "James Wilson",
    role: "Developer",
    rating: 5,
    text: "Clean code, modern design, and fantastic support. I've hired Webejhar for multiple projects now.",
  },
];

export default function Testimonials() {
  return (
    <div className="min-h-screen pt-32 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Client <span className="text-primary">Testimonials</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          What clients say about working with Webejhar
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="glass-card p-8 rounded-2xl hover:scale-105 transition relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Quote className="w-10 h-10 text-primary/30 absolute top-4 right-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.text}"
              </p>
              <div>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
