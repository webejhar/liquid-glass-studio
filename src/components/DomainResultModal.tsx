import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { PurchaseModal } from "./PurchaseModal";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DomainResult {
  tld: string;
  available: boolean;
  price: number; // Price in USD
}

interface DomainResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainBase: string;
  results: DomainResult[];
}

export const DomainResultModal = ({ isOpen, onClose, domainBase, results }: DomainResultModalProps) => {
  const [selectedTld, setSelectedTld] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const handleBuy = (tld: string) => {
    if (!isLoggedIn) {
      toast.error("Please login to continue your purchase");
      navigate("/login");
      return;
    }
    setSelectedTld(tld);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-premium max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl md:text-3xl text-glow break-words">
              Domain Availability: {domainBase}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
            {results.map((result) => (
              <div
                key={result.tld}
                className={`glass-card rounded-lg p-3 sm:p-4 ${
                  result.available ? 'border-primary/50' : 'border-border/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-base sm:text-lg font-semibold break-all">
                    {domainBase}{result.tld}
                  </span>
                  {result.available ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 ml-2" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 ml-2" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm sm:text-base ${result.available ? "text-primary" : "text-muted-foreground"}`}>
                      {result.available ? "Available" : "Taken"}
                    </span>
                    {result.available && (
                      <span className="text-lg sm:text-xl font-bold text-primary">
                        ${result.price}
                      </span>
                    )}
                  </div>
                  
                  {result.available ? (
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => handleBuy(result.tld)}
                    >
                      Buy Now
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled className="opacity-50">
                      Unavailable
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {selectedTld && (
        <PurchaseModal
          isOpen={!!selectedTld}
          onClose={() => setSelectedTld(null)}
          domainName={domainBase}
          tld={selectedTld}
          price={results.find(r => r.tld === selectedTld)?.price || 0}
        />
      )}
    </>
  );
};
