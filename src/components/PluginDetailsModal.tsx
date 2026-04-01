import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Download, Package, ChevronDown, ChevronUp, HelpCircle, List, Info, Star, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PluginDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugin: {
    id: number | string;
    name: string;
    price: number;
    image?: string;
    images?: string[];
    version?: string;
    description?: string;
    features?: string[];
    benefits?: string[];
    requirements?: string[];
    tags?: string[];
    category?: string;
    originalPrice?: number;
  };
  onPurchase: () => void;
}

interface DetailSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const PluginDetailsModal = ({ isOpen, onClose, plugin, onPurchase }: PluginDetailsModalProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    features: true,
    benefits: false,
    requirements: false,
    faq: false,
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allImages = plugin.images?.length ? plugin.images : plugin.image ? [plugin.image] : [];
  const [activeImage, setActiveImage] = useState(0);

  const sections: DetailSection[] = [
    {
      id: "description",
      label: "About This Product",
      icon: <Info className="w-5 h-5" />,
      content: plugin.description ? (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{plugin.description}</p>
      ) : (
        <p className="text-sm text-muted-foreground italic">No description available.</p>
      ),
    },
    {
      id: "features",
      label: "Key Features",
      icon: <Zap className="w-5 h-5" />,
      content: (plugin.features || []).length > 0 ? (
        <div className="grid gap-2">
          {(plugin.features || []).map((feature, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      ) : null,
    },
    {
      id: "benefits",
      label: "Benefits",
      icon: <Star className="w-5 h-5" />,
      content: (plugin.benefits || []).length > 0 ? (
        <div className="grid gap-2">
          {(plugin.benefits || []).map((benefit, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-accent/5 border border-accent/10">
              <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      ) : null,
    },
    {
      id: "requirements",
      label: "Requirements",
      icon: <Shield className="w-5 h-5" />,
      content: (plugin.requirements || []).length > 0 ? (
        <div className="space-y-1.5 p-3 rounded-lg bg-muted/50 border border-border/50">
          {(plugin.requirements || []).map((req, i) => (
            <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
              {req}
            </p>
          ))}
        </div>
      ) : null,
    },
  ].filter(s => s.content !== null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl bg-background/95 border-border/50 p-0">
        <ScrollArea className="h-[90vh]">
          <div className="p-4 sm:p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl sm:text-2xl font-bold pr-8">{plugin.name}</DialogTitle>
            </DialogHeader>

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="mb-6">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted/30 border border-border/30">
                  <img
                    src={allImages[activeImage]}
                    alt={plugin.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          i === activeImage ? "border-primary shadow-lg" : "border-border/30 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-3">
                {plugin.version && (
                  <Badge variant="secondary" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    v{plugin.version}
                  </Badge>
                )}
                {plugin.category && (
                  <Badge variant="outline" className="text-xs">{plugin.category}</Badge>
                )}
                {(plugin.tags || []).slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs hidden sm:inline-flex">{tag}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {plugin.originalPrice && (
                  <span className="text-lg line-through text-muted-foreground">${plugin.originalPrice}</span>
                )}
                <span className="text-2xl sm:text-3xl font-bold text-primary">${plugin.price}</span>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-3 mb-6">
              {sections.map((section) => (
                <div key={section.id} className="rounded-xl border border-border/30 overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-primary">{section.icon}</span>
                      <span className="font-semibold text-sm sm:text-base">{section.label}</span>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedSections[section.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 pb-4">{section.content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-0 bg-background/95 backdrop-blur-xl pt-4 pb-2 border-t border-border/30 -mx-4 sm:-mx-6 px-4 sm:px-6">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Close
              </Button>
              <Button onClick={onPurchase} className="flex-1 glass-button">
                <Download className="w-4 h-4 mr-2" />
                Buy Now - ${plugin.price}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
