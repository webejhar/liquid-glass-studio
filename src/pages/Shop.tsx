import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ShoppingCart, Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const products = [
  ...Array(20).fill(null).map((_, i) => ({
    id: i + 1,
    name: `Premium Elementor Plugin ${i + 1}`,
    price: 29 + (i * 5),
    category: "Plugin",
    description: "Advanced features for Elementor Pro",
  })),
  ...Array(20).fill(null).map((_, i) => ({
    id: i + 21,
    name: `Premium Theme ${i + 1}`,
    price: 49 + (i * 10),
    category: "Theme",
    description: "Beautiful WordPress theme",
  })),
];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Plugin" | "Theme">("All");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(10);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Load user and favorites
  useEffect(() => {
    const loadFavorites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      if (user) {
        const { data } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', user.id);

        if (data) {
          setFavorites(data.map(f => f.product_id));
        }
      }
    };

    loadFavorites();
  }, []);

  // Filter by category
  const filteredByCategory = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Filter by search
  const filteredProducts = filteredByCategory.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  // Paginated products
  const displayedProducts = sortedProducts.slice(0, displayCount);

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleFavorite = async (product: typeof products[0]) => {
    if (!userId) {
      toast.error("Please login to add favorites");
      navigate("/login");
      return;
    }

    const isFavorite = favorites.includes(product.id);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', product.id);

        if (error) throw error;
        setFavorites(favorites.filter(id => id !== product.id));
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: userId,
            product_id: product.id,
            product_name: product.name,
            product_price: product.price,
            product_category: product.category,
            product_description: product.description
          });

        if (error) {
          if (error.code === '23505') {
            toast.info("Already in favorites");
            return;
          }
          throw error;
        }
        setFavorites([...favorites, product.id]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  return (
    <div className="min-h-screen pt-32 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Premium <span className="text-primary">Shop</span>
        </motion.h1>
        <motion.p
          className="text-center text-muted-foreground mb-12 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          High-quality themes and plugins for WordPress
        </motion.p>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products, themes, plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-card pl-12 pr-4 py-6 text-lg"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {["All", "Plugin", "Theme"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`glass-card px-6 py-2 rounded-full transition ${
                  selectedCategory === cat ? "bg-primary/20 border-primary" : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px] glass-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="glass-card rounded-2xl overflow-hidden hover:scale-105 transition relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Favorite Button */}
              <button
                onClick={() => handleToggleFavorite(product)}
                className="absolute top-4 right-4 z-10 glass-button p-2 rounded-full hover:scale-110 transition"
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.includes(product.id)
                      ? "fill-red-500 text-red-500"
                      : "text-foreground"
                  }`}
                />
              </button>

              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-6xl font-bold opacity-50">
                  {product.category === "Plugin" ? "P" : "T"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    variant="liquid"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {displayCount < sortedProducts.length && (
          <div className="mt-12 text-center">
            <Button
              onClick={loadMore}
              variant="hero"
              size="lg"
              className="px-12"
            >
              See More Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
