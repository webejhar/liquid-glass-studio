import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: string;
  created_at: string;
}

interface AnnouncementsProps {
  userType?: 'general' | 'service_provider' | 'client' | null;
}

export const Announcements = ({ userType }: AnnouncementsProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, [userType]);

  const loadAnnouncements = async () => {
    try {
      let query = supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .or('start_date.is.null,start_date.lte.now()')
        .or('end_date.is.null,end_date.gte.now()')
        .order("created_at", { ascending: false });

      // Filter by target audience
      if (userType) {
        query = query.or(`target_audience.eq.all,target_audience.eq.${userType}`);
      } else {
        query = query.eq("target_audience", "all");
      }

      const { data, error } = await query;
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
  };

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  if (isDismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
      >
        <div className="glass-premium p-4 rounded-xl shadow-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Megaphone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{current.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {current.content}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {announcements.length > 1 && (
                <>
                  <Button onClick={prevAnnouncement} variant="ghost" size="icon" className="h-6 w-6">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {currentIndex + 1}/{announcements.length}
                  </span>
                  <Button onClick={nextAnnouncement} variant="ghost" size="icon" className="h-6 w-6">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button onClick={() => setIsDismissed(true)} variant="ghost" size="icon" className="h-6 w-6">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
