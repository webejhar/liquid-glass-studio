import { useEffect, useMemo, useState } from "react";
import { Copy, CreditCard, MapPin, Package2, UserRound, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PaymentConfirmationDialog } from "@/components/PaymentConfirmationDialog";

export interface CheckoutPayload {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
  orderNotes: string;
  paymentMethod: "Binance" | "bKash";
  paymentReference: string;
}

export interface CheckoutItem {
  title: string;
  category?: string | null;
  price: number;
  image?: string | null;
  subtitle?: string | null;
}

interface MultiStepCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CheckoutItem;
  onSubmit: (payload: CheckoutPayload) => Promise<void>;
  successMessage?: string;
}

type PaymentOption = "binance" | "bkash";

const USD_TO_BDT = 127;

const initialForm = {
  buyerName: "",
  buyerEmail: "",
  buyerPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  country: "Bangladesh",
  orderNotes: "",
  paymentReference: "",
};

export function MultiStepCheckoutModal({
  isOpen,
  onClose,
  item,
  onSubmit,
  successMessage = "Your order has been submitted successfully.",
}: MultiStepCheckoutModalProps) {
  const [step, setStep] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption>("binance");
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setSelectedPayment("binance");
      setForm(initialForm);
      setIsSubmitting(false);
      setShowPaymentConfirm(false);
      setShowSuccess(false);
    }
  }, [isOpen, item.title]);

  useEffect(() => {
    if (!showSuccess) return;

    const timer = window.setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [showSuccess, onClose]);

  const paymentDetails = useMemo(
    () =>
      selectedPayment === "binance"
        ? {
            method: "Binance" as const,
            label: "Binance ID",
            payToLabel: "Pay to Binance ID",
            account: "1158996624",
            amount: `$${item.price.toFixed(2)} USD`,
          }
        : {
            method: "bKash" as const,
            label: "bKash TrxID",
            payToLabel: "Pay to bKash Personal",
            account: "+8801340125311",
            amount: `৳${(item.price * USD_TO_BDT).toFixed(2)} BDT`,
          },
    [item.price, selectedPayment],
  );

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateCurrentStep = () => {
    if (step === 0) {
      if (!form.buyerName.trim() || !form.buyerEmail.trim() || !form.buyerPhone.trim()) {
        toast.error("Please complete your name, email, and phone number.");
        return false;
      }

      if (!validateEmail(form.buyerEmail.trim())) {
        toast.error("Please enter a valid email address.");
        return false;
      }
    }

    if (step === 1) {
      if (!form.addressLine1.trim() || !form.city.trim() || !form.country.trim()) {
        toast.error("Please complete your shipping address.");
        return false;
      }
    }

    if (step === 2 && !form.paymentReference.trim()) {
      toast.error("Please enter your payment reference.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setStep((prev) => Math.min(prev + 1, 2));
  };

  const handleConfirmCheckout = () => {
    if (!validateCurrentStep()) return;
    setShowPaymentConfirm(true);
  };

  const handleSubmit = async () => {
    setShowPaymentConfirm(false);
    setIsSubmitting(true);

    try {
      await onSubmit({
        buyerName: form.buyerName.trim(),
        buyerEmail: form.buyerEmail.trim(),
        buyerPhone: form.buyerPhone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        stateRegion: form.stateRegion.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
        orderNotes: form.orderNotes.trim(),
        paymentMethod: paymentDetails.method,
        paymentReference: form.paymentReference.trim(),
      });

      setShowSuccess(true);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error?.message || "Failed to place your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard!");
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-premium max-w-sm sm:max-w-md mx-4">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
            <p className="text-muted-foreground">{successMessage}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <PaymentConfirmationDialog
        isOpen={showPaymentConfirm}
        onConfirm={handleSubmit}
        onCancel={() => setShowPaymentConfirm(false)}
      />

      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="glass-premium max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2 pr-8">
              <Package2 className="w-5 h-5 text-primary" />
              Complete Your Order
            </DialogTitle>
            <DialogDescription>
              Fill in your details step by step to place the order for {item.title}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full sm:w-28 h-32 sm:h-24 object-cover rounded-xl" />
                ) : null}

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap gap-2 items-center">
                    <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
                    {item.category ? <Badge variant="outline">{item.category}</Badge> : null}
                  </div>
                  {item.subtitle ? <p className="text-sm text-muted-foreground">{item.subtitle}</p> : null}
                  <p className="text-xl font-bold text-primary">{paymentDetails.amount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <span>Checkout progress</span>
                  <span>Step {step + 1} of 3</span>
                </div>
                <Progress value={((step + 1) / 3) * 100} />
                <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                  {[
                    { icon: UserRound, label: "Customer" },
                    { icon: MapPin, label: "Address" },
                    { icon: CreditCard, label: "Payment" },
                  ].map(({ icon: Icon, label }, index) => (
                    <div
                      key={label}
                      className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${
                        index === step ? "border-primary bg-primary/10 text-foreground" : "border-border/50 text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {step === 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buyer-name">Full Name *</Label>
                    <Input
                      id="buyer-name"
                      value={form.buyerName}
                      onChange={(e) => updateField("buyerName", e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buyer-phone">Phone Number *</Label>
                    <Input
                      id="buyer-phone"
                      value={form.buyerPhone}
                      onChange={(e) => updateField("buyerPhone", e.target.value)}
                      placeholder="+8801XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="buyer-email">Email Address *</Label>
                  <Input
                    id="buyer-email"
                    type="email"
                    value={form.buyerEmail}
                    onChange={(e) => updateField("buyerEmail", e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address-line-1">Address Line 1 *</Label>
                  <Input
                    id="address-line-1"
                    value={form.addressLine1}
                    onChange={(e) => updateField("addressLine1", e.target.value)}
                    placeholder="House, road, area"
                  />
                </div>

                <div>
                  <Label htmlFor="address-line-2">Address Line 2</Label>
                  <Input
                    id="address-line-2"
                    value={form.addressLine2}
                    onChange={(e) => updateField("addressLine2", e.target.value)}
                    placeholder="Apartment, suite, landmark"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Dhaka" />
                  </div>
                  <div>
                    <Label htmlFor="state-region">State / Region</Label>
                    <Input
                      id="state-region"
                      value={form.stateRegion}
                      onChange={(e) => updateField("stateRegion", e.target.value)}
                      placeholder="Dhaka Division"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postal-code">Postal Code</Label>
                    <Input
                      id="postal-code"
                      value={form.postalCode}
                      onChange={(e) => updateField("postalCode", e.target.value)}
                      placeholder="1207"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Bangladesh" />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={selectedPayment === "binance" ? "liquid" : "outline"}
                    onClick={() => setSelectedPayment("binance")}
                    className="w-full"
                  >
                    Binance (USD)
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPayment === "bkash" ? "liquid" : "outline"}
                    onClick={() => setSelectedPayment("bkash")}
                    className="w-full"
                  >
                    bKash (BDT)
                  </Button>
                </div>

                <div className="glass-card p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{paymentDetails.payToLabel}</p>
                      <p className="font-semibold text-primary">{paymentDetails.amount}</p>
                    </div>
                    <Badge variant="secondary">{paymentDetails.method}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background/60 px-3 py-2 rounded-lg text-sm break-all">{paymentDetails.account}</code>
                    <Button type="button" size="icon" variant="ghost" onClick={() => copyToClipboard(paymentDetails.account)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="payment-reference">{paymentDetails.label} *</Label>
                  <Input
                    id="payment-reference"
                    value={form.paymentReference}
                    onChange={(e) => updateField("paymentReference", e.target.value)}
                    placeholder={`Enter your ${paymentDetails.label}`}
                  />
                </div>

                <div>
                  <Label htmlFor="order-notes">Order Notes</Label>
                  <Textarea
                    id="order-notes"
                    value={form.orderNotes}
                    onChange={(e) => updateField("orderNotes", e.target.value)}
                    placeholder="Any extra information for this order"
                    rows={4}
                  />
                </div>
              </div>
            ) : null}

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
              <Button type="button" variant="outline" onClick={step === 0 ? onClose : () => setStep((prev) => prev - 1)}>
                {step === 0 ? "Cancel" : "Back"}
              </Button>

              {step < 2 ? (
                <Button type="button" variant="liquid" onClick={handleNext}>
                  Next Step
                </Button>
              ) : (
                <Button type="button" variant="liquid" onClick={handleConfirmCheckout} disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Confirm Order"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}