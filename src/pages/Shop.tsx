import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingCart, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PluginDetailsModal } from "@/components/PluginDetailsModal";
import { ProductPurchaseModal } from "@/components/ProductPurchaseModal";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
// Default plugins removed - all products come from database now
const defaultPlugins: any[] = [];

// Filter options
const filterOptions = {
  categories: ["All", "Plugin", "Theme", "Template", "Add-on", "Extension"],
  priceRanges: [
    { label: "Under $50", min: 0, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "Over $200", min: 200, max: Infinity }
  ],
  tags: ["WordPress", "Page Builder", "Multi-vendor", "Marketplace", "Drag & Drop", "WooCommerce", "SEO", "E-commerce", "LMS", "Membership"],
  features: ["Lifetime Updates", "Premium Support", "Documentation", "Video Tutorials", "Money Back Guarantee", "Multi-site License"],
  compatibility: ["WordPress 6.0+", "PHP 8.0+", "WooCommerce Compatible", "Gutenberg Ready", "WPML Compatible"],
  ratings: ["5 Stars", "4+ Stars", "3+ Stars"],
  sortOptions: ["Newest", "Price: Low to High", "Price: High to Low", "Popular", "Best Rated"]
};

export default function Shop() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [purchasePlugin, setPurchasePlugin] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    tags: false,
    features: false,
    compatibility: false,
    sort: false
  });

  // Load products from database
  useEffect(() => {
    loadProducts();
    loadFavorites();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Combine database products with default plugins
      const dbProducts = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.sale_price || p.price,
        originalPrice: p.sale_price ? p.price : null,
        category: p.category || "Plugin",
        description: p.description || "",
        image: p.images?.[0] || null,
        tags: p.tags || [],
        images: p.images || [],
        isDatabase: true
      }));

      setProducts([...defaultPlugins, ...dbProducts]);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts(defaultPlugins);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesTags = selectedTags.length === 0 || 
                       (product.tags && selectedTags.some(tag => product.tags.includes(tag)));
    
    return matchesSearch && matchesCategory && matchesPrice && matchesTags;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "Price: Low to High": return a.price - b.price;
      case "Price: High to Low": return b.price - a.price;
      case "Popular": return (b.id || 0) - (a.id || 0);
      default: return 0;
    }
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

    const productId = typeof plugin.id === 'string' ? parseInt(plugin.id.slice(0, 8), 16) % 1000000 : plugin.id;
    const isFavorite = favoriteIds.includes(productId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        
        setFavoriteIds(favoriteIds.filter(id => id !== productId));
        toast({ title: "Removed from favorites" });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
            product_name: plugin.name,
            product_price: plugin.price,
            product_category: plugin.category,
            product_description: plugin.description
          });

        if (error) throw error;
        
        setFavoriteIds([...favoriteIds, productId]);
        toast({ title: "Added to favorites" });
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSelectedTags([]);
    setPriceRange([0, 500]);
    setSelectedFeatures([]);
    setSortBy("Newest");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 px-3 sm:px-4 pb-20 w-full max-w-full overflow-x-hidden">
      <SEOHead title="Shop" description="Browse premium WordPress plugins, themes, and digital products." />
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Premium <span className="text-primary">Products</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Professional WordPress plugins and themes to power your business
          </p>
        </motion.div>

        {/* Search Bar and Filter Toggle */}
        <div className="mb-6 sm:mb-8 w-full flex flex-col sm:flex-row gap-3">
          <div className="relative glass-card p-1 rounded-full flex-1">
            <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-10 sm:px-14 py-3 sm:py-4 outline-none text-sm sm:text-base"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="glass-button px-4 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition sm:hidden"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedTags.length > 0 || selectedCategory !== "All") && (
              <Badge className="bg-primary text-primary-foreground">{selectedTags.length + (selectedCategory !== "All" ? 1 : 0)}</Badge>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden sm:block w-64 shrink-0">
            <div className="glass-card rounded-xl p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('category')}
                  className="flex items-center justify-between w-full py-2 font-medium"
                >
                  Category
                  {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.category && (
                  <div className="space-y-2 mt-2">
                    {filterOptions.categories.map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedCategory === cat}
                          onCheckedChange={() => setSelectedCategory(cat)}
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Filter */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('price')}
                  className="flex items-center justify-between w-full py-2 font-medium"
                >
                  Price Range
                  {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.price && (
                  <div className="mt-2">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={500}
                      step={10}
                      className="my-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Filter */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('tags')}
                  className="flex items-center justify-between w-full py-2 font-medium"
                >
                  Tags
                  {expandedSections.tags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filterOptions.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Features Filter */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('features')}
                  className="flex items-center justify-between w-full py-2 font-medium"
                >
                  Features
                  {expandedSections.features ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.features && (
                  <div className="space-y-2 mt-2">
                    {filterOptions.features.map(feature => (
                      <label key={feature} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={selectedFeatures.includes(feature)}
                          onCheckedChange={() => {
                            setSelectedFeatures(prev =>
                              prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
                            );
                          }}
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort */}
              <div>
                <button
                  onClick={() => toggleSection('sort')}
                  className="flex items-center justify-between w-full py-2 font-medium"
                >
                  Sort By
                  {expandedSections.sort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedSections.sort && (
                  <div className="space-y-2 mt-2">
                    {filterOptions.sortOptions.map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={sortBy === option}
                          onCheckedChange={() => setSortBy(option)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="fixed inset-0 z-50 sm:hidden"
              >
                <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button onClick={clearFilters} className="text-sm text-primary hover:underline mb-4">
                    Clear All Filters
                  </button>

                  {/* Category */}
                  <div className="mb-4">
                    <p className="font-medium mb-2">Category</p>
                    <div className="space-y-2">
                      {filterOptions.categories.map(cat => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={selectedCategory === cat}
                            onCheckedChange={() => setSelectedCategory(cat)}
                          />
                          <span className="text-sm">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="font-medium mb-2">Price Range</p>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={500}
                      step={10}
                      className="my-4"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <p className="font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full glass-button py-3 rounded-lg mt-4"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {sortedProducts.length} products
                </p>
                
                {/* Responsive Grid: Desktop 5, Tablet 3, Mobile 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  {sortedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card rounded-xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer relative group"
                      onClick={() => setSelectedPlugin(product)}
                    >
                      <div className="relative aspect-[4/3]">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl font-bold opacity-50">
                              {product.name[0]}
                            </span>
                          </div>
                        )}
                        
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(product);
                          }}
                          className="absolute top-2 right-2 glass-button p-1.5 sm:p-2 rounded-full hover:scale-110 transition z-10"
                        >
                          <Heart
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              favoriteIds.includes(typeof product.id === 'string' ? parseInt(product.id.slice(0, 8), 16) % 1000000 : product.id)
                                ? "fill-red-500 text-red-500"
                                : "text-foreground"
                            }`}
                          />
                        </button>

                        {/* Sale Badge */}
                        {product.originalPrice && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                            Sale
                          </Badge>
                        )}
                      </div>
                      
                      <div className="p-2 sm:p-3 lg:p-4">
                        <h3 className="text-sm sm:text-base font-bold truncate mb-1">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base sm:text-lg font-bold text-primary">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-xs line-through text-muted-foreground">${product.originalPrice}</span>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(product);
                          }}
                          className="w-full glass-button px-2 py-1.5 sm:py-2 rounded-lg hover:scale-105 transition flex items-center justify-center gap-1 text-xs sm:text-sm"
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                          Buy
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {sortedProducts.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
                    <button onClick={clearFilters} className="text-primary hover:underline mt-2">
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
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
