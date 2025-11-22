import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, Package, ShoppingCart, Upload, Save, Calendar, DollarSign, CreditCard, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const professions = [
  "Developer",
  "Designer",
  "Marketing Specialist",
  "Business Owner",
  "Content Creator",
  "Consultant",
  "Freelancer",
  "Student",
  "Teacher",
  "Sales Professional",
  "Project Manager",
  "Data Analyst",
  "Engineer",
  "Writer",
  "Photographer",
  "Videographer",
  "Entrepreneur",
  "Artist",
  "Accountant",
  "Other"
];

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  address: string | null;
  profession: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface Order {
  id: string;
  type: 'product' | 'domain';
  name: string;
  date: string;
  price: number;
  payment_method: string;
  status: string;
  quantity?: number;
}

export default function Account() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortBy, setSortBy] = useState<string>("date-desc");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    profession: "",
    phone: "",
    avatar_url: ""
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
    await loadProfile(user.id);
    await loadOrders(user.id);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading profile:", error);
      return;
    }

    if (data) {
      setProfile(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        address: data.address || "",
        profession: data.profession || "",
        phone: data.phone || "",
        avatar_url: data.avatar_url || ""
      });
    }
  };

  const loadOrders = async (userId: string) => {
    const [{ data: productOrders }, { data: domainOrders }] = await Promise.all([
      supabase.from("product_orders").select("*").eq("user_id", userId),
      supabase.from("domain_orders").select("*").eq("user_id", userId)
    ]);

    const allOrders: Order[] = [
      ...(productOrders || []).map(order => ({
        id: order.id,
        type: 'product' as const,
        name: order.product_name,
        date: order.created_at,
        price: order.product_price,
        payment_method: order.payment_method,
        status: order.status,
        quantity: 1
      })),
      ...(domainOrders || []).map(order => ({
        id: order.id,
        type: 'domain' as const,
        name: `${order.domain_name}.${order.tld}`,
        date: order.created_at,
        price: 0, // Domain prices not stored
        payment_method: order.payment_method,
        status: order.status,
        quantity: 1
      }))
    ];

    setOrders(sortOrders(allOrders, sortBy));
  };

  const sortOrders = (ordersList: Order[], sortType: string) => {
    const sorted = [...ordersList];
    switch (sortType) {
      case "date-desc":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "date-asc":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      default:
        return sorted;
    }
  };

  useEffect(() => {
    setOrders(prev => sortOrders(prev, sortBy));
  }, [sortBy]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...formData
        });

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await loadProfile(user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearCart();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-premium border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-glow">
            Webejhar
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-glow">My Account</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="glass-premium mb-8 p-1">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="cart" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Cart ({cart.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Package className="w-4 h-4" />
                Order History
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-premium p-8 rounded-2xl"
              >
                <div className="flex items-start gap-8 mb-8">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {formData.name ? getInitials(formData.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{formData.name || "User"}</h2>
                    <p className="text-muted-foreground mb-4">{formData.email}</p>
                    
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="liquid">
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profession">Profession</Label>
                    <Select
                      value={formData.profession}
                      onValueChange={(value) => setFormData({ ...formData, profession: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select profession" />
                      </SelectTrigger>
                      <SelectContent>
                        {professions.map((prof) => (
                          <SelectItem key={prof} value={prof}>
                            {prof}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 mt-8">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      variant="liquid"
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        if (profile) {
                          setFormData({
                            name: profile.name || "",
                            email: profile.email || "",
                            address: profile.address || "",
                            profession: profile.profession || "",
                            phone: profile.phone || "",
                            avatar_url: profile.avatar_url || ""
                          });
                        }
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Cart Tab */}
            <TabsContent value="cart">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-premium p-8 rounded-2xl"
              >
                <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Your cart is empty</p>
                    <Button onClick={() => navigate("/shop")} variant="liquid">
                      Go to Shop
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="glass-subtle p-4 rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">${item.price}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          ${cart.reduce((sum, item) => sum + item.price, 0)}
                        </span>
                      </div>
                      <Button onClick={() => navigate("/shop")} variant="liquid" className="w-full">
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-premium p-8 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Order History</h2>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                      <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="glass-subtle p-6 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{order.name}</h3>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(order.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {order.payment_method}
                              </span>
                              {order.price > 0 && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ${order.price}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === "completed"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
