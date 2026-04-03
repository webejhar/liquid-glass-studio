import { useState, useEffect, useRef, useCallback } from "react";
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
  const [direction, setDirection] = useState(1);
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

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (testimonials.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 4500);
  }, [testimonials.length]);

  useEffect(() => {
    startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoplay]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    startAutoplay();
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((current - 1 + testimonials.length) % testimonials.length);
    startAutoplay();
  };
  const next = () => {
    setDirection(1);
    setCurrent((current + 1) % testimonials.length);
    startAutoplay();
  };

  if (testimonials.length === 0) return null;

  const getIndex = (offset: number) => (current + offset + testimonials.length) % testimonials.length;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.9 }),
  };

  const renderCard = (t: Testimonial, size: "sm" | "lg") => {
    const isLg = size === "lg";
    return (
      <div className="relative overflow-hidden">
        <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
        <div className="flex items-center gap-3 mb-4">
          {t.image_url ? (
            <img src={t.image_url} alt={t.name} className={`rounded-full object-cover border-2 border-primary/20 ${isLg ? "w-16 h-16" : "w-12 h-12"}`} />
          ) : (
            <div className={`rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center font-bold text-primary-foreground ${isLg ? "w-16 h-16 text-xl" : "w-12 h-12 text-base"}`}>
              {t.name.charAt(0)}
            </div>
          )}
          <div>
            <p className={`font-semibold ${isLg ? "text-lg" : "text-sm"}`}>{t.name}</p>
            {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
          </div>
        </div>
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: t.rating }).map((_, j) => (
            <Star key={j} className={`fill-primary text-primary ${isLg ? "w-4 h-4" : "w-3 h-3"}`} />
          ))}
        </div>
        <p className={`text-muted-foreground italic leading-relaxed ${isLg ? "text-[15px]" : "text-xs line-clamp-3"}`}>
          "{t.quote}"
        </p>
      </div>
    );
  };

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
        {/* Desktop: 3-card layout with smooth transitions */}
        <div className="hidden md:flex items-center justify-center gap-8 min-h-[340px] px-4">
          {[-1, 0, 1].map((offset) => {
            const idx = getIndex(offset);
            const t = testimonials[idx];
            const isCenter = offset === 0;
            return (
              <motion.div
                key={`pos-${offset}`}
                className={`glass-card rounded-2xl cursor-pointer transition-shadow duration-500 ${
                  isCenter
                    ? "w-[440px] p-7 shadow-2xl shadow-primary/10"
                    : "w-[320px] p-5 opacity-50 hover:opacity-70"
                }`}
                onClick={() => !isCenter && goTo(idx)}
                animate={{
                  scale: isCenter ? 1.05 : 0.88,
                  y: isCenter ? -8 : 0,
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                {renderCard(t, isCenter ? "lg" : "sm")}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: single card with slide animation */}
        <div className="md:hidden overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 250, damping: 28 }}
              className="glass-card rounded-2xl p-6"
            >
              {renderCard(testimonials[current], "lg")}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} className="p-2.5 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === current ? "bg-primary w-8" : "bg-muted-foreground/20 w-2 hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
          <button onClick={next} className="p-2.5 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
