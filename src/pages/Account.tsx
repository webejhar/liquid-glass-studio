import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, Package, ShoppingCart, Upload, Save, Calendar, DollarSign, CreditCard, Filter, Shield, CheckCircle, XCircle, Clock, Heart, MessageCircle, FileText, Info, RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { ImageCropper } from "@/components/ImageCropper";
import { VerificationModal } from "@/components/VerificationModal";
import { SessionManager } from "@/components/SessionManager";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { NotificationsList } from "@/components/NotificationsList";

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
  payment_reference: string;
  status: string;
  quantity?: number;
  category?: string;
  buyer_name?: string;
  buyer_email: string;
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
  const [showCropper, setShowCropper] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  
  useSessionTracking();

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

    // Reload orders when window gains focus (user comes back to tab)
    const handleFocus = () => {
      if (user) {
        loadOrders(user.id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (!user) return;

    const productOrdersChannel = supabase
      .channel('user-product-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_orders'
        },
        () => {
          console.log('Product order changed, reloading...');
          loadOrders(user.id);
        }
      )
      .subscribe();

    const domainOrdersChannel = supabase
      .channel('user-domain-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'domain_orders'
        },
        () => {
          console.log('Domain order changed, reloading...');
          loadOrders(user.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productOrdersChannel);
      supabase.removeChannel(domainOrdersChannel);
    };
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
    await loadProfile(user.id);
    await loadOrders(user.id);
    await loadFavorites(user.id);
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
    try {
      // Get user's email
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email;

      if (!userEmail) {
        console.error("No user email found");
        return;
      }

      console.log('Loading orders for user:', userId, 'email:', userEmail);

      // Fetch orders by user_id OR by email
      const [{ data: productOrders, error: productError }, { data: domainOrders, error: domainError }] = await Promise.all([
        supabase
          .from("product_orders")
          .select("*")
          .or(`user_id.eq.${userId},buyer_email.eq.${userEmail}`)
          .order('created_at', { ascending: false }),
        supabase
          .from("domain_orders")
          .select("*")
          .or(`user_id.eq.${userId},buyer_email.eq.${userEmail}`)
          .order('created_at', { ascending: false })
      ]);

      if (productError) {
        console.error("Error loading product orders:", productError);
      }
      if (domainError) {
        console.error("Error loading domain orders:", domainError);
      }

      console.log('Product orders loaded:', productOrders?.length || 0);
      console.log('Domain orders loaded:', domainOrders?.length || 0);

      const allOrders: Order[] = [
        ...(productOrders || []).map(order => ({
          id: order.id,
          type: 'product' as const,
          name: order.product_name,
          date: order.created_at,
          price: order.product_price,
          payment_method: order.payment_method,
          payment_reference: order.payment_reference,
          status: order.status,
          quantity: 1,
          category: order.product_category,
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email
        })),
      ...(domainOrders || []).map(order => ({
        id: order.id,
        type: 'domain' as const,
        name: `${order.domain_name}.${order.tld}`,
        date: order.created_at,
        price: order.price || 0,
        payment_method: order.payment_method,
        payment_reference: order.payment_reference,
        status: order.status,
        quantity: 1,
        category: 'Domain',
        buyer_name: order.buyer_name,
        buyer_email: order.buyer_email
      }))
      ];

      console.log('Total orders:', allOrders.length);
      setOrders(sortOrders(allOrders, sortBy));
      
      if (allOrders.length === 0) {
        console.log('No orders found for this user');
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders. Please try refreshing.");
    }
  };

  const handleRefreshOrders = async () => {
    if (!user) return;
    setIsRefreshingOrders(true);
    await loadOrders(user.id);
    toast.success("Orders refreshed!");
    setTimeout(() => setIsRefreshingOrders(false), 500);
  };

  const loadFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const handleRemoveFavorite = async (productId: number) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      
      setFavorites(favorites.filter(f => f.product_id !== productId));
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    }
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
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            name: formData.name,
            email: formData.email,
            address: formData.address,
            profession: formData.profession,
            phone: formData.phone,
            avatar_url: formData.avatar_url,
            bio: formData.bio,
            date_of_birth: formData.date_of_birth,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            name: formData.name,
            email: formData.email,
            address: formData.address,
            profession: formData.profession,
            phone: formData.phone,
            avatar_url: formData.avatar_url,
            bio: formData.bio,
            date_of_birth: formData.date_of_birth
          });

        if (error) throw error;
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await loadProfile(user.id);
    } catch (error: any) {
      console.error("Save error:", error);
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusDisplay = (status: string) => {
    if (status === 'pending') return 'Pending';
    if (status === 'completed') return 'Confirmed';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    if (status === 'pending') return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'completed') return 'bg-green-500/20 text-green-400';
    if (status === 'cancelled') return 'bg-red-500/20 text-red-400';
    return 'bg-muted/20 text-muted-foreground';
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

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Check image dimensions
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (event) => {
      img.src = event.target?.result as string;
    };

    img.onload = () => {
      // If dimensions don't match exactly, show cropper
      if (img.width !== 1080 || img.height !== 1080) {
        setPendingImage(file);
        setShowCropper(true);
      } else {
        // If perfect size, upload directly
        uploadProfilePicture(file);
      }
    };

    reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async (file: File) => {
    setUploadingProfilePic(true);
    const url = await handleFileUpload(file, 'profile-pictures', 'avatars');
    if (url) {
      setFormData({ ...formData, avatar_url: url });
      toast.success("Profile picture uploaded!");
    }
    setUploadingProfilePic(false);
  };

  const handleCropComplete = async (croppedFile: File) => {
    await uploadProfilePicture(croppedFile);
    setPendingImage(null);
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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 max-w-7xl pt-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-glow">My Account</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="glass-premium mb-6 sm:mb-8 p-1 w-full grid grid-cols-3 sm:grid-cols-6 gap-1">
              <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="cart" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Cart</span> ({cart.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Order</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Fav</span> ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Notify</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Sessions</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-premium p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
                  <div className="relative shrink-0">
                    <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border-2 sm:border-4 border-primary/20">
                      <AvatarImage src={formData.avatar_url} />
                      <AvatarFallback className="text-lg sm:text-xl lg:text-2xl">
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
                          className="absolute bottom-0 right-0 rounded-full w-7 h-7 sm:w-9 sm:h-9 p-0"
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold break-words mb-2 sm:mb-3">{formData.name || "User"}</h2>
                    
                    <div className="mb-2 sm:mb-3 flex justify-center sm:justify-start">
                      {formData.verification_status === 'verified' ? (
                        <div className="inline-flex items-center gap-1 sm:gap-1.5 lg:gap-2 px-2 sm:px-2.5 lg:px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                          <span className="text-xs sm:text-sm font-semibold">Verified</span>
                        </div>
                      ) : formData.verification_status === 'pending' ? (
                        <div className="inline-flex items-center gap-1 sm:gap-1.5 lg:gap-2 px-2 sm:px-2.5 lg:px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                          <span className="text-xs sm:text-sm font-semibold">Pending Review</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowVerificationModal(true)}
                          className="inline-flex items-center gap-1 sm:gap-1.5 lg:gap-2 px-2 sm:px-2.5 lg:px-3 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                        >
                          <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                          <span className="text-xs sm:text-sm font-semibold">Unverified</span>
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-3 sm:mb-4 break-words">{formData.email}</p>
                    
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="liquid" className="text-xs sm:text-sm lg:text-base w-full sm:w-auto">
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="name" className="text-xs sm:text-sm">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs sm:text-sm">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profession" className="text-xs sm:text-sm">Profession</Label>
                    <Select
                      value={formData.profession}
                      onValueChange={(value) => setFormData({ ...formData, profession: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1.5 sm:mt-2 text-sm sm:text-base">
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

                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="text-xs sm:text-sm">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                      rows={3}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="bio" className="text-xs sm:text-sm">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth" className="text-xs sm:text-sm">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="avatar_url" className="text-xs sm:text-sm">Avatar URL (Optional - Use upload button above)</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1.5 sm:mt-2 text-sm sm:text-base"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      variant="liquid"
                      className="gap-2 text-sm sm:text-base w-full sm:w-auto"
                    >
                      <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                      className="text-sm sm:text-base w-full sm:w-auto"
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
                className="glass-premium p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shopping Cart</h2>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">Your cart is empty</p>
                    <Button onClick={() => navigate("/shop")} variant="liquid" className="text-sm sm:text-base">
                      Go to Shop
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="glass-subtle p-3 sm:p-4 rounded-lg sm:rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary text-sm sm:text-base">${item.price}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-white/10 pt-3 sm:pt-4 mt-3 sm:mt-4">
                      <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <span className="text-base sm:text-lg font-semibold">Total:</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary">
                          ${cart.reduce((sum, item) => sum + item.price, 0)}
                        </span>
                      </div>
                      <Button onClick={() => navigate("/shop")} variant="liquid" className="w-full text-sm sm:text-base">
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
                className="glass-premium p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold">Order History</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                      onClick={handleRefreshOrders}
                      disabled={isRefreshingOrders}
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm">
                        <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                    <p className="text-sm sm:text-base text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="glass-subtle p-4 sm:p-6 rounded-lg sm:rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-base sm:text-lg break-words flex-1">{order.name}</h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setShowOrderDetails(true);
                                }}
                              >
                                <Info className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(order.date)}
                              </span>
                              <span className="flex items-center gap-1 truncate">
                                <CreditCard className="w-3 h-3" />
                                <span className="truncate">{order.payment_method}</span>
                              </span>
                              {order.price > 0 && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ${order.price}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {getStatusDisplay(order.status)}
                              </span>
                              {order.category && (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs bg-muted/10 text-muted-foreground">
                                  {order.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-premium p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Favorite Products</h2>
                
                {favorites.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">No favorites yet</p>
                    <Button onClick={() => navigate("/shop")} variant="liquid" className="text-sm sm:text-base">
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {favorites.map((favorite) => (
                      <motion.div
                        key={favorite.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-subtle p-3 sm:p-4 rounded-lg sm:rounded-xl"
                      >
                        <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center rounded-lg mb-3 sm:mb-4">
                          <span className="text-3xl sm:text-4xl font-bold opacity-50">
                            {favorite.product_category === "Plugin" ? "P" : "T"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2 truncate">{favorite.product_name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                          {favorite.product_description}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-lg sm:text-xl font-bold text-primary">
                            ${favorite.product_price}
                          </span>
                          <Button
                            onClick={() => handleRemoveFavorite(favorite.product_id)}
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-premium p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Notifications</h2>
                <NotificationsList />
              </motion.div>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <SessionManager />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && pendingImage && (
        <ImageCropper
          isOpen={showCropper}
          onClose={() => {
            setShowCropper(false);
            setPendingImage(null);
          }}
          imageFile={pendingImage}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        profileId={profile?.id || ""}
        onVerificationComplete={() => {
          if (user) {
            loadProfile(user.id);
          }
        }}
      />

      {/* Order Details Modal */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="glass-premium max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 sm:space-y-6">
              <div className="glass-subtle p-4 rounded-lg space-y-3">
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Product/Service</Label>
                  <p className="font-semibold text-sm sm:text-base mt-1">{selectedOrder.name}</p>
                </div>
                
                {selectedOrder.category && (
                  <div>
                    <Label className="text-xs sm:text-sm text-muted-foreground">Category</Label>
                    <p className="font-semibold text-sm sm:text-base mt-1">{selectedOrder.category}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Order Status</Label>
                  <div className="mt-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusDisplay(selectedOrder.status)}
                    </span>
                  </div>
                </div>
                
                {selectedOrder.price > 0 && (
                  <div>
                    <Label className="text-xs sm:text-sm text-muted-foreground">Amount</Label>
                    <p className="font-bold text-lg sm:text-xl text-primary mt-1">${selectedOrder.price}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Payment Method</Label>
                  <p className="font-semibold text-sm sm:text-base mt-1 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {selectedOrder.payment_method}
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Payment Reference</Label>
                  <p className="font-mono text-xs sm:text-sm bg-background/50 p-2 rounded mt-1 break-all">
                    {selectedOrder.payment_reference}
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Order Date & Time</Label>
                  <p className="font-semibold text-sm sm:text-base mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDateTime(selectedOrder.date)}
                  </p>
                </div>
                
                {selectedOrder.buyer_name && (
                  <div>
                    <Label className="text-xs sm:text-sm text-muted-foreground">Buyer Name</Label>
                    <p className="font-semibold text-sm sm:text-base mt-1">{selectedOrder.buyer_name}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Buyer Email</Label>
                  <p className="font-semibold text-sm sm:text-base mt-1 break-all">{selectedOrder.buyer_email}</p>
                </div>
                
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Order ID</Label>
                  <p className="font-mono text-xs bg-background/50 p-2 rounded mt-1 break-all">
                    {selectedOrder.id}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => setShowOrderDetails(false)}
                  variant="outline"
                  className="w-full text-sm sm:text-base"
                >
                  Close
                </Button>
                <a
                  href="https://wa.me/01340125311"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="liquid" className="w-full text-sm sm:text-base gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Support
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Contact Button */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-6 sm:pb-8">
        <a
          href="https://wa.me/01340125311"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Button variant="liquid" className="w-full text-sm sm:text-base lg:text-lg gap-2 sm:gap-3 py-4 sm:py-5 lg:py-6">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Contact Us on WhatsApp
          </Button>
        </a>
      </div>
    </div>
  );
}
