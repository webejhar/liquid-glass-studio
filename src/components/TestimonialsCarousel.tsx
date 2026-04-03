import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  rating: number;
  quote: string;
  image_url: string | null;
}

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data && data.length > 0) setTestimonials(data);
    };
    load();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [testimonials.length]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 5000);
  };

  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((current + 1) % testimonials.length);

  if (testimonials.length === 0) return null;

  // Show 3 cards: small, large center, small
  const getIndex = (offset: number) => (current + offset + testimonials.length) % testimonials.length;

  return (
    <section className="mb-32">
      <motion.h2
        className="text-4xl font-bold mb-12 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        Client <span className="text-primary">Testimonials</span>
      </motion.h2>

      <div className="relative">
        {/* Desktop: 3-card layout */}
        <div className="hidden md:flex items-center justify-center gap-6 min-h-[320px]">
          {[-1, 0, 1].map((offset) => {
            const idx = getIndex(offset);
            const t = testimonials[idx];
            const isCenter = offset === 0;
            return (
              <motion.div
                key={`${t.id}-${offset}`}
                className={`glass-card rounded-2xl p-6 transition-all duration-500 relative overflow-hidden cursor-pointer ${
                  isCenter ? "w-[420px] scale-105 shadow-2xl z-10" : "w-[320px] scale-90 opacity-60"
                }`}
                onClick={() => !isCenter && goTo(idx)}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isCenter ? 1 : 0.6, scale: isCenter ? 1.05 : 0.9 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Quote className="absolute top-3 right-3 w-8 h-8 text-primary/15" />
                <div className="flex items-center gap-3 mb-4">
                  {t.image_url ? (
                    <img src={t.image_url} alt={t.name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/30" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                      {t.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className={`font-semibold ${isCenter ? "text-lg" : "text-base"}`}>{t.name}</p>
                    {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className={`fill-primary text-primary ${isCenter ? "w-5 h-5" : "w-4 h-4"}`} />
                  ))}
                </div>
                <p className={`text-muted-foreground italic leading-relaxed ${isCenter ? "text-base" : "text-sm line-clamp-3"}`}>
                  "{t.quote}"
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: single card */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonials[current].id}
              className="glass-card rounded-2xl p-6 relative overflow-hidden"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <Quote className="absolute top-3 right-3 w-8 h-8 text-primary/15" />
              <div className="flex items-center gap-3 mb-4">
                {testimonials[current].image_url ? (
                  <img src={testimonials[current].image_url} alt={testimonials[current].name} className="w-14 h-14 rounded-full object-cover border-2 border-primary/30" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
                    {testimonials[current].name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">{testimonials[current].name}</p>
                  {testimonials[current].role && <p className="text-xs text-muted-foreground">{testimonials[current].role}</p>}
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: testimonials[current].rating }).map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground italic leading-relaxed">"{testimonials[current].quote}"</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={prev} className="p-2 rounded-full border border-border/50 hover:border-primary/50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? "bg-primary w-6" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <button onClick={next} className="p-2 rounded-full border border-border/50 hover:border-primary/50 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
