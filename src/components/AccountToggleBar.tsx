import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Heart, ShoppingCart, Bell, Shield, Package, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountToggleBarProps {
  cartCount: number;
  favoritesCount: number;
  verificationStatus: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const AccountToggleBar = ({
  cartCount,
  favoritesCount,
  verificationStatus,
  onNavigate,
  onLogout
}: AccountToggleBarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      value: "profile",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: Heart,
      label: "Favorites",
      value: "favorites",
      count: favoritesCount,
      color: "text-pink-400",
      bgColor: "bg-pink-500/20"
    },
    {
      icon: ShoppingCart,
      label: "Cart",
      value: "cart",
      count: cartCount,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    },
    {
      icon: Package,
      label: "Orders",
      value: "orders",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      icon: Bell,
      label: "Notifications",
      value: "notifications",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20"
    },
    {
      icon: Shield,
      label: "Sessions",
      value: "sessions",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20"
    }
  ];

  const getVerificationColor = () => {
    switch (verificationStatus) {
      case "verified":
        return "text-green-400 bg-green-500/20";
      case "pending":
        return "text-yellow-400 bg-yellow-500/20";
      default:
        return "text-red-400 bg-red-500/20";
    }
  };

  const handleItemClick = (value: string) => {
    onNavigate(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-card px-4 py-2 rounded-xl flex items-center gap-2 hover:scale-105 transition-all ${
          isOpen ? "bg-primary/20" : ""
        }`}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-primary" />
        ) : (
          <Menu className="w-5 h-5 text-primary" />
        )}
        <span className="hidden sm:inline text-sm font-medium">Quick Access</span>
        
        {/* Badge indicators */}
        {!isOpen && (cartCount > 0 || favoritesCount > 0) && (
          <div className="flex gap-1">
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
            {favoritesCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </div>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 top-full mt-2 w-64 sm:w-72 glass-premium rounded-2xl p-4 shadow-2xl z-50 border border-white/10"
            >
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item.value)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className={`${item.bgColor} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.bgColor} ${item.color}`}>
                        {item.count}
                      </span>
                    )}
                  </motion.button>
                ))}

                {/* Verification Status */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: menuItems.length * 0.05 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${getVerificationColor()}`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="flex-1 text-left font-medium">
                    {verificationStatus === "verified" ? "Verified" : 
                     verificationStatus === "pending" ? "Pending Review" : "Unverified"}
                  </span>
                </motion.div>

                {/* Logout Button */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length + 1) * 0.05 }}
                  className="pt-2 border-t border-white/10"
                >
                  <Button
                    onClick={onLogout}
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
