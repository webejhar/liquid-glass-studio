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
        <DialogContent className="glass-premium max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl text-glow">
              Domain Availability: {domainBase}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {results.map((result) => (
              <div
                key={result.tld}
                className={`glass-card rounded-lg p-4 ${
                  result.available ? 'border-primary/50' : 'border-border/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold">
                    {domainBase}{result.tld}
                  </span>
                  {result.available ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={result.available ? "text-primary" : "text-muted-foreground"}>
                    {result.available ? "Available" : "Taken"}
                  </span>
                  
                  {result.available ? (
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => handleBuy(result.tld)}
                    >
                      Get
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
        />
      )}
    </>
  );
};
