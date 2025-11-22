import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartCheckoutModal = ({ isOpen, onClose }: CartCheckoutModalProps) => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [name, setName] = useState("");
  const [binanceId, setBinanceId] = useState("");
  const [bkashTrxId, setBkashTrxId] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      const orderId = crypto.randomUUID();

      // Insert all items with the same order_id
      const orderInserts = cart.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        product_category: item.category,
        buyer_name: name || null,
        buyer_email: email,
        payment_method: 'Binance',
        payment_reference: binanceId
      }));

      const { error: insertError } = await supabase
        .from('product_orders')
        .insert(orderInserts);

      if (insertError) throw insertError;

      // Send email with all cart items
      const { error: emailError } = await supabase.functions.invoke('send-cart-order-email', {
        body: {
          orderId,
          cartItems: cart,
          totalPrice: getTotalPrice(),
          buyerName: name || 'Not provided',
          buyerEmail: email,
          paymentMethod: 'Binance',
          paymentReference: binanceId,
          timestamp: new Date().toISOString()
        }
      });

      if (emailError) console.error("Email error:", emailError);

      clearCart();
      setShowConfirmation(true);
      setTimeout(() => {
        onClose();
        setShowConfirmation(false);
        setBinanceId("");
        setEmail("");
        setName("");
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
      const orderId = crypto.randomUUID();

      const orderInserts = cart.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        product_category: item.category,
        buyer_name: name || null,
        buyer_email: email,
        payment_method: 'bKash',
        payment_reference: bkashTrxId
      }));

      const { error: insertError } = await supabase
        .from('product_orders')
        .insert(orderInserts);

      if (insertError) throw insertError;

      const { error: emailError } = await supabase.functions.invoke('send-cart-order-email', {
        body: {
          orderId,
          cartItems: cart,
          totalPrice: getTotalPrice(),
          buyerName: name || 'Not provided',
          buyerEmail: email,
          paymentMethod: 'bKash',
          paymentReference: bkashTrxId,
          timestamp: new Date().toISOString()
        }
      });

      if (emailError) console.error("Email error:", emailError);

      clearCart();
      setShowConfirmation(true);
      setTimeout(() => {
        onClose();
        setShowConfirmation(false);
        setBkashTrxId("");
        setEmail("");
        setName("");
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
            <p className="text-muted-foreground">
              Your order has been received. We'll contact you shortly with download/access instructions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-premium max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-glow">
            Complete Your Purchase
          </DialogTitle>
          <p className="text-muted-foreground">
            {cart.length} item(s) • Total: ${getTotalPrice()}
          </p>
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
                <Label htmlFor="binance-name">Your Name (Optional)</Label>
                <Input
                  id="binance-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="binance-id">Type your Binance ID *</Label>
                <Input
                  id="binance-id"
                  value={binanceId}
                  onChange={(e) => setBinanceId(e.target.value)}
                  placeholder="Enter Binance ID"
                  required
                  className="mt-2"
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
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleBinanceSubmit}
                disabled={isSubmitting}
                className="w-full"
                variant="liquid"
              >
                {isSubmitting ? "Processing..." : "Complete Payment"}
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
                <Label htmlFor="bkash-name">Your Name (Optional)</Label>
                <Input
                  id="bkash-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="bkash-trxid">Type TrxID *</Label>
                <Input
                  id="bkash-trxid"
                  value={bkashTrxId}
                  onChange={(e) => setBkashTrxId(e.target.value)}
                  placeholder="Enter Transaction ID"
                  required
                  className="mt-2"
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
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleBkashSubmit}
                disabled={isSubmitting}
                className="w-full"
                variant="liquid"
              >
                {isSubmitting ? "Processing..." : "Complete Payment"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
