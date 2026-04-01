import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Download, Package } from "lucide-react";

interface PluginDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugin: {
    id: number;
    name: string;
    price: number;
    image: string;
    version: string;
    description: string;
    features: string[];
    benefits: string[];
    requirements: string[];
  };
  onPurchase: () => void;
}

export const PluginDetailsModal = ({ isOpen, onClose, plugin, onPurchase }: PluginDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl bg-background/95 border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{plugin.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Plugin Image */}
            <div className="relative w-full h-64 rounded-xl overflow-hidden glass-card">
              <img 
                src={plugin.image} 
                alt={plugin.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Version & Price */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-sm">
                <Package className="w-4 h-4 mr-2" />
                Version {plugin.version}
              </Badge>
              <span className="text-3xl font-bold text-primary">${plugin.price}</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold mb-3">About This Plugin</h3>
              <p className="text-muted-foreground leading-relaxed">{plugin.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Key Features</h3>
              <div className="grid gap-3">
                {(plugin.features || []).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 glass-card p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Benefits</h3>
              <div className="grid gap-3">
                {plugin.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 glass-card p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Requirements</h3>
              <div className="glass-card p-4 rounded-lg space-y-2">
                {plugin.requirements.map((req, index) => (
                  <p key={index} className="text-sm text-muted-foreground">• {req}</p>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={onPurchase}
            className="flex-1 glass-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Buy Now - ${plugin.price}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
