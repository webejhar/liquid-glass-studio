import { supabase } from "@/integrations/supabase/client";
import { MultiStepCheckoutModal, type CheckoutPayload } from "@/components/checkout/MultiStepCheckoutModal";

interface Product {
  id: number | string;
  name: string;
  price: number;
  category: string;
  image?: string | null;
}

interface ProductPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const getProductSourceId = (productId: string | number) => {
  if (typeof productId !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId)
    ? productId
    : null;
};

export const ProductPurchaseModal = ({ isOpen, onClose, product }: ProductPurchaseModalProps) => {
  const handleSubmit = async (payload: CheckoutPayload) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const orderData = {
      product_id: String(product.id),
      product_source_id: getProductSourceId(product.id),
      product_name: product.name,
      product_price: product.price,
      product_category: product.category,
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
    };

    const { error: insertError } = await supabase.from("product_orders").insert(orderData);
    if (insertError) throw insertError;

    const { error: emailError } = await supabase.functions.invoke("send-product-order-email", {
      body: {
        ...orderData,
        timestamp: new Date().toISOString(),
      },
    });

    if (emailError) console.error("Product order email error:", emailError);
  };

  return (
    <MultiStepCheckoutModal
      isOpen={isOpen}
      onClose={onClose}
      item={{
        title: product.name,
        category: product.category,
        price: product.price,
        image: product.image,
      }}
      onSubmit={handleSubmit}
      successMessage="Your product order has been received. We'll verify the payment and update you soon."
    />
  );
};
