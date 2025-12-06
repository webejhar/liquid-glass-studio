import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Wallet, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProviderPaymentRequestProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  totalAmount: number;
  providerPaymentMethod?: string | null;
  providerPaymentId?: string | null;
  onSuccess: () => void;
}

export const ProviderPaymentRequest = ({
  isOpen,
  onClose,
  projectId,
  totalAmount,
  providerPaymentMethod,
  providerPaymentId,
  onSuccess
}: ProviderPaymentRequestProps) => {
  const [paymentMethod, setPaymentMethod] = useState(providerPaymentMethod || "binance");
  const [paymentId, setPaymentId] = useState(providerPaymentId || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminFee = totalAmount * 0.05; // 5% admin fee
  const providerAmount = totalAmount - adminFee;

  const handleSubmit = async () => {
    if (!paymentId.trim()) {
      toast.error("Please enter your payment ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({
          provider_payment_method: paymentMethod,
          provider_payment_id: paymentId,
          provider_payment_requested: true,
          provider_payment_status: 'requested'
        })
        .eq("id", projectId);

      if (error) throw error;

      // Create notification for admin
      await supabase.rpc('create_admin_notification', {
        p_title: 'Payment Request',
        p_message: `Provider has requested payment of $${providerAmount.toFixed(2)} via ${paymentMethod}`,
        p_type: 'payment_request',
        p_reference_id: projectId
      });

      toast.success("Payment request submitted! Admin will process it shortly.");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Payment request error:", error);
      toast.error(error.message || "Failed to submit payment request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-premium max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Request Payment
          </DialogTitle>
          <DialogDescription>
            Enter your payment details to receive your earnings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Summary */}
          <div className="glass-card p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Project Amount</span>
              <span className="font-semibold">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-red-400">
              <span>Admin Fee (5%)</span>
              <span>-${adminFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border/50 pt-3 flex justify-between items-center">
              <span className="font-semibold text-primary">Your Amount</span>
              <span className="font-bold text-lg text-primary">${providerAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <motion.div 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'binance' ? 'border-yellow-500 bg-yellow-500/10' : 'border-border/50 hover:border-border'
                }`}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('binance')}
              >
                <RadioGroupItem value="binance" id="binance" />
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-black font-bold text-sm">₿</span>
                  </div>
                  <div>
                    <Label htmlFor="binance" className="cursor-pointer font-semibold">Binance</Label>
                    <p className="text-xs text-muted-foreground">Receive in USDT</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-500/10' : 'border-border/50 hover:border-border'
                }`}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('bkash')}
              >
                <RadioGroupItem value="bkash" id="bkash" />
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">৳</span>
                  </div>
                  <div>
                    <Label htmlFor="bkash" className="cursor-pointer font-semibold">bKash</Label>
                    <p className="text-xs text-muted-foreground">Receive in BDT</p>
                  </div>
                </div>
              </motion.div>
            </RadioGroup>
          </div>

          {/* Payment ID Input */}
          <div className="space-y-2">
            <Label htmlFor="paymentId">
              {paymentMethod === 'binance' ? 'Binance ID / UID' : 'bKash Number'}
            </Label>
            <Input
              id="paymentId"
              placeholder={paymentMethod === 'binance' ? 'Enter your Binance ID' : 'Enter your bKash number'}
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              className="glass-input"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !paymentId.trim()}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Request Payment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
