import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { MultiStepCheckoutModal, type CheckoutPayload } from "@/components/checkout/MultiStepCheckoutModal";

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartCheckoutModal = ({ isOpen, onClose }: CartCheckoutModalProps) => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const handleSubmit = async (payload: CheckoutPayload) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Please login to complete the cart checkout.");
    }

    const orderId = crypto.randomUUID();
    const orderInserts = cart.map((item) => ({
      order_id: orderId,
      product_id: String(item.id),
      product_source_id: null,
      product_name: item.name,
      product_price: item.price,
      product_category: item.category,
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
      user_id: user.id,
    }));

    const { error: insertError } = await supabase.from("product_orders").insert(orderInserts);
    if (insertError) throw insertError;

    const { error: emailError } = await supabase.functions.invoke("send-cart-order-email", {
      body: {
        orderId,
        cartItems: cart,
        totalPrice: getTotalPrice(),
        ...payload,
        timestamp: new Date().toISOString(),
      },
    });

    if (emailError) console.error("Cart order email error:", emailError);

    await clearCart();
  };

  if (cart.length === 0) return null;

  return (
    <MultiStepCheckoutModal
      isOpen={isOpen}
      onClose={onClose}
      item={{
        title: "Cart Checkout",
        category: `${cart.length} item${cart.length > 1 ? "s" : ""}`,
        price: getTotalPrice(),
        subtitle: "All selected products will be submitted together with one order number.",
      }}
      onSubmit={handleSubmit}
      successMessage="Your cart order has been placed. We'll review it and contact you with the next steps."
    />
  );
};
