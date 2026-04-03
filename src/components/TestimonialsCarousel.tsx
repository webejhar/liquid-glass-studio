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
    }, 5000);
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

  const renderCard = (t: Testimonial, size: "sm" | "lg") => {
    const isLg = size === "lg";
    return (
      <div className="relative overflow-hidden">
        <Quote className="absolute top-3 right-3 w-10 h-10 text-primary/5" />
        <div className="flex items-center gap-3 mb-4">
          {t.image_url ? (
            <img src={t.image_url} alt={t.name} className={`rounded-full object-cover border-2 border-primary/30 ${isLg ? "w-14 h-14" : "w-10 h-10"}`} />
          ) : (
            <div className={`rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground ${isLg ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm"}`}>
              {t.name.charAt(0)}
            </div>
          )}
          <div>
            <p className={`font-semibold ${isLg ? "text-base" : "text-sm"}`}>{t.name}</p>
            {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
          </div>
        </div>
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: t.rating }).map((_, j) => (
            <Star key={j} className={`fill-primary text-primary ${isLg ? "w-4 h-4" : "w-3 h-3"}`} />
          ))}
        </div>
        <p className={`text-muted-foreground italic leading-relaxed ${isLg ? "text-sm" : "text-xs line-clamp-3"}`}>
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
        {/* Desktop: 3D-style perspective carousel */}
        <div className="hidden md:flex items-center justify-center gap-6 min-h-[320px] px-4 perspective-[1200px]">
          {[-1, 0, 1].map((offset) => {
            const idx = getIndex(offset);
            const t = testimonials[idx];
            const isCenter = offset === 0;
            return (
              <motion.div
                key={`${idx}-${current}`}
                className={`glass-card rounded-2xl cursor-pointer ${
                  isCenter
                    ? "w-[460px] p-7 shadow-2xl shadow-primary/15 border border-primary/10"
                    : "w-[300px] p-5 opacity-40 hover:opacity-60"
                }`}
                onClick={() => !isCenter && goTo(idx)}
                layout
                animate={{
                  scale: isCenter ? 1.08 : 0.82,
                  y: isCenter ? -12 : 8,
                  rotateY: offset * -8,
                  z: isCenter ? 50 : -50,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
              >
                {renderCard(t, isCenter ? "lg" : "sm")}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile: cinematic slide */}
        <div className="md:hidden overflow-hidden">
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={(dir: number) => ({
                x: dir > 0 ? 280 : -280,
                opacity: 0,
                scale: 0.85,
                rotateY: dir > 0 ? 15 : -15,
              })}
              animate={{
                x: 0,
                opacity: 1,
                scale: 1,
                rotateY: 0,
              }}
              exit={(dir: number) => ({
                x: dir > 0 ? -280 : 280,
                opacity: 0,
                scale: 0.85,
                rotateY: dir > 0 ? -15 : 15,
              })}
              transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.9 }}
              className="glass-card rounded-2xl p-6"
            >
              {renderCard(testimonials[current], "lg")}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={prev} className="p-2.5 rounded-full glass-card hover:bg-primary/10 transition-all duration-300 hover:scale-110">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2 items-center">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative"
              >
                <motion.div
                  className="rounded-full"
                  animate={{
                    width: i === current ? 32 : 8,
                    height: 8,
                    backgroundColor: i === current ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              </button>
            ))}
          </div>
          <button onClick={next} className="p-2.5 rounded-full glass-card hover:bg-primary/10 transition-all duration-300 hover:scale-110">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
