import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, Package, ShoppingCart, Upload, Save, Calendar, DollarSign, CreditCard, Filter, Shield, CheckCircle, XCircle, Clock } from "lucide-react";
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
  bio: string | null;
  date_of_birth: string | null;
  nid_url: string | null;
  verification_status: string | null;
  verification_notes: string | null;
  face_verification_url: string | null;
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
  const [headerVisible, setHeaderVisible] = useState(true);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingNID, setUploadingNID] = useState(false);
  const [uploadingFace, setUploadingFace] = useState(false);
  const lastScrollY = useRef(0);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const nidInputRef = useRef<HTMLInputElement>(null);
  const faceInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    profession: "",
    phone: "",
    avatar_url: "",
    bio: "",
    date_of_birth: "",
    nid_url: "",
    verification_status: "unverified",
    verification_notes: "",
    face_verification_url: ""
  });

  useEffect(() => {
    checkUser();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        avatar_url: data.avatar_url || "",
        bio: data.bio || "",
        date_of_birth: data.date_of_birth || "",
        nid_url: data.nid_url || "",
        verification_status: data.verification_status || "unverified",
        verification_notes: data.verification_notes || "",
        face_verification_url: data.face_verification_url || ""
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

  const handleFileUpload = async (file: File, bucket: string, folder: string) => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

    const { error, data } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Upload failed: " + error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfilePic(true);
    const url = await handleFileUpload(file, 'profile-pictures', 'avatars');
    if (url) {
      setFormData({ ...formData, avatar_url: url });
      toast.success("Profile picture uploaded!");
    }
    setUploadingProfilePic(false);
  };

  const handleNIDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNID(true);
    const url = await handleFileUpload(file, 'nid-documents', 'nid');
    if (url) {
      setFormData({ ...formData, nid_url: url });
      toast.success("NID document uploaded!");
    }
    setUploadingNID(false);
  };

  const handleFaceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFace(true);
    const url = await handleFileUpload(file, 'nid-documents', 'face');
    if (url) {
      setFormData({ ...formData, face_verification_url: url });
      toast.success("Face verification image uploaded!");
    }
    setUploadingFace(false);
  };

  const handleVerifyAccount = async () => {
    if (!formData.nid_url || !formData.face_verification_url) {
      toast.error("Please upload both NID and face verification images");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          verification_status: "pending",
          verification_notes: "Verification documents submitted. Awaiting admin review."
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Verification request submitted! We'll review it shortly.");
      await loadProfile(user.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit verification");
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationBadge = () => {
    switch (formData.verification_status) {
      case "verified":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Verified</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">Pending</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/20 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">Unverified</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header - Hide/Show on Scroll */}
      <AnimatePresence>
        {headerVisible && (
          <motion.header
            className="glass-premium border-b border-white/10 fixed top-0 left-0 right-0 z-50"
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-glow">
                Webejhar
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl pt-24">
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
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-primary/20">
                      <AvatarImage src={formData.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {formData.name ? getInitials(formData.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <input
                          ref={profilePicInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePicUpload}
                        />
                        <Button
                          onClick={() => profilePicInputRef.current?.click()}
                          disabled={uploadingProfilePic}
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{formData.name || "User"}</h2>
                      {getVerificationBadge()}
                    </div>
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
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="avatar_url">Avatar URL (Optional - Use upload button above)</Label>
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

                {/* Verification Section */}
                {!isEditing && (
                  <div className="mt-8 p-6 glass-subtle rounded-xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Account Verification
                    </h3>
                    
                    {formData.verification_status === "unverified" && (
                      <div className="space-y-4">
                        <p className="text-muted-foreground">
                          Verify your account to unlock additional features and build trust with the community.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label>Upload NID Card</Label>
                            <input
                              ref={nidInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleNIDUpload}
                            />
                            <Button
                              onClick={() => nidInputRef.current?.click()}
                              disabled={uploadingNID}
                              variant="outline"
                              className="w-full mt-2"
                            >
                              {uploadingNID ? "Uploading..." : formData.nid_url ? "Change NID" : "Upload NID"}
                            </Button>
                            {formData.nid_url && (
                              <p className="text-sm text-green-400 mt-1">✓ NID uploaded</p>
                            )}
                          </div>

                          <div>
                            <Label>Upload Face Verification</Label>
                            <input
                              ref={faceInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFaceUpload}
                            />
                            <Button
                              onClick={() => faceInputRef.current?.click()}
                              disabled={uploadingFace}
                              variant="outline"
                              className="w-full mt-2"
                            >
                              {uploadingFace ? "Uploading..." : formData.face_verification_url ? "Change Photo" : "Upload Photo"}
                            </Button>
                            {formData.face_verification_url && (
                              <p className="text-sm text-green-400 mt-1">✓ Face photo uploaded</p>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={handleVerifyAccount}
                          disabled={!formData.nid_url || !formData.face_verification_url || isLoading}
                          variant="liquid"
                          className="w-full"
                        >
                          {isLoading ? "Submitting..." : "Submit for Verification"}
                        </Button>
                      </div>
                    )}

                    {formData.verification_status === "pending" && (
                      <div className="text-center py-4">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <h4 className="text-lg font-semibold mb-2">Verification Pending</h4>
                        <p className="text-muted-foreground">
                          Your documents are being reviewed. We'll notify you once the process is complete.
                        </p>
                      </div>
                    )}

                    {formData.verification_status === "verified" && (
                      <div className="text-center py-4">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                        <h4 className="text-lg font-semibold mb-2">Account Verified</h4>
                        <p className="text-muted-foreground">
                          Your account has been successfully verified!
                        </p>
                      </div>
                    )}

                    {formData.verification_status === "rejected" && (
                      <div className="space-y-4">
                        <div className="text-center py-4">
                          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                          <h4 className="text-lg font-semibold mb-2">Verification Rejected</h4>
                          <p className="text-muted-foreground mb-4">
                            {formData.verification_notes || "Please review your documents and try again."}
                          </p>
                        </div>

                        <Button
                          onClick={() => {
                            setFormData({ ...formData, verification_status: "unverified" });
                          }}
                          variant="liquid"
                          className="w-full"
                        >
                          Resubmit Verification
                        </Button>
                      </div>
                    )}
                  </div>
                )}

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
                            avatar_url: profile.avatar_url || "",
                            bio: profile.bio || "",
                            date_of_birth: profile.date_of_birth || "",
                            nid_url: profile.nid_url || "",
                            verification_status: profile.verification_status || "unverified",
                            verification_notes: profile.verification_notes || "",
                            face_verification_url: profile.face_verification_url || ""
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
