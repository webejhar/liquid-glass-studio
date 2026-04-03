import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  quote: string;
  image_url: string | null;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setTestimonials(data);
    };
    load();
  }, []);

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

        {testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground">No testimonials yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                className="glass-card p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl md:rounded-2xl hover:scale-105 transition relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Quote className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary/30 absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4" />
                <div className="flex items-center gap-3 mb-3">
                  {testimonial.image_url ? (
                    <img src={testimonial.image_url} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/30" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-xs sm:text-sm md:text-base">{testimonial.name}</p>
                    {testimonial.role && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{testimonial.role}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3 md:mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 sm:w-4 sm:h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
