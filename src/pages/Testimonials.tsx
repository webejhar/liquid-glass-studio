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
    <div className="min-h-screen pt-20 sm:pt-24 md:pt-28 lg:pt-32 px-3 sm:px-4 md:px-6 lg:px-8 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-center px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Client <span className="text-primary">Testimonials</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-sm sm:text-base md:text-lg px-2 sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          What clients say about working with Webejhar
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="glass-card p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl hover:scale-105 transition relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary/30 absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4" />
              <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3 md:mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 sm:w-4 sm:h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-3 sm:mb-4 md:mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </p>
              <div>
                <p className="font-semibold text-xs sm:text-sm md:text-base">{testimonial.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
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
