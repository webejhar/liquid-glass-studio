import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { CartCheckoutModal } from "@/components/CartCheckoutModal";

export const Cart = () => {
  const { cart, removeFromCart, getTotalPrice, getCartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (getCartCount() === 0) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <button
          onClick={() => setIsCartOpen(true)}
          className="glass-card p-4 rounded-full hover:scale-110 transition relative"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            {getCartCount()}
          </span>
        </button>
      </motion.div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="glass-card p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold">Your Cart</h2>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="glass-button p-2 rounded-full hover:scale-110 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item.id}-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-4 rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.category}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            ${item.price}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="glass-button p-2 rounded-lg hover:scale-110 transition text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer with Total and Checkout */}
                <div className="glass-card p-6 space-y-4">
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${getTotalPrice()}</span>
                  </div>
                  <Button
                    variant="liquid"
                    className="w-full"
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CartCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
};
