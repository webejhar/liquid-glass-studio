import { motion } from "framer-motion";
import { useState } from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { ProductPurchaseModal } from "@/components/ProductPurchaseModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  const handlePurchase = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setIsPurchaseModalOpen(true);
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
          {sortedProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="glass-card rounded-2xl overflow-hidden hover:scale-105 transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
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
                    onClick={() => handlePurchase(product)}
                    variant="liquid"
                    size="sm"
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedProduct && (
          <ProductPurchaseModal
            isOpen={isPurchaseModalOpen}
            onClose={() => {
              setIsPurchaseModalOpen(false);
              setSelectedProduct(null);
            }}
            product={selectedProduct}
          />
        )}
      </div>
    </div>
  );
}
