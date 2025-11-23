import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface ProductPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

export const ProductPurchaseModal = ({ isOpen, onClose, product }: ProductPurchaseModalProps) => {
  const [binanceId, setBinanceId] = useState("");
  const [bkashTrxId, setBkashTrxId] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login to continue your purchase");
      navigate("/login");
      onClose();
      return;
    }
    setIsLoggedIn(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleBinanceSubmit = async () => {
    if (!binanceId.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert order
      const { error: insertError } = await supabase
        .from('product_orders')
        .insert({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_category: product.category,
          buyer_email: email,
          payment_method: 'Binance',
          payment_reference: binanceId,
          user_id: user?.id || null
        });

      if (insertError) throw insertError;

      // Send email
      const { error: emailError } = await supabase.functions.invoke('send-product-order-email', {
        body: {
          productName: product.name,
          productPrice: product.price,
          productCategory: product.category,
          buyerEmail: email,
          paymentMethod: 'Binance',
          paymentReference: binanceId,
          timestamp: new Date().toISOString()
        }
      });

      if (emailError) console.error("Email error:", emailError);

      setShowConfirmation(true);
      setTimeout(() => {
        onClose();
        setShowConfirmation(false);
        setBinanceId("");
        setEmail("");
      }, 3000);
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error("Failed to process order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBkashSubmit = async () => {
    if (!bkashTrxId.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: insertError } = await supabase
        .from('product_orders')
        .insert({
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_category: product.category,
          buyer_email: email,
          payment_method: 'bKash',
          payment_reference: bkashTrxId,
          user_id: user?.id || null
        });

      if (insertError) throw insertError;

      const { error: emailError } = await supabase.functions.invoke('send-product-order-email', {
        body: {
          productName: product.name,
          productPrice: product.price,
          productCategory: product.category,
          buyerEmail: email,
          paymentMethod: 'bKash',
          paymentReference: bkashTrxId,
          timestamp: new Date().toISOString()
        }
      });

      if (emailError) console.error("Email error:", emailError);

      setShowConfirmation(true);
      setTimeout(() => {
        onClose();
        setShowConfirmation(false);
        setBkashTrxId("");
        setEmail("");
      }, 3000);
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error("Failed to process order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-premium">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
            <p className="text-muted-foreground">Please wait a few minutes while we process your order.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-premium max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-glow">
            Purchase {product.name}
          </DialogTitle>
          <p className="text-muted-foreground">${product.price}</p>
        </DialogHeader>

        <Tabs defaultValue="binance" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="binance">Binance</TabsTrigger>
            <TabsTrigger value="bkash">bKash</TabsTrigger>
          </TabsList>

          <TabsContent value="binance" className="space-y-4 mt-4">
            <div className="glass-card p-4 rounded-lg">
              <p className="text-sm mb-2">Pay to:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background/50 px-3 py-2 rounded">1158996624</code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard("1158996624")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="binance-id">Type your Binance ID *</Label>
                <Input
                  id="binance-id"
                  value={binanceId}
                  onChange={(e) => setBinanceId(e.target.value)}
                  placeholder="Enter Binance ID"
                  required
                />
              </div>

              <div>
                <Label htmlFor="binance-email">Type E-mail *</Label>
                <Input
                  id="binance-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <Button
                onClick={handleBinanceSubmit}
                disabled={isSubmitting}
                className="w-full"
                variant="liquid"
              >
                {isSubmitting ? "Processing..." : "Pay Complete"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bkash" className="space-y-4 mt-4">
            <div className="glass-card p-4 rounded-lg">
              <p className="text-sm mb-2">bKash Personal</p>
              <p className="text-sm mb-2">Number:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background/50 px-3 py-2 rounded">+8801340125311</code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyToClipboard("+8801340125311")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="bkash-trxid">Type TrxID *</Label>
                <Input
                  id="bkash-trxid"
                  value={bkashTrxId}
                  onChange={(e) => setBkashTrxId(e.target.value)}
                  placeholder="Enter Transaction ID"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bkash-email">Type E-mail *</Label>
                <Input
                  id="bkash-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <Button
                onClick={handleBkashSubmit}
                disabled={isSubmitting}
                className="w-full"
                variant="liquid"
              >
                {isSubmitting ? "Processing..." : "Send Complete"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
