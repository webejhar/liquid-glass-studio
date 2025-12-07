import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Heart, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PluginDetailsModal } from "@/components/PluginDetailsModal";
import { ProductPurchaseModal } from "@/components/ProductPurchaseModal";
import elementorImage from "@/assets/elementor-pro.png";
import dokanImage from "@/assets/dokan-pro.png";
import { useNavigate } from "react-router-dom";

// Plugin products data
const plugins = [
  {
    id: 1,
    name: "Elementor Pro",
    price: 59,
    category: "Plugin",
    description: "The most advanced WordPress website builder. Create high-end, pixel perfect websites at record speeds. Any theme, any page, any design.",
    image: elementorImage,
    version: "3.25.0",
    features: [
      "90+ Professional Widgets - Form Widget, Slider Widget, WooCommerce Builder, and more",
      "Theme Builder - Design your entire WordPress theme visually including headers, footers, single posts, archives",
      "WooCommerce Builder - Create custom product pages, shop pages, and checkout pages",
      "Popup Builder - Design custom popups for any marketing campaign or engagement",
      "Dynamic Content - Display custom fields, post information, and site data anywhere",
      "Global Widgets - Save and reuse widgets across your entire website",
      "Motion Effects - Add parallax scrolling, mouse effects, and advanced animations",
      "Custom CSS - Add custom CSS to any element for full design control",
      "Role Manager - Control access to features based on user roles"
    ],
    benefits: [
      "Save Time - Build websites 10x faster with drag and drop editing",
      "No Coding Required - Visual design means anyone can build professional sites",
      "Mobile Responsive - All designs automatically work perfectly on mobile devices",
      "SEO Friendly - Clean code and fast loading times improve search rankings",
      "Regular Updates - Constant new features and improvements added monthly",
      "World-Class Support - Access to expert support team and extensive documentation",
      "Unlimited Websites - Use on as many sites as you need with one license"
    ],
    requirements: [
      "WordPress 6.0 or higher",
      "PHP 7.4 or higher (8.0+ recommended)",
      "MySQL 5.6 or higher",
      "At least 128MB of memory allocated to PHP",
      "Modern web browser (Chrome, Firefox, Safari, Edge)"
    ]
  },
  {
    id: 2,
    name: "Dokan Pro",
    price: 149,
    category: "Plugin",
    description: "Transform your WordPress site into a fully-featured multi-vendor marketplace. Empower vendors to run their own stores while you earn commission on every sale.",
    image: dokanImage,
    version: "3.12.0",
    features: [
      "Multi-Vendor Marketplace - Allow unlimited vendors to sell on your platform",
      "Commission Management - Set global or per-vendor commission rates automatically",
      "Vendor Dashboard - Complete storefront management for each vendor",
      "Product Management - Vendors can add, edit, and manage their own products",
      "Order Management - Vendors receive and process their own orders",
      "Withdrawal System - Automated vendor payment withdrawals and requests",
      "Coupon Management - Vendors can create their own discount coupons",
      "Shipping Management - Multiple shipping methods and vendor-specific shipping",
      "Review System - Customer reviews and ratings for products and vendors",
      "Vendor Verification - Admin approval system for new vendor applications",
      "Reports & Analytics - Detailed sales reports and analytics for vendors",
      "Frontend Vendor Registration - Easy vendor signup from the frontend"
    ],
    benefits: [
      "Passive Income - Earn commission on every sale without managing inventory",
      "Scalable Platform - Grow from 10 to 10,000 vendors seamlessly",
      "Automated Operations - Vendors manage their own products, orders, and customers",
      "Multiple Revenue Streams - Commission, subscription fees, and featured listings",
      "Vendor Independence - Each vendor has their own branded storefront",
      "Built-in Trust - Review system and verification builds marketplace credibility",
      "WooCommerce Integration - Leverages the power of WooCommerce ecosystem"
    ],
    requirements: [
      "WordPress 6.0 or higher",
      "WooCommerce 8.0 or higher",
      "PHP 7.4 or higher (8.0+ recommended)",
      "MySQL 5.6 or higher",
      "At least 256MB of memory allocated to PHP",
      "HTTPS/SSL certificate recommended for payment processing"
    ]
  }
];

export default function Shop() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [purchasePlugin, setPurchasePlugin] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Load user favorites
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setFavoriteIds(data.map(fav => fav.product_id));
    }
  };

  // Filter plugins
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePurchase = (plugin: any) => {
    setSelectedPlugin(null);
    setPurchasePlugin(plugin);
  };

  const handleToggleFavorite = async (plugin: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add favorites",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const isFavorite = favoriteIds.includes(plugin.id);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', plugin.id);

        if (error) throw error;
        
        setFavoriteIds(favoriteIds.filter(id => id !== plugin.id));
        toast({
          title: "Removed from favorites",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: plugin.id,
            product_name: plugin.name,
            product_price: plugin.price,
            product_category: plugin.category,
            product_description: plugin.description
          });

        if (error) throw error;
        
        setFavoriteIds([...favoriteIds, plugin.id]);
        toast({
          title: "Added to favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-3 sm:px-4 pb-20 w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Premium <span className="text-primary">Plugins</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Professional WordPress plugins to power your business
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-8 sm:mb-12 w-full">
          <div className="relative glass-card p-1 rounded-full max-w-2xl mx-auto w-full">
            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-10 sm:px-14 py-3 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Plugins Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 w-full">
          {filteredPlugins.map((plugin, index) => (
            <motion.div
              key={plugin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer relative group"
              onClick={() => setSelectedPlugin(plugin)}
            >
              <div className="relative h-48 sm:h-56 lg:h-64">
                <img 
                  src={plugin.image} 
                  alt={plugin.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(plugin);
                  }}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 glass-button p-2 sm:p-3 rounded-full hover:scale-110 transition z-10"
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      favoriteIds.includes(plugin.id)
                        ? "fill-red-500 text-red-500"
                        : "text-foreground"
                    }`}
                  />
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{plugin.name}</h3>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary shrink-0">${plugin.price}</span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                  {plugin.description}
                </p>
                
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(plugin);
                    }}
                    className="glass-button flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:scale-105 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPlugins.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No plugins found matching your search.</p>
          </div>
        )}
      </div>

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <PluginDetailsModal
          isOpen={!!selectedPlugin}
          onClose={() => setSelectedPlugin(null)}
          plugin={selectedPlugin}
          onPurchase={() => handlePurchase(selectedPlugin)}
        />
      )}

      {/* Purchase Modal */}
      {purchasePlugin && (
        <ProductPurchaseModal
          isOpen={!!purchasePlugin}
          onClose={() => setPurchasePlugin(null)}
          product={purchasePlugin}
        />
      )}
    </div>
  );
}
