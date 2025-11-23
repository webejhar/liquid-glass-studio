import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getCartCount: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load user and cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);

        if (user) {
          const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id);

          if (error) throw error;

          const cartItems = data.map(item => ({
            id: item.product_id,
            name: item.product_name,
            price: Number(item.product_price),
            category: item.product_category,
            description: item.product_description
          }));

          setCart(cartItems);
        }
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCart([]);
        setUserId(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id);
        loadCart();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (item: CartItem) => {
    if (!userId) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          product_category: item.category,
          product_description: item.description
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info("Item already in cart");
          return;
        }
        throw error;
      }

      setCart((prev) => [...prev, item]);
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const removeFromCart = async (id: number) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', id);

      if (error) throw error;

      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  const clearCart = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const getCartCount = () => {
    return cart.length;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getCartCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
