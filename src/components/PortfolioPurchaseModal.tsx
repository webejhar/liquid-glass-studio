import { supabase } from "@/integrations/supabase/client";
import { MultiStepCheckoutModal, type CheckoutPayload } from "@/components/checkout/MultiStepCheckoutModal";

interface PortfolioPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: {
    id: string;
    title: string;
    category?: string | null;
    price: number;
    image?: string | null;
  };
}

export function PortfolioPurchaseModal({ isOpen, onClose, portfolio }: PortfolioPurchaseModalProps) {
  const handleSubmit = async (payload: CheckoutPayload) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("portfolio_orders").insert({
      portfolio_id: portfolio.id,
      portfolio_title: portfolio.title,
      portfolio_category: portfolio.category || null,
      price: portfolio.price,
      buyer_name: payload.buyerName,
      buyer_email: payload.buyerEmail,
      buyer_phone: payload.buyerPhone,
      address_line1: payload.addressLine1,
      address_line2: payload.addressLine2 || null,
      city: payload.city,
      state_region: payload.stateRegion || null,
      postal_code: payload.postalCode || null,
      country: payload.country,
      order_notes: payload.orderNotes || null,
      payment_method: payload.paymentMethod,
      payment_reference: payload.paymentReference,
      user_id: user?.id || null,
    });

    if (error) throw error;
  };

  return (
    <MultiStepCheckoutModal
      isOpen={isOpen}
      onClose={onClose}
      item={{
        title: portfolio.title,
        category: portfolio.category || "Portfolio",
        price: portfolio.price,
        image: portfolio.image,
        subtitle: "This portfolio will be sent to admin with all your checkout details.",
      }}
      onSubmit={handleSubmit}
      successMessage="Your portfolio order has been received. We will review your payment and contact you soon."
    />
  );
}