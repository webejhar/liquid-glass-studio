import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CustomCursor } from "@/components/CustomCursor";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Cart } from "@/components/Cart";
import { CartProvider } from "@/contexts/CartContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Meeting from "./pages/Meeting";
import EmailGenerator from "./pages/EmailGenerator";
import ImageGenerator from "./pages/ImageGenerator";
import ImageEnhancer from "./pages/ImageEnhancer";
import Blog from "./pages/Blog";
import Testimonials from "./pages/Testimonials";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMeetings from "./pages/admin/AdminMeetings";
import AdminVerification from "./pages/admin/AdminVerification";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminContacts from "./pages/admin/AdminContacts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner position="bottom-left" />
        <BrowserRouter>
          <CustomCursor />
          <AnimatedBackground />
          <div className="relative z-10">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/meeting" element={<Meeting />} />
              <Route path="/email-generator" element={<EmailGenerator />} />
              <Route path="/image-generator" element={<ImageGenerator />} />
              <Route path="/image-enhancer" element={<ImageEnhancer />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/account" element={<Account />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/meetings" element={<AdminMeetings />} />
              <Route path="/admin/verification" element={<AdminVerification />} />
              <Route path="/admin/roles" element={<AdminRoles />} />
              <Route path="/admin/contacts" element={<AdminContacts />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <Cart />
          </div>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
