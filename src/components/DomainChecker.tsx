import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { DomainResultModal } from "./DomainResultModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DomainChecker = () => {
  const [domainBase, setDomainBase] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Array<{ tld: string; available: boolean }>>([]);

  const handleSearch = async () => {
    if (!domainBase.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-domain', {
        body: { domainBase: domainBase.trim() }
      });

      if (error) throw error;

      setResults(data.results);
      setShowResults(true);
    } catch (error: any) {
      console.error("Domain check error:", error);
      toast.error("Sorry — we couldn't check right now. Please try again in a few minutes.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-12 md:py-20 px-4 min-h-[80vh] md:min-h-0 flex items-center"
      >
        <div className="container max-w-4xl mx-auto w-full">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 md:mb-4 text-glow px-4"
          >
            Check if your <span className="text-primary">domain</span> is available
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-premium rounded-2xl p-8 md:p-10 mt-8 mx-4"
          >
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 relative w-full">
                <Input
                  type="text"
                  placeholder="example"
                  value={domainBase}
                  onChange={(e) => setDomainBase(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-16 md:h-14 text-lg md:text-base glass-card border-border/50 w-full px-6"
                  disabled={isChecking}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isChecking}
                size="lg"
                variant="liquid"
                className="h-16 md:h-14 px-10 md:px-8 text-lg md:text-base w-full md:w-auto min-w-[140px]"
              >
                <Search className="w-5 h-5 mr-2" />
                {isChecking ? "Searching..." : "Search"}
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <DomainResultModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        domainBase={domainBase}
        results={results}
      />
    </>
  );
};
